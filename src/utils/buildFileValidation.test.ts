import { describe, expect, it, vi } from "vitest";

import { isValidBuildFile } from "./buildFileValidation";

describe("buildFileValidation utility", () => {
	const validBuildFile = {
		name: "Test Build",
		shipType: "fighter",
		timestamp: 123456789,
		checksum: "abc-123",
		gridState: {},
		techState: {},
		bonusState: {},
		moduleState: {},
	};

	it("should return true for a valid build file", () => {
		expect(isValidBuildFile(validBuildFile)).toBe(true);
	});

	it("should return false for null or non-object", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile(null)).toBe(false);
		expect(isValidBuildFile(123)).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'name' is missing or not a string", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, name: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, name: 123 })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'shipType' is missing or not a string", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, shipType: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, shipType: 123 })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'timestamp' is missing or not a number", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, timestamp: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, timestamp: "123" })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'checksum' is missing or not a string", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, checksum: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, checksum: 123 })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'gridState' is missing or not an object", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, gridState: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, gridState: null })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, gridState: "not-an-object" })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'techState' is missing or not an object", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, techState: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, techState: null })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, techState: "not-an-object" })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'bonusState' is missing or not an object", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, bonusState: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, bonusState: null })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, bonusState: "not-an-object" })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should return false if 'moduleState' is missing or not an object", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(isValidBuildFile({ ...validBuildFile, moduleState: undefined })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, moduleState: null })).toBe(false);
		expect(isValidBuildFile({ ...validBuildFile, moduleState: "not-an-object" })).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
	});
});
