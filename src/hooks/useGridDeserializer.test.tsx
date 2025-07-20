import { describe, expect, it, vi } from "vitest";

import type { Cell,Grid } from "../store/GridStore"; // Import Cell type
import { serialize } from "./useGridDeserializer";
// Import Cell type

// --- Mock constants.ts ---
vi.mock("../constants", () => ({
	API_URL: "http://mock-api-url.com", // Provide a mock URL for testing
}));

describe("Grid Serialization", () => {
	it("should return an empty string for an empty grid", () => {
		const grid: Grid = { cells: [], height: 0, width: 0 };
		expect(serialize(grid)).toBe("%7C%7C%7C%7C%7C");
	});

	it("should serialize a grid correctly", () => {
		const grid: Grid = {
			height: 1,
			width: 1,
			cells: [
				[
					{
						active: true,
						supercharged: true,
						tech: "tech1",
						module: "modA",
						adjacency_bonus: 1,
						// --- Default values for unused properties ---
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell, // Cast to Cell to satisfy type checker for unused props
				],
			],
		};
		// Tech 'tech1' maps to char code 3 (\u0003), Module 'modA' maps to 'A' (char code 65)
		const expected = encodeURIComponent(`2|\u0003|A|T|tech1:\u0003|modA:A`);
		expect(serialize(grid)).toBe(expected);
	});

	it("should handle grids with multiple cells correctly", () => {
		const grid: Grid = {
			cells: [
				[
					{
						active: true,
						supercharged: true,
						tech: "techA",
						module: "mod1",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
					{
						active: false,
						supercharged: false,
						tech: "techB",
						module: "mod2",
						adjacency_bonus: 0,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
				],
				[
					{
						active: true,
						supercharged: false,
						tech: "techA",
						module: "mod1",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
					{
						// Note: active: false means supercharged: true is ignored (results in '0')
						active: false,
						supercharged: true,
						tech: "techB",
						module: "mod2",
						adjacency_bonus: 0,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
				],
			],
			height: 2,
			width: 2,
		};
		// Grid: 2 (active, SC), 0 (inactive), 1 (active, not SC), 0 (inactive) -> "2010"
		// Tech: techA (\u0003), techB (\u0004), techA (\u0003), techB (\u0004) -> "\u0003\u0004\u0003\u0004" (no RLE)
		// Module: mod1 (A), mod2 (B), mod1 (A), mod2 (B) -> "ABAB" (no RLE)
		// AdjBonus: T, F, T, F -> "TFTF" (no RLE)
		// Maps: techA:\u0003,techB:\u0004 and mod1:A,mod2:B
		const expected = encodeURIComponent(
			`2010|\u0003\u0004\u0003\u0004|ABAB|TFTF|techA:\u0003,techB:\u0004|mod1:A,mod2:B`
		);
		expect(serialize(grid)).toBe(expected);
	});

	it("should handle grids with cells having same tech/module correctly", () => {
		const grid: Grid = {
			cells: [
				[
					{
						active: true,
						supercharged: true,
						tech: "techS",
						module: "modS",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
					{
						active: true,
						supercharged: true,
						tech: "techS",
						module: "modS",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
				],
			],
			height: 1,
			width: 2,
		};
		// Grid: 2, 2 -> "22"
		// Tech: techS (\u0003), techS (\u0003) -> RLE -> "\u00032"
		// Module: modS (A), modS (A) -> RLE -> "A2"
		// AdjBonus: T, T -> RLE -> "T2"
		// Maps: techS:\u0003 and modS:A
		const expected = encodeURIComponent(`22|\u00032|A2|T2|techS:\u0003|modS:A`);
		expect(serialize(grid)).toBe(expected);
	});

	it("should handle grids with cells having different tech/module correctly", () => {
		const grid: Grid = {
			height: 1, // Corrected height/width to match cells array
			width: 3,
			cells: [
				[
					{
						active: true,
						supercharged: true,
						tech: "techX",
						module: "modX",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
					{
						active: true,
						supercharged: true,
						tech: "techX",
						module: "modX",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
					{
						active: true,
						supercharged: true,
						tech: "techY",
						module: "modY",
						adjacency_bonus: 1,
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
				],
			],
		};
		// Grid: 2, 2, 2 -> "222"
		// Tech: techX (\u0003), techX (\u0003), techY (\u0004) -> RLE -> "\u00032\u0004"
		// Module: modX (A), modX (A), modY (B) -> RLE -> "A2B"
		// AdjBonus: T, T, T -> RLE -> "T3"
		// Maps: techX:\u0003,techY:\u0004 and modX:A,modY:B
		const expected = encodeURIComponent(
			`222|\u00032\u0004|A2B|T3|techX:\u0003,techY:\u0004|modX:A,modY:B`
		);
		expect(serialize(grid)).toBe(expected);
	});

	it("should handle adjacency bonus correctly", () => {
		const grid: Grid = {
			height: 1,
			width: 2,
			cells: [
				[
					{
						active: true,
						supercharged: true,
						tech: "techAdj",
						module: "modAdj",
						adjacency_bonus: 1, // -> T
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
					{
						active: true,
						supercharged: true,
						tech: "techAdj",
						module: "modAdj",
						adjacency_bonus: 0, // -> F
						adjacency: false,
						bonus: 0,
						image: null,
						label: "",
						sc_eligible: false,
						value: 0,
					} as Cell,
				],
			],
		};
		// Grid: 2, 2 -> "22"
		// Tech: techAdj (\u0003), techAdj (\u0003) -> RLE -> "\u00032"
		// Module: modAdj (A), modAdj (A) -> RLE -> "A2"
		// AdjBonus: T, F -> "TF" (no RLE)
		// Maps: techAdj:\u0003 and modAdj:A
		const expected = encodeURIComponent(`22|\u00032|A2|TF|techAdj:\u0003|modAdj:A`);
		expect(serialize(grid)).toBe(expected);
	});
});
