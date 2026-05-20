import { beforeEach, describe, expect, it } from "vitest";

import { createGrid, useGridStore } from "./gridStore"; // Adjust path if necessary based on file location

describe("Grid Store Selectors", () => {
	beforeEach(() => {
		// Directly reset to a known initial state for the grid part,
		// avoiding issues with resetGrid if state.grid is null from a previous test.
		// Default dimensions (10,6) are from the main store's initialization.
		useGridStore.setState({ grid: createGrid(10, 6), isSharedGrid: false, result: null });
		useGridStore.getState().triggerRecompute();
	});
	describe("selectTotalSuperchargedCells", () => {
		it("should return 0 for a newly created grid (no supercharged cells)", () => {
			// The default grid from resetGrid should have no supercharged cells
			expect(useGridStore.getState().totalSuperchargedCells).toBe(0);
		});
		it("should return 0 for a grid explicitly set with no supercharged cells", () => {
			const newGrid = createGrid(2, 2); // All cells are initially not supercharged
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(0);
		});
		it("should correctly count a few supercharged cells", () => {
			const newGrid = createGrid(3, 3);
			newGrid.cells[0][0].supercharged = true;
			newGrid.cells[1][1].supercharged = true;
			newGrid.cells[2][2].supercharged = true;
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(3);
		});
		it("should correctly count supercharged cells when all are supercharged", () => {
			const newGrid = createGrid(2, 2);
			newGrid.cells[0][0].supercharged = true;
			newGrid.cells[0][1].supercharged = true;
			newGrid.cells[1][0].supercharged = true;
			newGrid.cells[1][1].supercharged = true;
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(4);
		});
		it("should update the count after a cell becomes supercharged", () => {
			const newGrid = createGrid(2, 1); // 2 cells, 1 row
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(0); // Initial check
			const currentStoredGrid = useGridStore.getState().grid;
			const modifiedCells = currentStoredGrid.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells[0][0].supercharged = true;
			const gridWithModification = { ...currentStoredGrid, cells: modifiedCells };
			useGridStore.getState().setGrid(gridWithModification);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(1);
		});
		it("should update the count after a cell is no longer supercharged", () => {
			const newGrid = createGrid(2, 1);
			newGrid.cells[0][0].supercharged = true;
			newGrid.cells[0][1].supercharged = true;
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(2); // Initial check
			const currentStoredGrid = useGridStore.getState().grid;
			const modifiedCells = currentStoredGrid.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells[0][0].supercharged = false;
			const gridWithModification = { ...currentStoredGrid, cells: modifiedCells };
			useGridStore.getState().setGrid(gridWithModification);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(1);
		});
		it("should return 0 if grid is null (though store initializes grid)", () => {
			// @ts-expect-error For testing this specific scenario
			useGridStore.getState().setGrid(null);
			expect(useGridStore.getState().totalSuperchargedCells).toBe(0);
		});
		it("should return 0 if grid.cells is null (though store initializes grid.cells)", () => {
			// @ts-expect-error For testing this specific scenario
			useGridStore.getState().setGrid({ cells: null, height: 0, width: 0 });
			expect(useGridStore.getState().totalSuperchargedCells).toBe(0);
		});
	});
	describe("selectHasModulesInGrid", () => {
		it("should return false for a newly created grid (no modules)", () => {
			// The default grid from resetGrid should have no modules
			expect(useGridStore.getState().hasModulesInGrid).toBe(false);
		});
		it("should return false for a grid explicitly set with no modules", () => {
			const newGrid = createGrid(2, 2); // All cells are initially without modules
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().hasModulesInGrid).toBe(false);
		});
		it("should return true if there is one module in the grid", () => {
			const newGrid = createGrid(3, 3);
			newGrid.cells[1][2].module = "Test Module";
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().hasModulesInGrid).toBe(true);
		});
		it("should return true if there are multiple modules in the grid", () => {
			const newGrid = createGrid(2, 2);
			newGrid.cells[0][0].module = "Module A";
			newGrid.cells[0][1].module = "Module B";
			newGrid.cells[1][1].module = "Module C";
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().hasModulesInGrid).toBe(true);
		});
		it("should update after a module is added", () => {
			const newGrid = createGrid(2, 1);
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().hasModulesInGrid).toBe(false); // Initial check
			const currentStoredGrid1 = useGridStore.getState().grid;
			const modifiedCells1 = currentStoredGrid1.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells1[0][0].module = "New Module";
			const gridWithModification1 = { ...currentStoredGrid1, cells: modifiedCells1 };
			useGridStore.getState().setGrid(gridWithModification1);
			expect(useGridStore.getState().hasModulesInGrid).toBe(true);
		});
		it("should update after a module is removed", () => {
			const newGrid = createGrid(2, 1);
			newGrid.cells[0][0].module = "Existing Module";
			newGrid.cells[0][1].module = "Another Module";
			useGridStore.getState().setGrid(newGrid);
			expect(useGridStore.getState().hasModulesInGrid).toBe(true); // Initial check
			const currentStoredGrid1 = useGridStore.getState().grid;
			const modifiedCells1 = currentStoredGrid1.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells1[0][0].module = null; // Remove one module
			const gridWithModification1 = { ...currentStoredGrid1, cells: modifiedCells1 };
			useGridStore.getState().setGrid(gridWithModification1);
			expect(useGridStore.getState().hasModulesInGrid).toBe(true); // cells[0][1] should still have 'Another Module'
			const currentStoredGrid2 = useGridStore.getState().grid;
			const modifiedCells2 = currentStoredGrid2.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells2[0][1].module = null; // Remove the last module
			const gridWithModification2 = { ...currentStoredGrid2, cells: modifiedCells2 };
			useGridStore.getState().setGrid(gridWithModification2);
			expect(useGridStore.getState().hasModulesInGrid).toBe(false); // Now false
		});
		it("should return false if grid is null (though store initializes grid)", () => {
			// @ts-expect-error For testing this specific scenario
			useGridStore.getState().setGrid(null);
			expect(useGridStore.getState().hasModulesInGrid).toBe(false);
		});
		it("should return false if grid.cells is null (though store initializes grid.cells)", () => {
			// @ts-expect-error For testing this specific scenario
			useGridStore.getState().setGrid({ cells: null, height: 0, width: 0 });
			expect(useGridStore.getState().hasModulesInGrid).toBe(false);
		});
	});
});
