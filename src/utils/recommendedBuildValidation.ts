/**
 * Validation utilities for recommended technology builds.
 *
 * @remarks
 * This module provides types and functions to ensure that build recommendations
 * received from the backend API conform to the application's internal structure.
 *
 * @category Utilities
 * @see {@link isValidRecommendedBuild}
 * @see {@link ./recommendedBuildValidation.test.ts Unit Tests}
 */

import type { RecommendedBuild } from "../hooks/useTechTree/useTechTree";

/**
 * Validates that an unknown object conforms to the `RecommendedBuild` interface.
 *
 * @remarks
 * Performs a deep check of the `layout` property, ensuring it is a valid 2D array
 * of grid cell data. Also validates that required properties like `title`
 * are present and correctly typed. Logs errors to the console on failure.
 *
 * @param {unknown} obj - The object to validate.
 * @returns {obj is RecommendedBuild} `true` if the object is a valid `RecommendedBuild`, otherwise `false`.
 * @category Utilities
 * @see {@link RecommendedBuild}
 *
 * @example
 * ```ts
 * if (isValidRecommendedBuild(jsonResponse)) {
 *   applyLayout(jsonResponse.layout);
 * }
 * // returns true if valid
 * ```
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
