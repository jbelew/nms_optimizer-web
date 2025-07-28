import { describe, expect, it } from "vitest";

import { createEmptyCell } from "../GridStore";

describe("createEmptyCell() createEmptyCell method", () => {
	// Happy Path Tests
	describe("Happy paths", () => {
		it("should create a cell with default values when no arguments are provided", () => {
			// This test checks that the default cell is created as expected.
			const cell = createEmptyCell();
			expect(cell).toEqual({
				active: false,
				adjacency: "none",
				adjacency_bonus: 0.0,
				bonus: 0.0,
				image: null,
				module: null,
				label: "",
				sc_eligible: false,
				supercharged: false,
				tech: null,
				total: 0.0,
				type: "",
				value: 0,
			});
		});

		it("should create a cell with supercharged set to true when supercharged argument is true", () => {
			// This test checks that the supercharged property is set correctly.
			const cell = createEmptyCell(true);
			expect(cell.supercharged).toBe(true);
			expect(cell.active).toBe(false);
		});

		it("should create a cell with active set to false when active argument is false", () => {
			// This test checks that the active property is set correctly.
			const cell = createEmptyCell(false, false);
			expect(cell.active).toBe(false);
			expect(cell.supercharged).toBe(false);
		});

		it("should create a cell with both supercharged and active set to true", () => {
			// This test checks that both supercharged and active are set to true.
			const cell = createEmptyCell(true, true);
			expect(cell.supercharged).toBe(true);
			expect(cell.active).toBe(true);
		});

		it("should create a cell with supercharged true and active false", () => {
			// This test checks that supercharged can be true even if active is false.
			const cell = createEmptyCell(true, false);
			expect(cell.supercharged).toBe(true);
			expect(cell.active).toBe(false);
		});
	});

	// Edge Case Tests
	describe("Edge cases", () => {
		it("should handle boolean false for both arguments", () => {
			// This test checks that both supercharged and active can be set to false.
			const cell = createEmptyCell(false, false);
			expect(cell.supercharged).toBe(false);
			expect(cell.active).toBe(false);
		});

		it("should handle boolean true for both arguments", () => {
			// This test checks that both supercharged and active can be set to true.
			const cell = createEmptyCell(true, true);
			expect(cell.supercharged).toBe(true);
			expect(cell.active).toBe(true);
		});

		it("should not mutate the default values when called multiple times", () => {
			// This test checks that each call returns a new object.
			const cell1 = createEmptyCell();
			const cell2 = createEmptyCell();
			expect(cell1).not.toBe(cell2);
			expect(cell1).toEqual(cell2);
		});

		it("should return a valid Cell object structure for all combinations of arguments", () => {
			// This test checks that the returned object always has the correct structure.
			const combinations: [boolean | undefined, boolean | undefined][] = [
				[undefined, undefined],
				[true, undefined],
				[false, undefined],
				[undefined, true],
				[undefined, false],
				[true, true],
				[true, false],
				[false, true],
				[false, false],
			];
			for (const [supercharged, active] of combinations) {
				const cell = createEmptyCell(supercharged, active);
				expect(cell).toHaveProperty("active");
				expect(cell).toHaveProperty("adjacency");
				expect(cell).toHaveProperty("adjacency_bonus");
				expect(cell).toHaveProperty("bonus");
				expect(cell).toHaveProperty("image");
				expect(cell).toHaveProperty("module");
				expect(cell).toHaveProperty("label");
				expect(cell).toHaveProperty("sc_eligible");
				expect(cell).toHaveProperty("supercharged");
				expect(cell).toHaveProperty("tech");
				expect(cell).toHaveProperty("total");
				expect(cell).toHaveProperty("type");
				expect(cell).toHaveProperty("value");
			}
		});
	});
});
