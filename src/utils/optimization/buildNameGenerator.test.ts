import { describe, expect, it } from "vitest";

import { generateBuildNameWithType } from "./buildNameGenerator";

describe("buildNameGenerator", () => {
	it("should generate a build name with the correct prefix", () => {
		const name = generateBuildNameWithType("living");
		expect(name).toContain("Living -");
	});

	it("should handle unknown ship types gracefully", () => {
		const name = generateBuildNameWithType("unknown-type");
		expect(name).toContain("unknown-type -");
	});

	it("should generate randomized names", () => {
		const name1 = generateBuildNameWithType("standard");
		const name2 = generateBuildNameWithType("standard");

		// There's a small chance they are the same, but very unlikely given the lists.
		// If this fails once in a blue moon, it's just bad luck.
		expect(name1).not.toBe(name2);
	});

	it("should sanitize the output name", () => {
		// Mock sanitizeFilename to verify it's called
		// In reality it's imported from @/utils/validation/dataValidation
		// Let's just check if it contains common restricted characters
		const name = generateBuildNameWithType("standard");
		expect(name).not.toContain("/");
		expect(name).not.toContain("\\");
	});
});
