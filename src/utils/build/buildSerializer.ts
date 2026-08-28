import type { BonusStatusData } from "@/store/tech/techStore";
import type { BuildFile } from "@/utils/validation/dataValidation";

import { computeSHA256 } from "@/utils/system/hashUtils";
import { Logger } from "@/utils/system/monitoring";
import { isValidBuildFile, sanitizeFilename } from "@/utils/validation/dataValidation";

/**
 * Parameters for serializing the application state into a saveable build file.
 *
 * @category Utilities
 */
export interface SaveBuildParams {
	/** The display name of the build. */
	buildName: string;
	/** The serialized grid state parameters. */
	gridState: SaveBuildGridState;
	/** The ship type identifier. */
	shipType: string;
	/** The serialized tech state parameters. */
	techState: SaveBuildTechState;
}

/**
 * Grid state parameters required for saving a build configuration.
 *
 * @category Utilities
 */
interface SaveBuildGridState {
	/** The 2D grid of cells. */
	grid: unknown;
	/** Whether the active layout of the grid is locked. */
	gridFixed: boolean;
	/** The default layout definition for the current ship type. */
	initialGridDefinition?: unknown;
	/** Whether the grid was populated from a shared URL. */
	isSharedGrid: boolean;
	/** The most recent optimization result. */
	result: unknown;
	/** Whether the locations of supercharged slots are locked. */
	superchargedFixed: boolean;
}

/**
 * Tech state parameters required for saving a build configuration.
 *
 * @category Utilities
 */
interface SaveBuildTechState {
	/** Mapping of technology keys to their calculated status data. */
	bonusStatus: Record<string, BonusStatusData>;
	/** User-selected module IDs for each technology. */
	checkedModules: Record<string, string[]>;
	/** Mapping of technology keys to their theoretical maximum bonus. */
	maxBonus: Record<string, number>;
	/** Mapping of technology keys to their actual solved bonus. */
	solvedBonus: Record<string, number>;
	/** Mapping of technology keys to their solver method. */
	solveMethod: Record<string, string>;
}

/**
 * Utility module for serializing and deserializing application build configurations.
 *
 * @remarks
 * This module provides functions to save the current optimizer state (grid, technology selection, etc.)
 * into a JSON-based `.nms` build file and to parse and validate build content.
 * It is completely decoupled from React and Zustand store singletons, making it pure and easily testable.
 *
 * @category Utilities
 */
export const buildSerializer = {
	/**
	 * Parses and validates a build configuration JSON text.
	 *
	 * @remarks
	 * This function parses the provided JSON text, validates that it conforms to the `BuildFile` schema,
	 * performs a checksum integrity verification, and validates ship type compatibility.
	 *
	 * @param {string} text - The JSON text content of the build file.
	 * @param {string[]} validShipTypes - Array of supported ship type identifiers.
	 *
	 * @returns {Promise<BuildFile>} A promise resolving to the parsed and validated BuildFile object.
	 *
	 * @throws {Error} If text is empty or invalid JSON, structure is invalid, checksum fails, or ship type is unsupported.
	 *
	 * @see {@link isValidBuildFile}
	 * @see {@link ./buildSerializer.test.ts Unit Tests}
	 *
	 * @example
	 * ```ts
	 * const validShipTypes = ["fighter", "explorer", "shuttle"];
	 * const buildData = await buildSerializer.loadBuild(jsonText, validShipTypes);
	 * ```
	 */
	async loadBuild(text: string, validShipTypes: string[]): Promise<BuildFile> {
		try {
			if (!text || !text.trim()) {
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

			return buildData;
		} catch (error) {
			Logger.error("Failed to load build file:", error);
			throw error;
		}
	},

	/**
	 * Serializes the provided state parameters into a saveable build file content structure.
	 *
	 * @remarks
	 * This function assembles the stable key-ordered state object, computes a SHA-256 integrity checksum,
	 * formats it as a `BuildFile` structure with alphabetically sorted top-level keys,
	 * and returns it as a binary `Blob` and a sanitized filename.
	 *
	 * @param {SaveBuildParams} params - The parameters representing the build state to save.
	 *
	 * @returns {Promise<{ blob: Blob; filename: string }>} A promise resolving to the serialised binary `Blob` and the `.nms` sanitized filename.
	 *
	 * @throws {Error} If SHA-256 computation or JSON serialization fails.
	 *
	 * @see {@link computeSHA256}
	 * @see {@link ./buildSerializer.test.ts Unit Tests}
	 *
	 * @example
	 * ```ts
	 * const { blob, filename } = await buildSerializer.saveBuild({
	 *   buildName: "My Fighter Layout",
	 *   shipType: "fighter",
	 *   gridState,
	 *   techState,
	 * });
	 * ```
	 */
	async saveBuild(params: SaveBuildParams): Promise<{ blob: Blob; filename: string }> {
		try {
			const { buildName, gridState, shipType, techState } = params;

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

			/**
			 * Alphabetically sorted top-level keys to satisfy requirement:
			 * bonusState, checksum, gridState, moduleState, name, shipType, techState, timestamp.
			 */
			const buildData: BuildFile = {
				bonusState: stateData.bonusState,
				checksum,
				gridState: stateData.gridState,
				moduleState: stateData.moduleState,
				name: buildName,
				shipType,
				techState: stateData.techState,
				timestamp: Date.now(),
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
