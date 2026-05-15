import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import {
	isValidBuildFile,
	isValidFilename,
	isValidRecommendedBuild,
	sanitizeFilename,
} from "./dataValidation";

describe("Data Validation Utilities", () => {
	const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

	afterEach(() => {
		consoleErrorSpy.mockClear();
	});

	afterAll(() => {
		consoleErrorSpy.mockRestore();
	});

	describe("isValidBuildFile", () => {
		const validBuildFile = {
			bonusState: {},
			checksum: "abc-123",
			gridState: {},
			moduleState: {},
			name: "Test Build",
			shipType: "fighter",
			techState: {},
			timestamp: 123456789,
		};

		it("should return true for a valid build file", () => {
			expect(isValidBuildFile(validBuildFile)).toBe(true);
		});

		it("should return false for null or non-object", () => {
			expect(isValidBuildFile(null)).toBe(false);
			expect(isValidBuildFile(123)).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("should return false if required properties are missing", () => {
			const invalidFile = { ...validBuildFile };
			delete (invalidFile as unknown as Record<string, unknown>).name;
			expect(isValidBuildFile(invalidFile)).toBe(false);
			expect(consoleErrorSpy).toHaveBeenCalled();
		});
	});

	describe("Filename Validation", () => {
		it("should return true for valid filenames", () => {
			expect(isValidFilename("build.json")).toBe(true);
			expect(isValidFilename("my-ship-layout")).toBe(true);
		});

		it("should return false for filenames with invalid characters", () => {
			expect(isValidFilename("build/json")).toBe(false);
			expect(isValidFilename("build:json")).toBe(false);
		});

		it("should sanitize filenames correctly", () => {
			expect(sanitizeFilename("build:?*<>/\\|json")).toBe("buildjson");
			expect(sanitizeFilename("CON")).toBe("build");
		});
	});

	describe("isValidRecommendedBuild", () => {
		it("should return true for a valid RecommendedBuild object", () => {
			const validBuild = {
				layout: [
					[
						{
							active: true,
							adjacency_bonus: 10,
							module: "module1",
							supercharged: true,
							tech: "tech1",
						},
					],
					[null],
				],
				title: "Test Build",
			};
			expect(isValidRecommendedBuild(validBuild)).toBe(true);
		});

		it("should return false for invalid RecommendedBuild objects", () => {
			expect(isValidRecommendedBuild(null)).toBe(false);
			expect(isValidRecommendedBuild({ title: 123 })).toBe(false);
		});
	});
});
