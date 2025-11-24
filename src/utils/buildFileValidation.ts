/**
 * Type definition for a saved build file.
 * Stores the complete state of GridStore, TechStore, TechBonusStore, and ModuleSelectionStore.
 */
export type BuildFile = {
	name: string;
	shipType: string;
	timestamp: number;
	checksum: string; // SHA-256 hash of the state data for integrity verification
	gridState: Record<string, unknown>;
	techState: Record<string, unknown>;
	bonusState: Record<string, unknown>;
	moduleState: Record<string, unknown>;
};

/**
 * Type guard to check if an object conforms to the BuildFile interface.
 *
 * @param {unknown} obj - The object to check.
 * @returns {boolean} True if the object is a valid BuildFile, false otherwise.
 * @example
 * const build = { name: "My Build", shipType: "freighter", serialized: "abc123", timestamp: 1234567890 };
 * if (isValidBuildFile(build)) {
 *   // Do something with the valid build
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
