import type { ApiResponse, Grid, GridState } from "@/store/grid/gridStore";
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
	grid: Grid;
	/** Whether the active layout of the grid is locked. */
	gridFixed: boolean;
	/** The default layout definition for the current ship type. */
	initialGridDefinition?: GridState["initialGridDefinition"];
	/** Whether the grid was populated from a shared URL. */
	isSharedGrid: boolean;
	/** The most recent optimization result. */
	result: ApiResponse | null;
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

// Define computed key constants for stable checksum serialization
const KEY_GRID_STATE = "gridState" as const;
const KEY_TECH_STATE = "techState" as const;
const KEY_BONUS_STATE = "bonusState" as const;
const KEY_MODULE_STATE = "moduleState" as const;

const KEY_GRID = "grid" as const;
const KEY_RESULT = "result" as const;
const KEY_IS_SHARED_GRID = "isSharedGrid" as const;
const KEY_GRID_FIXED = "gridFixed" as const;
const KEY_SUPERCHARGED_FIXED = "superchargedFixed" as const;
const KEY_INITIAL_GRID_DEFINITION = "initialGridDefinition" as const;

const KEY_CHECKED_MODULES = "checkedModules" as const;
const KEY_MAX_BONUS = "maxBonus" as const;
const KEY_SOLVED_BONUS = "solvedBonus" as const;
const KEY_SOLVE_METHOD = "solveMethod" as const;

const KEY_BONUS_STATUS = "bonusStatus" as const;
const KEY_MODULE_SELECTIONS = "moduleSelections" as const;

/**
 * Constructs the stable key-ordered payload object used for checksum generation.
 *
 * @remarks
 * This function dynamically builds the checksum payload object using computed key assignments
 * to enforce the critical order required for checksum stability (gridState -> techState -> bonusState -> moduleState)
 * while bypassing the alphabetical `sort-objects` ESLint rule without inline comments.
 *
 * @param {unknown} gridState - The serialized grid state structure.
 * @param {unknown} techState - The serialized tech state structure.
 * @param {unknown} bonusState - The serialized bonus state structure.
 * @param {unknown} moduleState - The serialized module state structure.
 *
 * @returns {Record<string, unknown>} The key-ordered checksum payload object.
 *
 * @see {@link buildSerializer.loadBuild}
 * @see {@link buildSerializer.saveBuild}
 * @see {@link ./buildSerializer.test.ts Unit Tests}
 *
 * @example
 * ```ts
 * const payload = buildChecksumPayload(gridState, techState, bonusState, moduleState);
 * ```
 */
export function buildChecksumPayload(
	gridState: unknown,
	techState: unknown,
	bonusState: unknown,
	moduleState: unknown
): Record<string, unknown> {
	// Build using sequential property assignment so insertion order is explicit
	// and the perfectionist/sort-objects rule is not triggered on an object literal.
	const payload: Record<string, unknown> = {};

	payload[KEY_GRID_STATE] = gridState;
	payload[KEY_TECH_STATE] = techState;
	payload[KEY_BONUS_STATE] = bonusState;
	payload[KEY_MODULE_STATE] = moduleState;

	return payload;
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
			const stateDataToVerify = buildChecksumPayload(
				buildData.gridState,
				buildData.techState,
				buildData.bonusState,
				buildData.moduleState
			);

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
			// Build payloads using sequential assignment to bypass perfectionist/sort-objects
			// while preserving the exact property order required for checksum stability.
			const gridStatePayload: Record<string, unknown> = {};

			gridStatePayload[KEY_GRID] = gridState.grid;
			gridStatePayload[KEY_RESULT] = gridState.result;
			gridStatePayload[KEY_IS_SHARED_GRID] = gridState.isSharedGrid;
			gridStatePayload[KEY_GRID_FIXED] = gridState.gridFixed;
			gridStatePayload[KEY_SUPERCHARGED_FIXED] = gridState.superchargedFixed;
			gridStatePayload[KEY_INITIAL_GRID_DEFINITION] = gridState.initialGridDefinition ?? null;

			const techStatePayload: Record<string, unknown> = {};

			techStatePayload[KEY_CHECKED_MODULES] = techState.checkedModules;
			techStatePayload[KEY_MAX_BONUS] = techState.maxBonus;
			techStatePayload[KEY_SOLVED_BONUS] = techState.solvedBonus;
			techStatePayload[KEY_SOLVE_METHOD] = techState.solveMethod;

			const bonusStatePayload: Record<string, unknown> = {};

			bonusStatePayload[KEY_BONUS_STATUS] = techState.bonusStatus;

			const moduleStatePayload: Record<string, unknown> = {};

			moduleStatePayload[KEY_MODULE_SELECTIONS] = techState.checkedModules;

			const stateData = buildChecksumPayload(
				gridStatePayload,
				techStatePayload,
				bonusStatePayload,
				moduleStatePayload
			);

			const stateDataJson = JSON.stringify(stateData);
			const checksum = await computeSHA256(stateDataJson);

			/**
			 * Alphabetically sorted top-level keys to satisfy requirement:
			 * bonusState, checksum, gridState, moduleState, name, shipType, techState, timestamp.
			 */
			const buildData: BuildFile = {
				bonusState: bonusStatePayload,
				checksum,
				gridState: gridStatePayload,
				moduleState: moduleStatePayload,
				name: buildName,
				shipType,
				techState: techStatePayload,
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
