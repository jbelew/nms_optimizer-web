import type { BuildFile } from "@/utils/validation/dataValidation";

import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useModuleSelectionStore } from "@/store/tech/moduleSelectionStore";
import { useTechBonusStore } from "@/store/tech/techBonusStore";
import { useTechStore } from "@/store/tech/techStore";
import { computeSHA256 } from "@/utils/system/hashUtils";
import { isValidBuildFile, sanitizeFilename } from "@/utils/validation/dataValidation";

/**
 * Custom hook for managing build file operations (save/load).
 *
 * @remarks
 * This hook encapsulates the logic for serializing the application state
 * into a `.nms` build file and restoring state from a loaded file. It performs
 * validation on file type, size, JSON structure, and data integrity (checksum).
 *
 * @returns {object} An object containing `saveBuildToFile` and `loadBuildFromFile` functions.
 * @returns {Function} returns.saveBuildToFile - Serializes and downloads the current build.
 * @returns {Function} returns.loadBuildFromFile - Parses and restores a build from a file.
 *
 * @see {@link ./useBuildFileManager.test.ts Unit Tests}
 * @see {@link BuildFile} for the file structure definition.
 * @see {@link ../../utils/validation/dataValidation.ts Build File Validation}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { saveBuildToFile, loadBuildFromFile } = useBuildFileManager();
 * ```
 */
export const useBuildFileManager = () => {
	const shipTypes = useFetchShipTypesSuspense();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedPlatform = usePlatformStore((state) => state.setSelectedPlatform);

	/**
	 * Serializes the current application state and triggers a file download.
	 *
	 * @remarks
	 * This method gathers state from multiple stores (Grid, Tech, Bonus, ModuleSelection),
	 * calculates a SHA-256 checksum for integrity, and triggers a browser download
	 * of a `.nms` file.
	 *
	 * @param {string} buildName - The name to assign to the saved build.
	 *
	 * @returns {Promise<void>} Resolves when the file download is triggered.
	 *
	 * @throws {Error} If state serialization or file creation fails.
	 *
	 * @example
	 * ```typescript
	 * await saveBuildToFile("My Fighter Build");
	 * // triggers browser download
	 * ```
	 */
	const saveBuildToFile = async (buildName: string) => {
		try {
			// Get current state from all stores
			const gridState = useGridStore.getState();
			const techState = useTechStore.getState();
			const bonusState = useTechBonusStore.getState();
			const moduleState = useModuleSelectionStore.getState();

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
					max_bonus: techState.max_bonus,
					solved_bonus: techState.solved_bonus,
					solve_method: techState.solve_method,
				},
				bonusState: {
					bonusStatus: bonusState.bonusStatus,
				},
				moduleState: {
					moduleSelections: moduleState.moduleSelections,
				},
			};
			/* eslint-enable perfectionist/sort-objects */

			// Compute checksum of the state data
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
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const safeFilename = sanitizeFilename(buildName);
			link.download = `${safeFilename}.nms`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to save build file:", error);
			throw new Error("Failed to save build file", { cause: error });
		}
	};

	/**
	 * Parses a build file and restores the application state.
	 *
	 * @remarks
	 * This method reads a `.nms` file, validates its structure and integrity (checksum),
	 * and if valid, updates all application stores to reflect the saved state.
	 * It also handles switching the ship type if the build was saved for a different one.
	 *
	 * @param {File} file - The `.nms` file to load.
	 *
	 * @returns {Promise<void>} Resolves when state is restored.
	 *
	 * @throws {Error} If validation fails or the file is corrupt.
	 *
	 * @example
	 * ```typescript
	 * const file = event.target.files[0];
	 * await loadBuildFromFile(file);
	 * ```
	 */
	const loadBuildFromFile = async (file: File) => {
		try {
			// Performs validation on file type, size, JSON structure, and data integrity (checksum).
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

			// Validate build file structure
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

			// Validate shipType is supported
			const validShipTypes = Object.keys(shipTypes);

			if (!validShipTypes.includes(buildData.shipType)) {
				throw new Error(
					`Unsupported ship type: "${buildData.shipType}". Valid types are: ${validShipTypes.join(", ")}.`
				);
			}

			// If the shipType in the save file doesn't match the current shipType,
			// switch the app to the shipType from the save file
			if (buildData.shipType !== selectedShipType) {
				setSelectedPlatform(buildData.shipType, validShipTypes, true, true);
			}

			// Restore state from all stores
			useGridStore
				.getState()
				.restoreGridState({ ...buildData.gridState, buildName: buildData.name });

			useTechStore.setState(buildData.techState);
			useTechBonusStore.setState(buildData.bonusState);
			useModuleSelectionStore.setState(buildData.moduleState);
		} catch (error) {
			console.error("Failed to load build file:", error);
			throw error;
		}
	};

	return { loadBuildFromFile, saveBuildToFile };
};
