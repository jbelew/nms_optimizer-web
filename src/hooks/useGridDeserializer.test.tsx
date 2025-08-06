import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGridStore } from "../store/GridStore";
import { usePlatformStore } from "../store/PlatformStore";
import {
	compressRLE,
	decompressRLE,
	deserialize,
	useGridDeserializer,
} from "./useGridDeserializer";

vi.mock("../store/GridStore");
vi.mock("../store/PlatformStore");

// --- Mock constants.ts ---
vi.mock("../constants", () => ({
	API_URL: "http://mock-api-url.com", // Provide a mock URL for testing
}));

describe("RLE Compression", () => {
	it("should correctly compress and decompress a string with RLE", () => {
		const original = "AAABBCDDDD";
		const compressed = compressRLE(original);
		const decompressed = decompressRLE(compressed);
		expect(compressed).toBe("A3B2CD4");
		expect(decompressed).toBe(original);
	});

	it("should return an empty string if the input is empty (compress)", () => {
		expect(compressRLE("")).toBe("");
	});

	it("should return an empty string if the input is empty (decompress)", () => {
		expect(decompressRLE("")).toBe("");
	});
});

describe("Grid Deserialization", () => {
	it("should deserialize a grid correctly", async () => {
		const serialized =
			"2010|%03%04%03%04|ABAB|TFTF|techA:%03,techB:%04|mod1:A,mod2:B";
		const setTechColors = vi.fn();

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					cat1: [
						{
							key: "techA",
							color: "red",
							modules: [{ id: "mod1", label: "Module 1" }],
						},
					],
					cat2: [
						{
							key: "techB",
							color: "blue",
							modules: [{ id: "mod2", label: "Module 2" }],
						},
					],
				}),
		});

		const grid = await deserialize(serialized, "test-ship", setTechColors);

		expect(grid).toBeDefined();
		expect(grid?.cells[0][0].active).toBe(true);
		expect(grid?.cells[0][0].supercharged).toBe(true);
		expect(grid?.cells[0][0].tech).toBe("techA");
		expect(grid?.cells[0][0].module).toBe("mod1");
		expect(grid?.cells[0][0].adjacency_bonus).toBe(1);
		expect(grid?.cells[0][1].active).toBe(false);
		expect(grid?.cells[1][0].active).toBe(true);
		expect(grid?.cells[1][0].supercharged).toBe(false);
		expect(grid?.cells[1][0].tech).toBe("techA");
		expect(grid?.cells[1][0].module).toBe("mod1");
		expect(setTechColors).toHaveBeenCalledWith({ techA: "red", techB: "blue" });
	});

	it("should return null for invalid serialized string", async () => {
		const serialized = "invalid-string";
		const setTechColors = vi.fn();
		const grid = await deserialize(serialized, "test-ship", setTechColors);
		expect(grid).toBeNull();
	});
});

describe("useGridDeserializer Hook", () => {
	const setGrid = vi.fn();
	const setIsSharedGrid = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useGridStore as unknown as vi.Mock).mockReturnValue({
			setGrid,
			setIsSharedGrid,
			grid: { cells: [], height: 0, width: 0 },
		});
		(usePlatformStore as unknown as vi.Mock).mockReturnValue({
			selectedPlatform: "test-ship",
		});
	});

	it("should call setGrid and setIsSharedGrid on successful deserialization", async () => {
		const { result } = renderHook(() => useGridDeserializer());

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					cat1: [
						{
							key: "techA",
							color: "red",
							modules: [{ id: "mod1", label: "Module 1" }],
						},
					],
				}),
		});

		const serializedGrid =
			"100000000000000000000000000000000000000000000000000000000000|%03" +
			" ".repeat(59) +
			"|A" +
			" ".repeat(59) +
			"|T" +
			"F".repeat(59) +
			"|techA:%03|mod1:A";
		await act(async () => {
			await result.current.deserializeGrid(serializedGrid);
		});

		expect(setGrid).toHaveBeenCalled();
		expect(setIsSharedGrid).toHaveBeenCalledWith(true);
	});

	it("should not call setGrid if deserialization fails", async () => {
		const { result } = renderHook(() => useGridDeserializer());

		const serializedGrid = "invalid-grid";
		await act(async () => {
			await result.current.deserializeGrid(serializedGrid);
		});

		expect(setGrid).not.toHaveBeenCalled();
		expect(setIsSharedGrid).not.toHaveBeenCalled();
	});
});
