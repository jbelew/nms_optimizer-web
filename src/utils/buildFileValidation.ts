/**
 * Type definition for a saved build file.
 *
 * Stores the complete serialized state of the application's stores, including
 * grid configuration, technology choices, and optimization results.
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
 * Performs a shallow property check and type verification for all required
 * fields in a build file.
 *
 * @param {unknown} obj - The object to validate.
 * @returns {obj is BuildFile} `true` if the object is a valid `BuildFile`, otherwise `false`.
 *
 * @example
 * if (isValidBuildFile(parsedJson)) {
 *   console.log("Loading build:", parsedJson.name);
 * }
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
