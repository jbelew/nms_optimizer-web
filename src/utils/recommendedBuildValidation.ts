import type { RecommendedBuild } from "../hooks/useTechTree/useTechTree";

/**
 * Type guard to check if an object conforms to the RecommendedBuild interface.
 *
 * @param {unknown} obj - The object to check.
 * @returns {boolean} True if the object is a valid RecommendedBuild, false otherwise.
 * @example
 * const build = { title: "My Build", layout: [[{ tech: "test", module: "test" }]] };
 * if (isValidRecommendedBuild(build)) {
 *  // Do something with the valid build
 * }
 */
export function isValidRecommendedBuild(obj: unknown): obj is RecommendedBuild {
	if (typeof obj !== "object" || obj === null) {
		console.error("Validation Error: RecommendedBuild is not an object or is null.", obj);
		return false;
	}

	const recommendedBuild = obj as RecommendedBuild;

	if (typeof recommendedBuild.title !== "string") {
		console.error(
			"Validation Error: RecommendedBuild missing or invalid 'title' property.",
			recommendedBuild
		);
		return false;
	}

	if (!Array.isArray(recommendedBuild.layout)) {
		console.error(
			"Validation Error: RecommendedBuild missing or invalid 'layout' property (not an array).",
			recommendedBuild
		);
		return false;
	}

	// Validate the structure of the layout array (2D array of objects or null)
	for (const row of recommendedBuild.layout) {
		if (!Array.isArray(row)) {
			console.error(
				"Validation Error: RecommendedBuild layout row is not an array.",
				recommendedBuild
			);
			return false;
		}
		for (const cellData of row) {
			if (cellData !== null) {
				if (typeof cellData !== "object" || cellData === null) {
					console.error(
						"Validation Error: RecommendedBuild layout cell is not an object or is null.",
						cellData
					);
					return false;
				}
				// Check for optional properties and their types
				if (
					"tech" in cellData &&
					typeof cellData.tech !== "string" &&
					cellData.tech !== null
				) {
					console.error(
						"Validation Error: RecommendedBuild layout cell 'tech' property is not a string or null. Cell data:",
						cellData
					);
					return false;
				}
				if (
					"module" in cellData &&
					typeof cellData.module !== "string" &&
					cellData.module !== null
				) {
					console.error(
						"Validation Error: RecommendedBuild layout cell 'module' property is not a string or null. Cell data:",
						cellData
					);
					return false;
				}
				if ("supercharged" in cellData && typeof cellData.supercharged !== "boolean") {
					console.error(
						"Validation Error: RecommendedBuild layout cell 'supercharged' property is not a boolean. Cell data:",
						cellData
					);
					return false;
				}
				if ("active" in cellData && typeof cellData.active !== "boolean") {
					console.error(
						"Validation Error: RecommendedBuild layout cell 'active' property is not a boolean. Cell data:",
						cellData
					);
					return false;
				}
				if ("adjacency_bonus" in cellData && typeof cellData.adjacency_bonus !== "number") {
					console.error(
						"Validation Error: RecommendedBuild layout cell 'adjacency_bonus' property is not a number. Cell data:",
						cellData
					);
					return false;
				}
			}
		}
	}

	return true;
}
