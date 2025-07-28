import type { Cell, Grid } from "../GridStore";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../GridStore";

describe("isGridFull selector in GridStore", () => {
	const gridWidth = 3;
	const gridHeight = 3;

	// Helper to set up a specific grid state for a test
	// Modifies properties of cells in a standard 3x3 grid
	const configureGridCells = (cellConfigurator: (cells: Cell[][]) => void) => {
		act(() => {
			// Start with a fresh default grid
			useGridStore.getState().resetGrid();
			const newGrid = createGrid(gridWidth, gridHeight);
			newGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, true)); // Default: active, no module, not SC
				})
			);

			// Apply test-specific cell configurations
			cellConfigurator(newGrid.cells);

			useGridStore.setState({
				grid: newGrid,
				result: null,
				isSharedGrid: false,
			});
		});
	};

	// Helper for empty or non-standard grids if needed
	const setupFullGridState = (grid: Grid | null) => {
		act(() => {
			useGridStore.getState().resetGrid();
			useGridStore.setState({
				grid: grid === null ? createGrid(0, 0) : grid,
				result: null,
				isSharedGrid: false,
			});
		});
	};

	beforeEach(() => {
		// Default setup: 3x3 grid, all cells active, no modules
		act(() => {
			useGridStore.getState().resetGrid();
			const defaultGrid = createGrid(gridWidth, gridHeight);
			defaultGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, true));
				})
			);
			useGridStore.setState({ grid: defaultGrid });
		});
	});

	it("should return true when all active cells have a module", () => {
		configureGridCells((cells) => {
			// Make all cells inactive or active with module by default for this test
			cells.forEach((row) =>
				row.forEach((cell) => {
					cell.active = false;
					cell.module = null;
				})
			);

			cells[0][0].active = true;
			cells[0][0].module = "mod1";
			cells[0][1].active = true;
			cells[0][1].module = "mod2";
			// cells[0][2] is inactive
			cells[1][0].active = true;
			cells[1][0].module = "mod3";
			// cells[1][1] is inactive
			// cells[1][2] is inactive
			// Row 2 is all inactive
		});
		expect(useGridStore.getState().isGridFull()).toBe(true);
	});

	it("should return false if at least one active cell does not have a module", () => {
		configureGridCells((cells) => {
			cells[0][0].active = true;
			cells[0][0].module = "mod1";
			cells[1][1].active = true;
			cells[1][1].module = null; // Active but no module
			cells[2][2].active = true;
			cells[2][2].module = "mod3";
		});
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});

	it("should return false if there are no active cells, even if inactive cells have modules", () => {
		configureGridCells((cells) => {
			cells.forEach((row) =>
				row.forEach((cell) => {
					cell.active = false;
					cell.module = "mod_on_inactive"; // Module on an inactive cell
				})
			);
			cells[0][0].module = null; // one inactive without module
		});
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});

	it("should return false for a completely empty grid (0x0)", () => {
		setupFullGridState(createGrid(0, 0));
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});

	it("should return false for a grid with all cells inactive and without modules", () => {
		configureGridCells((cells) => {
			cells.forEach((row) =>
				row.forEach((cell) => {
					cell.active = false;
					cell.module = null;
				})
			);
		});
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});

	it("should return false when all cells are inactive, some with modules and some without", () => {
		configureGridCells((cells) => {
			cells[0][0].active = false;
			cells[0][0].module = "mod1";
			cells[0][1].active = false;
			cells[0][1].module = null;
			cells[1][0].active = false;
			cells[1][0].module = "mod2";
			cells[1][1].active = false;
			cells[1][1].module = null;
			// Ensure all are inactive
			cells.forEach((row) => row.forEach((cell) => (cell.active = false)));
		});
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});

	it("should return false when all cells are active, but none have modules", () => {
		// beforeEach sets this up: all active, no modules.
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});

	it("should return true with a mix of active cells (all with modules) and inactive cells (some with/without modules)", () => {
		configureGridCells((cells) => {
			// Start by making all cells inactive or setting a default module if active
			// This avoids relying on the configureGridCells helper's initial active=true, module=null state
			cells.forEach((row, rIdx) =>
				row.forEach((cell, cIdx) => {
					if ((rIdx === 0 && cIdx < 2) || (rIdx === 2 && cIdx === 2)) {
						// cells intended to be active
						// these will be explicitly set below
					} else {
						cell.active = false; // Make other cells inactive
						cell.module = null;
					}
				})
			);

			// Active cells, all with modules
			cells[0][0].active = true;
			cells[0][0].module = "modA";
			cells[0][1].active = true;
			cells[0][1].module = "modB";
			// cells[0][2] is inactive

			// Inactive cells
			cells[1][0].active = false;
			cells[1][0].module = "modC"; // Inactive with module
			cells[1][1].active = false;
			cells[1][1].module = null; // Inactive without module
			// cells[1][2] is inactive

			// cells[2][0] is inactive
			// cells[2][1] is inactive
			cells[2][2].active = true;
			cells[2][2].module = "modD"; // Another active cell with module
		});
		expect(useGridStore.getState().isGridFull()).toBe(true);
	});

	it("should return false if grid has active cells, but at least one is empty (even if others are full)", () => {
		configureGridCells((cells) => {
			cells[0][0].active = true;
			cells[0][0].module = "mod1";
			cells[0][1].active = true;
			cells[0][1].module = null; // Active, but no module
			cells[0][2].active = true;
			cells[0][2].module = "mod2";
			cells[1][0].active = false; // Inactive, doesn't matter
		});
		expect(useGridStore.getState().isGridFull()).toBe(false);
	});
});
