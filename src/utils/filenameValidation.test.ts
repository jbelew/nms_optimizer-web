import { describe, expect, it } from "vitest";

import { isValidFilename, sanitizeFilename } from "./filenameValidation";

describe("filenameValidation", () => {
	describe("isValidFilename", () => {
		it("should return true for valid filenames", () => {
			expect(isValidFilename("build.json")).toBe(true);
			expect(isValidFilename("my-ship-layout")).toBe(true);
			expect(isValidFilename("123")).toBe(true);
		});

		it("should return false for filenames with invalid characters", () => {
			expect(isValidFilename("build/json")).toBe(false);
			expect(isValidFilename("build\\json")).toBe(false);
			expect(isValidFilename("build:json")).toBe(false);
			expect(isValidFilename("build*json")).toBe(false);
			expect(isValidFilename("build?json")).toBe(false);
			expect(isValidFilename('build"json')).toBe(false);
			expect(isValidFilename("build<json")).toBe(false);
			expect(isValidFilename("build>json")).toBe(false);
			expect(isValidFilename("build|json")).toBe(false);
		});

		it("should return false for reserved Windows filenames", () => {
			expect(isValidFilename("CON")).toBe(false);
			expect(isValidFilename("PRN")).toBe(false);
			expect(isValidFilename("AUX")).toBe(false);
			expect(isValidFilename("NUL")).toBe(false);
			expect(isValidFilename("COM1")).toBe(false);
			expect(isValidFilename("LPT9")).toBe(false);
		});

		it("should return false for filenames with trailing spaces or periods", () => {
			expect(isValidFilename("build ")).toBe(false);
			expect(isValidFilename("build.")).toBe(false);
		});

		it("should return false for empty or too long filenames", () => {
			expect(isValidFilename("")).toBe(false);
			expect(isValidFilename("a".repeat(256))).toBe(false);
		});
	});

	describe("sanitizeFilename", () => {
		it("should strip invalid characters", () => {
			expect(sanitizeFilename("build:?*<>/\\|json")).toBe("buildjson");
			// Note: The implementation also strips ( ) { } ! # etc.
			expect(sanitizeFilename("ship (v1!) {new}")).toBe("ship v1 new");
		});

		it("should remove trailing spaces and periods", () => {
			expect(sanitizeFilename("build ")).toBe("build");
			expect(sanitizeFilename("build.")).toBe("build");
			expect(sanitizeFilename("build. ")).toBe("build");
		});

		it("should cap length at 255 characters", () => {
			const longName = "a".repeat(300);
			expect(sanitizeFilename(longName).length).toBe(255);
		});

		it("should return 'build' for empty or reserved names", () => {
			expect(sanitizeFilename("")).toBe("build");
			expect(sanitizeFilename(":")).toBe("build");
			expect(sanitizeFilename("CON")).toBe("build");
			expect(sanitizeFilename("COM1")).toBe("build");
		});
	});
});
