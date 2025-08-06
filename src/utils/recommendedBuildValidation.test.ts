import { describe, expect, it, vi } from "vitest";

import { isValidRecommendedBuild } from "./recommendedBuildValidation";

describe("isValidRecommendedBuild", () => {
	// Suppress console.error for cleaner test output
	const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

	afterEach(() => {
		consoleErrorSpy.mockClear();
	});

	afterAll(() => {
		consoleErrorSpy.mockRestore();
	});

	it("should return true for a valid RecommendedBuild object", () => {
		const validBuild = {
			title: "Test Build",
			layout: [
				[
					{
						tech: "tech1",
						module: "module1",
						supercharged: true,
						active: true,
						adjacency_bonus: 10,
					},
				],
				[
					{
						tech: "tech2",
						module: "module2",
						supercharged: false,
						active: true,
						adjacency_bonus: 5,
					},
					null,
				],
				[null, { tech: "tech3", module: "module3" }],
			],
		};
		expect(isValidRecommendedBuild(validBuild)).toBe(true);
		expect(consoleErrorSpy).not.toHaveBeenCalled();
	});

	it("should return true for a valid RecommendedBuild with empty layout", () => {
		const validBuild = {
			title: "Empty Layout",
			layout: [],
		};
		expect(isValidRecommendedBuild(validBuild)).toBe(true);
		expect(consoleErrorSpy).not.toHaveBeenCalled();
	});

	it("should return true for a valid RecommendedBuild with empty rows", () => {
		const validBuild = {
			title: "Empty Rows",
			layout: [[], []],
		};
		expect(isValidRecommendedBuild(validBuild)).toBe(true);
		expect(consoleErrorSpy).not.toHaveBeenCalled();
	});

	it("should return false if obj is not an object or is null", () => {
		expect(isValidRecommendedBuild(null)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild is not an object or is null.",
			null
		);
		consoleErrorSpy.mockClear();

		expect(isValidRecommendedBuild(undefined)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild is not an object or is null.",
			undefined
		);
		consoleErrorSpy.mockClear();

		expect(isValidRecommendedBuild("string")).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild is not an object or is null.",
			"string"
		);
		consoleErrorSpy.mockClear();

		expect(isValidRecommendedBuild(123)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild is not an object or is null.",
			123
		);
	});

	it("should return false if title is missing", () => {
		const invalidBuild = {
			layout: [],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild missing or invalid 'title' property.",
			invalidBuild
		);
	});

	it("should return false if title is not a string", () => {
		const invalidBuild = {
			title: 123,
			layout: [],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild missing or invalid 'title' property.",
			invalidBuild
		);
	});

	it("should return false if layout is missing", () => {
		const invalidBuild = {
			title: "Test Build",
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild missing or invalid 'layout' property (not an array).",
			invalidBuild
		);
	});

	it("should return false if layout is not an array", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: "not an array",
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild missing or invalid 'layout' property (not an array).",
			invalidBuild
		);
	});

	it("should return false if a row in layout is not an array", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: ["not an array"],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout row is not an array.",
			invalidBuild
		);
	});

	it("should return false if a cell is not an object or null", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: [[123]],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout cell is not an object or is null.",
			123
		);
	});

	it("should return false if cell.tech is not a string or null", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: [[{ tech: 123 }]],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout cell 'tech' property is not a string or null. Cell data:",
			{ tech: 123 }
		);
	});

	it("should return false if cell.module is not a string or null", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: [[{ module: 123 }]],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout cell 'module' property is not a string or null. Cell data:",
			{ module: 123 }
		);
	});

	it("should return false if cell.supercharged is not a boolean", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: [[{ supercharged: "true" }]],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout cell 'supercharged' property is not a boolean. Cell data:",
			{ supercharged: "true" }
		);
	});

	it("should return false if cell.active is not a boolean", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: [[{ active: "true" }]],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout cell 'active' property is not a boolean. Cell data:",
			{ active: "true" }
		);
	});

	it("should return false if cell.adjacency_bonus is not a number", () => {
		const invalidBuild = {
			title: "Test Build",
			layout: [[{ adjacency_bonus: "10" }]],
		};
		expect(isValidRecommendedBuild(invalidBuild)).toBe(false);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Validation Error: RecommendedBuild layout cell 'adjacency_bonus' property is not a number. Cell data:",
			{ adjacency_bonus: "10" }
		);
	});
});
