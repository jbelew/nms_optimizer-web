import type { Cell } from "./GridStore";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "./GridStore";

describe("resetGridTech action in GridStore", () => {
	const gridWidth = 3;
	const gridHeight = 3;
	const techToClear = "tech_to_clear";
	const otherTech = "other_tech";

	// Helper to set up a specific grid state for a test
	const configureGridCells = (cellConfigurator: (cells: Cell[][]) => void) => {
		act(() => {
			useGridStore.getState().resetGrid(); // Start with store's default grid size
			const newGrid = createGrid(gridWidth, gridHeight); // then create our test 3x3 grid
			newGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, true)); // Default: active, not SC, no module/tech
				})
			);
			cellConfigurator(newGrid.cells);
			useGridStore.setState({ grid: newGrid, result: null, isSharedGrid: false });
		});
	};

	beforeEach(() => {
		// Default setup: 3x3 grid, all cells active, no modules, no tech.
		// Specific tech/module/active/SC states will be set by `configureGridCells` in each test.
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

	it("should clear the specified techName from all cells containing it", () => {
		configureGridCells((cells) => {
			cells[0][0].tech = techToClear;
			cells[1][1].tech = techToClear;
			cells[0][1].tech = otherTech;
		});
		act(() => {
			useGridStore.getState().resetGridTech(techToClear);
		});
		const { cells } = useGridStore.getState().grid;
		expect(cells[0][0].tech).toBeNull();
		expect(cells[1][1].tech).toBeNull();
		expect(cells[0][1].tech).toBe(otherTech); // Unchanged
	});

	it("should preserve active and supercharged status of cells where tech is cleared", () => {
		configureGridCells((cells) => {
			cells[0][0].tech = techToClear;
			cells[0][0].active = true;
			cells[0][0].supercharged = true;
			cells[1][1].tech = techToClear;
			cells[1][1].active = false;
			cells[1][1].supercharged = true; // inactive, SC
			cells[2][2].tech = techToClear;
			cells[2][2].active = true;
			cells[2][2].supercharged = false;
		});
		act(() => {
			useGridStore.getState().resetGridTech(techToClear);
		});
		const { cells } = useGridStore.getState().grid;
		expect(cells[0][0].active).toBe(true);
		expect(cells[0][0].supercharged).toBe(true);
		expect(cells[1][1].active).toBe(false);
		expect(cells[1][1].supercharged).toBe(true);
		expect(cells[2][2].active).toBe(true);
		expect(cells[2][2].supercharged).toBe(false);
	});

	it("should reset other properties (module, label, etc.) to defaults from createEmptyCell", () => {
		configureGridCells((cells) => {
			cells[0][0].tech = techToClear;
			cells[0][0].module = "mod1";
			cells[0][0].label = "TestLabel";
			cells[0][0].value = 100;
			cells[0][0].bonus = 5;
			// active=true, supercharged=false (will be preserved)
			cells[0][0].active = true;
			cells[0][0].supercharged = false;
		});

		const expectedCellState = createEmptyCell(false, true); // SC=false, active=true

		act(() => {
			useGridStore.getState().resetGridTech(techToClear);
		});

		const clearedCell = useGridStore.getState().grid.cells[0][0];
		expect(clearedCell.tech).toBeNull();
		expect(clearedCell.module).toBe(expectedCellState.module); // null
		expect(clearedCell.label).toBe(expectedCellState.label); // ""
		expect(clearedCell.value).toBe(expectedCellState.value); // 0
		expect(clearedCell.bonus).toBe(expectedCellState.bonus); // 0.0
		expect(clearedCell.adjacency).toBe(expectedCellState.adjacency); // false
		// Active and supercharged are preserved
		expect(clearedCell.active).toBe(true);
		expect(clearedCell.supercharged).toBe(false);
	});

	it("should not affect cells that do not contain the specified techName", () => {
		const originalCellStates: Cell[][] = [];
		configureGridCells((cells) => {
			cells[0][0].tech = otherTech;
			cells[0][0].module = "mod_other";
			cells[0][0].active = true;
			cells[0][0].supercharged = true;
			cells[1][1].tech = techToClear; // This one will be cleared
			cells[2][2].tech = "another_tech";
			cells[2][2].label = "keep";

			// Deep clone initial state of non-target cells for comparison
			cells.forEach((row, rIdx) => {
				originalCellStates[rIdx] = [];
				row.forEach((cell, cIdx) => {
					if (cell.tech !== techToClear) {
						originalCellStates[rIdx][cIdx] = JSON.parse(JSON.stringify(cell));
					}
				});
			});
		});

		act(() => {
			useGridStore.getState().resetGridTech(techToClear);
		});

		const finalCells = useGridStore.getState().grid.cells;
		expect(finalCells[0][0]).toEqual(originalCellStates[0][0]);
		expect(finalCells[2][2]).toEqual(originalCellStates[2][2]);
		expect(finalCells[1][1].tech).toBeNull(); // Check that target cell was indeed cleared
	});

	it("should correctly clear tech from multiple cells", () => {
		configureGridCells((cells) => {
			cells[0][0].tech = techToClear;
			cells[0][2].tech = techToClear;
			cells[1][1].tech = otherTech;
			cells[2][0].tech = techToClear;
		});
		act(() => {
			useGridStore.getState().resetGridTech(techToClear);
		});
		const { cells } = useGridStore.getState().grid;
		expect(cells[0][0].tech).toBeNull();
		expect(cells[0][2].tech).toBeNull();
		expect(cells[2][0].tech).toBeNull();
		expect(cells[1][1].tech).toBe(otherTech);
	});

	it("should correctly clear tech when only one cell has the target tech", () => {
		configureGridCells((cells) => {
			cells[0][0].tech = otherTech;
			cells[1][1].tech = techToClear; // Only this one
			cells[2][2].tech = otherTech;
		});
		act(() => {
			useGridStore.getState().resetGridTech(techToClear);
		});
		const { cells } = useGridStore.getState().grid;
		expect(cells[1][1].tech).toBeNull();
		expect(cells[0][0].tech).toBe(otherTech);
		expect(cells[2][2].tech).toBe(otherTech);
	});

	it("should result in no changes if no cells have the target tech", () => {
		configureGridCells((cells) => {
			cells[0][0].tech = otherTech;
			cells[1][1].tech = "another_tech_unrelated";
		});
		// Capture state AFTER configuration
		const originalGridState = JSON.parse(JSON.stringify(useGridStore.getState().grid));

		act(() => {
			useGridStore.getState().resetGridTech(techToClear); // techToClear is not in the grid
		});

		const finalGridState = useGridStore.getState().grid;
		expect(finalGridState).toEqual(originalGridState);
	});

	it('should not change anything if techName is an empty string and no cells have "" as tech', () => {
		configureGridCells((cells) => {
			cells[0][0].tech = techToClear; // A normal tech
		});
		// Capture state AFTER configuration
		const originalGridState = JSON.parse(JSON.stringify(useGridStore.getState().grid));

		act(() => {
			useGridStore.getState().resetGridTech(""); // Trying to clear tech ""
		});

		const finalGridState = useGridStore.getState().grid;
		expect(finalGridState).toEqual(originalGridState);
	});

	it('should clear tech if techName is an empty string and a cell has "" as tech', () => {
		configureGridCells((cells) => {
			cells[0][0].tech = ""; // Cell has an empty string as tech
			cells[0][0].active = true;
			cells[0][0].supercharged = false; // Preserve these
			cells[0][0].module = "test_module"; // This should be cleared
		});

		act(() => {
			useGridStore.getState().resetGridTech("");
		});

		const { cells } = useGridStore.getState().grid;
		const expectedCell = createEmptyCell(false, true); // active=T, SC=F

		expect(cells[0][0].tech).toBeNull();
		expect(cells[0][0].active).toBe(true);
		expect(cells[0][0].supercharged).toBe(false);
		expect(cells[0][0].module).toEqual(expectedCell.module);
	});
});
