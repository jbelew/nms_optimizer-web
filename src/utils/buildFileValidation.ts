/**
 * Validation utilities for application build files.
 *
 * @remarks
 * This module provides types and functions to ensure that build files
 * imported into or exported from the application conform to the expected
 * schema. It handles verification of state integrity and property presence.
 *
 * @category Utilities
 * @see {@link isValidBuildFile}
 */

/**
 * Type definition for a saved build file.
 *
 * @remarks
 * Stores the complete serialized state of the application's stores, including
 * grid configuration, technology choices, and optimization results.
 * This is the format used for saving/loading local `.nms` files.
 *
 * @category Utilities
 */
export type BuildFile = {
	/** The display name of the build. */
	name: string;
	/** The ship type classification (e.g., 'fighter', 'freighter'). */
	shipType: string;
	/** Unix timestamp when the build was saved. */
	timestamp: number;
	/** SHA-256 hash of the state data used for integrity verification. */
	checksum: string;
	/** Serialized state of the `GridStore`. */
	gridState: Record<string, unknown>;
	/** Serialized state of the `TechStore`. */
	techState: Record<string, unknown>;
	/** Serialized state of the `TechBonusStore`. */
	bonusState: Record<string, unknown>;
	/** Serialized state of the `ModuleSelectionStore`. */
	moduleState: Record<string, unknown>;
};

/**
 * Validates that an unknown object conforms to the `BuildFile` interface.
 *
 * @remarks
 * Performs a shallow property check and type verification for all required
 * fields in a build file. Logs detailed errors to the console if validation fails.
 *
 * @param {unknown} obj - The object to validate.
 * @returns {obj is BuildFile} `true` if the object is a valid `BuildFile`, otherwise `false`.
 * @category Utilities
 * @see {@link BuildFile}
 *
 * @example
 * ```ts
 * if (isValidBuildFile(parsedJson)) {
 *   console.log("Loading build:", parsedJson.name);
 * }
 * // returns true if valid
 * ```
 */
export function isValidBuildFile(obj: unknown): obj is BuildFile {
	if (typeof obj !== "object" || obj === null) {
		console.error("Validation Error: BuildFile is not an object or is null.", obj);

		return false;
	}

	const buildFile = obj as Record<string, unknown>;

	if (typeof buildFile.name !== "string") {
		console.error("Validation Error: BuildFile missing or invalid 'name' property.", buildFile);

		return false;
	}

	if (typeof buildFile.shipType !== "string") {
		console.error(
			"Validation Error: BuildFile missing or invalid 'shipType' property.",
			buildFile
		);

		return false;
	}

	if (typeof buildFile.timestamp !== "number") {
		console.error(
			"Validation Error: BuildFile missing or invalid 'timestamp' property.",
			buildFile
		);

		return false;
	}

	if (typeof buildFile.checksum !== "string") {
		console.error(
			"Validation Error: BuildFile missing or invalid 'checksum' property.",
			buildFile
		);

		return false;
	}

	if (typeof buildFile.gridState !== "object" || buildFile.gridState === null) {
		console.error(
			"Validation Error: BuildFile missing or invalid 'gridState' property.",
			buildFile
		);

		return false;
	}

	if (typeof buildFile.techState !== "object" || buildFile.techState === null) {
		console.error(
			"Validation Error: BuildFile missing or invalid 'techState' property.",
			buildFile
		);

		return false;
	}

	if (typeof buildFile.bonusState !== "object" || buildFile.bonusState === null) {
		console.error(
			"Validation Error: BuildFile missing or invalid 'bonusState' property.",
			buildFile
		);

		return false;
	}

	if (typeof buildFile.moduleState !== "object" || buildFile.moduleState === null) {
		console.error(
			"Validation Error: BuildFile missing or invalid 'moduleState' property.",
			buildFile
		);

		return false;
	}

	return true;
}
