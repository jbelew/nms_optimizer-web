/**
 * Type definition for a saved build file.
 */
export type BuildFile = {
	name: string;
	shipType: string;
	serialized: string;
	timestamp: number;
	checksum?: string; // SHA-256 hash of serialized data for integrity verification
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

	if (typeof buildFile.serialized !== "string") {
		console.error(
			"Validation Error: BuildFile missing or invalid 'serialized' property.",
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

	return true;
}
