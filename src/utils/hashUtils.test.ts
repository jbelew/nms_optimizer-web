import { describe, it, expect } from "vitest";
import { computeSHA256 } from "./hashUtils";

describe("hashUtils", () => {
	it("should compute SHA-256 hash correctly", async () => {
		const data = "test-data";
		// Expected SHA-256 for "test-data"
		const expectedHash = "a186000422feab857329c684e9fe91412b1a5db084100b37a98cfc95b62aa867";
		const actualHash = await computeSHA256(data);
		expect(actualHash).toBe(expectedHash);
	});

	it("should return consistent hash for same input", async () => {
		const data = "consistent-data";
		const hash1 = await computeSHA256(data);
		const hash2 = await computeSHA256(data);
		expect(hash1).toBe(hash2);
	});

	it("should return different hashes for different inputs", async () => {
		const hash1 = await computeSHA256("data1");
		const hash2 = await computeSHA256("data2");
		expect(hash1).not.toBe(hash2);
	});
});
