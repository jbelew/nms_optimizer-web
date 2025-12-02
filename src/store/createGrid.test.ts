import { describe, expect, it } from "vitest";

import { createEmptyCell, createGrid } from "./GridStore";

describe("createGrid", () => {
	it("should create a grid with the specified width and height", () => {
		// Test case 1: 1x1 grid
		const grid1x1 = createGrid(1, 1);
		expect(grid1x1.cells).toHaveLength(1); // Height
		expect(grid1x1.cells[0]).toHaveLength(1); // Width
		expect(grid1x1.width).toBe(1);
		expect(grid1x1.height).toBe(1);

		// Test case 2: 3x2 grid
		const grid3x2 = createGrid(3, 2);
		expect(grid3x2.cells).toHaveLength(2); // Height
		grid3x2.cells.forEach((row) => expect(row).toHaveLength(3)); // Width
		expect(grid3x2.width).toBe(3);
		expect(grid3x2.height).toBe(2);

		// Test case 3: 5x5 grid
		const grid5x5 = createGrid(5, 5);
		expect(grid5x5.cells).toHaveLength(5); // Height
		grid5x5.cells.forEach((row) => expect(row).toHaveLength(5)); // Width
		expect(grid5x5.width).toBe(5);
		expect(grid5x5.height).toBe(5);
	});

	it("should initialize all cells with default properties", () => {
		const defaultCell = createEmptyCell(false, false);

		// Test case 1: 1x1 grid
		const grid1x1 = createGrid(1, 1);
		expect(grid1x1.cells[0][0]).toEqual(defaultCell);

		// Test case 2: 3x2 grid
		const grid3x2 = createGrid(3, 2);

		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 3; x++) {
				expect(grid3x2.cells[y][x]).toEqual(defaultCell);
			}
		}

		// Test case 3: 5x5 grid
		const grid5x5 = createGrid(5, 5);

		for (let y = 0; y < 5; y++) {
			for (let x = 0; x < 5; x++) {
				expect(grid5x5.cells[y][x]).toEqual(defaultCell);
			}
		}
	});
});
