import type { BonusStatusData } from "@/store/tech/techStore";
import type { BuildFile } from "@/utils/validation/dataValidation";
import { startTransition } from "react";

import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { computeSHA256 } from "@/utils/system/hashUtils";
import { Logger } from "@/utils/system/monitoring";
import { isValidBuildFile, sanitizeFilename } from "@/utils/validation/dataValidation";

/**
 * Utility module for serializing and deserializing application build configurations.
 *
 * @remarks
 * This module provides functions to save the current optimizer state (grid, technology selection, etc.)
 * into a JSON-based `.nms` build file and to reload a saved build file back into the application stores.
 * It encapsulates validation logic, integrity checksums, platform transitioning, and store restoration
 * to keep UI hooks clean and decoupled from business serialization logic.
 *
 * @category Utilities
 */
export const buildSerializer = {
	/**
	 * Parses, validates, and loads a build configuration file, updating application state.
	 *
	 * @remarks
	 * This function parses the provided `.nms` file content, validates that the file conforms to size
	 * limits and file extension requirements, checks JSON structure validity, performs a checksum integrity
	 * verification, validates ship platform compatibility, and updates application stores inside a React
	 * transition.
	 *
	 * @param {File} file - The uploaded build file to parse and apply.
	 * @param {string[]} validShipTypes - Array of supported ship type identifiers used for compatibility validation.
	 *
	 * @returns {Promise<void>} A promise resolving when the state has been successfully restored.
	 *
	 * @throws {Error} If file type/extension is invalid, file exceeds size limit, content is empty or invalid JSON, structure is invalid, checksum fails, or ship type is unsupported.
	 *
	 * @see {@link isValidBuildFile}
	 * @see {@link usePlatformStore}
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 * @see {@link ./buildSerializer.test.ts Unit Tests}
	 *
	 * @example
	 * ```ts
	 * const file = event.target.files[0];
	 * const validShipTypes = ["fighter", "explorer", "shuttle"];
	 * await buildSerializer.loadBuild(file, validShipTypes);
	 * ```
	 */
	async loadBuild(file: File, validShipTypes: string[]): Promise<void> {
		try {
			if (!file.name.endsWith(".nms")) {
				throw new Error("Invalid file type. Please select a .nms build file.");
			}

			if (file.size > 10 * 1024 * 1024) {
				throw new Error("File is too large. Build files should be under 10MB.");
			}

			const text = await file.text();

			if (!text) {
				throw new Error("File is empty. Please select a valid build file.");
			}

			let buildData: BuildFile;

			try {
				buildData = JSON.parse(text);
			} catch (e) {
				throw new Error("File contains invalid JSON. The build file may be corrupted.", {
					cause: e,
				});
			}

			if (!isValidBuildFile(buildData)) {
				throw new Error(
					"The build file couldn’t be loaded. Please verify that you selected a valid NMS Optimizer build file. If the file was created before version 6.1, you may need to export it again using the latest version."
				);
			}

			/**
			 * CRITICAL: The order of keys in this object MUST match the order used during save.
			 * Checksums are sensitive to property order during stringification.
			 */
			/* eslint-disable perfectionist/sort-objects */
			const stateDataToVerify = {
				gridState: buildData.gridState,
				techState: buildData.techState,
				bonusState: buildData.bonusState,
				moduleState: buildData.moduleState,
			};
			/* eslint-enable perfectionist/sort-objects */

			const stateDataJson = JSON.stringify(stateDataToVerify);
			const computedChecksum = await computeSHA256(stateDataJson);

			if (computedChecksum !== buildData.checksum) {
				throw new Error(
					"Build file integrity check failed. The file may have been corrupted or tampered with."
				);
			}

			if (!validShipTypes.includes(buildData.shipType)) {
				throw new Error(
					`Unsupported ship type: "${buildData.shipType}". Valid types are: ${validShipTypes.join(", ")}.`
				);
			}

			const platformState = usePlatformStore.getState();

			if (buildData.shipType !== platformState.selectedPlatform) {
				platformState.setSelectedPlatform(buildData.shipType, validShipTypes, true, true);
			}

			startTransition(() => {
				useGridStore
					.getState()
					.restoreGridState({ ...buildData.gridState, buildName: buildData.name });

				useTechStore.setState({
					...buildData.techState,
					bonusStatus: (buildData.bonusState?.bonusStatus ?? {}) as Record<
						string,
						BonusStatusData
					>,
					checkedModules: (buildData.techState?.checkedModules ??
						buildData.moduleState?.moduleSelections ??
						{}) as { [key: string]: string[] },
				});
			});
		} catch (error) {
			Logger.error("Failed to load build file:", error);
			throw error;
		}
	},

	/**
	 * Serializes the current application state into a saveable build file content structure.
	 *
	 * @remarks
	 * This function retrieves the state from the grid, tech, and platform stores,
	 * assembles the stable key-ordered state object, computes a SHA-256 integrity checksum,
	 * formats it as a `BuildFile` structure, and returns it as a binary `Blob` and a sanitized filename.
	 *
	 * @param {string} buildName - The name to assign to the saved build configuration.
	 *
	 * @returns {Promise<{ blob: Blob; filename: string }>} A promise resolving to an object containing the serialised binary `Blob` and the `.nms` sanitized filename.
	 *
	 * @throws {Error} If state retrieval, SHA-256 computation, or JSON serialization fails.
	 *
	 * @see {@link useGridStore}
	 * @see {@link useTechStore}
	 * @see {@link usePlatformStore}
	 * @see {@link computeSHA256}
	 * @see {@link ./buildSerializer.test.ts Unit Tests}
	 *
	 * @example
	 * ```ts
	 * const { blob, filename } = await buildSerializer.saveBuild("My Fighter Layout");
	 * // returns { blob: Blob, filename: "My-Fighter-Layout.nms" }
	 * ```
	 */
	async saveBuild(buildName: string): Promise<{ blob: Blob; filename: string }> {
		try {
			const gridState = useGridStore.getState();
			const techState = useTechStore.getState();
			const platformState = usePlatformStore.getState();
			const selectedShipType = platformState.selectedPlatform;

			/**
			 * CRITICAL: The order of keys in this object MUST remain stable.
			 * Checksums for .nms files are calculated by stringifying this object.
			 * Changing the key order will break integrity checks for existing files.
			 */
			/* eslint-disable perfectionist/sort-objects */
			const stateData = {
				gridState: {
					grid: gridState.grid,
					result: gridState.result,
					isSharedGrid: gridState.isSharedGrid,
					gridFixed: gridState.gridFixed,
					superchargedFixed: gridState.superchargedFixed,
					initialGridDefinition: gridState.initialGridDefinition,
				},
				techState: {
					checkedModules: techState.checkedModules,
					maxBonus: techState.maxBonus,
					solvedBonus: techState.solvedBonus,
					solveMethod: techState.solveMethod,
				},
				bonusState: {
					bonusStatus: techState.bonusStatus,
				},
				moduleState: {
					moduleSelections: techState.checkedModules,
				},
			};
			/* eslint-enable perfectionist/sort-objects */

			const stateDataJson = JSON.stringify(stateData);
			const checksum = await computeSHA256(stateDataJson);

			const buildData: BuildFile = {
				checksum,
				name: buildName,
				shipType: selectedShipType,
				timestamp: Date.now(),
				...stateData,
			};

			const json = JSON.stringify(buildData, null, 2);
			const blob = new Blob([json], { type: "application/octet-stream" });
			const safeFilename = sanitizeFilename(buildName);
			const filename = `${safeFilename}.nms`;

			return { blob, filename };
		} catch (error) {
			Logger.error("Failed to serialize build configuration:", error);
			throw new Error("Failed to save build configuration", { cause: error });
		}
	},
};
