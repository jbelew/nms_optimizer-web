/**
 * Data validation utilities for build files and recommended builds.
 *
 * @remarks
 * This module provides types and functions to ensure that data structures
 * used across the application conform to their expected schemas.
 *
 * @category Utilities
 */

import type { RecommendedBuild } from "@/types/tech";

import { Logger } from "@/utils/system/monitoring";

/**
 * Type definition for a saved build file (.nms).
 *
 * @category Utilities
 */
export type BuildFile = {
	/** Serialized tech bonus state. */
	bonusState: Record<string, unknown>;
	/** Checksum of the build data for integrity. */
	checksum: string;
	/** Serialized grid state. */
	gridState: Record<string, unknown>;
	/** Serialized module selection state. */
	moduleState: Record<string, unknown>;
	/** The display name of the build. */
	name: string;
	/** The ship type identifier. */
	shipType: string;
	/** Serialized technology state. */
	techState: Record<string, unknown>;
	/** Unix timestamp when the build was saved. */
	timestamp: number;
};

/**
 * Validates that an unknown object conforms to the BuildFile interface.
 *
 * @param {unknown} obj - The object to validate.
 *
 * @returns {obj is BuildFile} True if valid.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * if (isValidBuildFile(data)) {
 *   console.log(data.name);
 * }
 * // returns boolean
 * ```
 */
export function isValidBuildFile(obj: unknown): obj is BuildFile {
	if (typeof obj !== "object" || obj === null) {
		Logger.error("Validation Error: BuildFile is not an object or is null.", undefined, {
			obj,
		});

		return false;
	}

	const buildFile = obj as Record<string, unknown>;
	const requiredProps = [
		"name",
		"shipType",
		"timestamp",
		"checksum",
		"gridState",
		"techState",
		"bonusState",
		"moduleState",
	];

	const allPropsPresent = requiredProps.every((prop) => {
		if (!(prop in buildFile)) {
			Logger.error(`Validation Error: BuildFile missing '${prop}' property.`, undefined, {
				buildFile,
			});

			return false;
		}

		return true;
	});

	if (!allPropsPresent) return false;

	if (typeof buildFile.name !== "string") return false;
	if (typeof buildFile.shipType !== "string") return false;
	if (typeof buildFile.timestamp !== "number") return false;
	if (typeof buildFile.checksum !== "string") return false;

	return true;
}

/**
 * Control characters for filename validation.
 *
 * @category Utilities
 */
const CONTROL_CHARS = "\x00-\x1F";

/**
 * Regular expression for cross-platform filename validation.
 *
 * @category Utilities
 */
const FILENAME_REGEX = new RegExp(
	`^(?=.{1,255}$)(?!^(CON|PRn|AUX|NUL|COM[1-9]|LPT[1-9])$)[^<>:"/\\\\|?*${CONTROL_CHARS}]+(?<![ .])$`,
	"i"
);

/**
 * Validates if a string is a valid filename.
 *
 * @param {string} filename - The filename to validate.
 *
 * @returns {boolean} True if valid.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const valid = isValidFilename("build.json");
 * // returns true
 * ```
 */
export const isValidFilename = (filename: string): boolean => {
	return FILENAME_REGEX.test(filename);
};

/**
 * Sanitizes a string for use as a safe filename.
 *
 * @param {string} filename - The raw string to sanitize.
 *
 * @returns {string} Sanitized filename.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const safe = sanitizeFilename("build:?*");
 * // returns "build"
 * ```
 */
export const sanitizeFilename = (filename: string): string => {
	// eslint-disable-next-line no-control-regex
	let sanitized = filename.replace(/[<>:"/\\|?*\x00-\x1F`$&;(){}#!]/g, "");
	sanitized = sanitized.replace(/[\s.]+$/, "");

	if (sanitized.length > 255) {
		sanitized = sanitized.substring(0, 255);
	}

	if (!sanitized || /^(CON|PRn|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(sanitized)) {
		sanitized = "build";
	}

	return sanitized;
};

/**
 * Validates that an unknown object conforms to the RecommendedBuild interface.
 *
 * @param {unknown} obj - The object to validate.
 *
 * @returns {obj is RecommendedBuild} True if valid.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * if (isValidRecommendedBuild(data)) {
 *   console.log(data.title);
 * }
 * // returns boolean
 * ```
 */
export function isValidRecommendedBuild(obj: unknown): obj is RecommendedBuild {
	if (typeof obj !== "object" || obj === null) {
		Logger.error("Validation Error: RecommendedBuild is not an object or is null.", undefined, {
			obj,
		});

		return false;
	}

	const recommendedBuild = obj as RecommendedBuild;

	if (typeof recommendedBuild.title !== "string") {
		Logger.error("Validation Error: Invalid 'title' property.", undefined, {
			recommendedBuild,
		});

		return false;
	}

	if (!Array.isArray(recommendedBuild.layout)) {
		Logger.error("Validation Error: 'layout' is not an array.", undefined, {
			recommendedBuild,
		});

		return false;
	}

	return recommendedBuild.layout.every((row) => {
		if (!Array.isArray(row)) return false;

		return row.every((cellData) => {
			if (cellData === null) return true;
			if (typeof cellData !== "object") return false;

			// Basic structural check
			const techValid =
				!("tech" in cellData) ||
				typeof cellData.tech === "string" ||
				cellData.tech === null;
			const moduleValid =
				!("module" in cellData) ||
				typeof cellData.module === "string" ||
				cellData.module === null;

			return techValid && moduleValid;
		});
	});
}
