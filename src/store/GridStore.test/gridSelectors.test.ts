import { beforeEach, describe, expect, it } from "vitest";

import { createGrid, useGridStore } from "../GridStore"; // Adjust path if necessary based on file location

describe("Grid Store Selectors", () => {
	beforeEach(() => {
		// Directly reset to a known initial state for the grid part,
		// avoiding issues with resetGrid if state.grid is null from a previous test.
		// Default dimensions (10,6) are from the main store's initialization.
		useGridStore.setState({ grid: createGrid(10, 6), result: null, isSharedGrid: false });
	});

	describe("selectTotalSuperchargedCells", () => {
		it("should return 0 for a newly created grid (no supercharged cells)", () => {
			const state = useGridStore.getState();
			// The default grid from resetGrid should have no supercharged cells
			expect(state.selectTotalSuperchargedCells()).toBe(0);
		});

		it("should return 0 for a grid explicitly set with no supercharged cells", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 2); // All cells are initially not supercharged
			state.setGrid(newGrid);
			expect(state.selectTotalSuperchargedCells()).toBe(0);
		});

		it("should correctly count a few supercharged cells", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(3, 3);
			newGrid.cells[0][0].supercharged = true;
			newGrid.cells[1][1].supercharged = true;
			newGrid.cells[2][2].supercharged = true;
			state.setGrid(newGrid);
			expect(state.selectTotalSuperchargedCells()).toBe(3);
		});

		it("should correctly count supercharged cells when all are supercharged", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 2);
			newGrid.cells[0][0].supercharged = true;
			newGrid.cells[0][1].supercharged = true;
			newGrid.cells[1][0].supercharged = true;
			newGrid.cells[1][1].supercharged = true;
			state.setGrid(newGrid);
			expect(state.selectTotalSuperchargedCells()).toBe(4);
		});

		it("should update the count after a cell becomes supercharged", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 1); // 2 cells, 1 row
			state.setGrid(newGrid);
			expect(state.selectTotalSuperchargedCells()).toBe(0); // Initial check

			const currentStoredGrid = useGridStore.getState().grid;
			const modifiedCells = currentStoredGrid.cells.map((row) => row.map((cell) => ({ ...cell })));
			modifiedCells[0][0].supercharged = true;
			const gridWithModification = { ...currentStoredGrid, cells: modifiedCells };
			state.setGrid(gridWithModification);
			expect(state.selectTotalSuperchargedCells()).toBe(1);
		});

		it("should update the count after a cell is no longer supercharged", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 1);
			newGrid.cells[0][0].supercharged = true;
			newGrid.cells[0][1].supercharged = true;
			state.setGrid(newGrid);
			expect(state.selectTotalSuperchargedCells()).toBe(2); // Initial check

			const currentStoredGrid = useGridStore.getState().grid;
			const modifiedCells = currentStoredGrid.cells.map((row) => row.map((cell) => ({ ...cell })));
			modifiedCells[0][0].supercharged = false;
			const gridWithModification = { ...currentStoredGrid, cells: modifiedCells };
			state.setGrid(gridWithModification);
			expect(state.selectTotalSuperchargedCells()).toBe(1);
		});

		it("should return 0 if grid is null (though store initializes grid)", () => {
			const state = useGridStore.getState();
			// @ts-expect-error For testing this specific scenario
			state.setGrid(null);
			expect(state.selectTotalSuperchargedCells()).toBe(0);
		});

		it("should return 0 if grid.cells is null (though store initializes grid.cells)", () => {
			const state = useGridStore.getState();
			// @ts-expect-error For testing this specific scenario
			state.setGrid({ cells: null, width: 0, height: 0 });
			expect(state.selectTotalSuperchargedCells()).toBe(0);
		});
	});

	describe("selectHasModulesInGrid", () => {
		it("should return false for a newly created grid (no modules)", () => {
			const state = useGridStore.getState();
			// The default grid from resetGrid should have no modules
			expect(state.selectHasModulesInGrid()).toBe(false);
		});

		it("should return false for a grid explicitly set with no modules", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 2); // All cells are initially without modules
			state.setGrid(newGrid);
			expect(state.selectHasModulesInGrid()).toBe(false);
		});

		it("should return true if there is one module in the grid", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(3, 3);
			newGrid.cells[1][2].module = "Test Module";
			state.setGrid(newGrid);
			expect(state.selectHasModulesInGrid()).toBe(true);
		});

		it("should return true if there are multiple modules in the grid", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 2);
			newGrid.cells[0][0].module = "Module A";
			newGrid.cells[0][1].module = "Module B";
			newGrid.cells[1][1].module = "Module C";
			state.setGrid(newGrid);
			expect(state.selectHasModulesInGrid()).toBe(true);
		});

		it("should update after a module is added", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 1);
			state.setGrid(newGrid);
			expect(state.selectHasModulesInGrid()).toBe(false); // Initial check

			const currentStoredGrid1 = useGridStore.getState().grid;
			const modifiedCells1 = currentStoredGrid1.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells1[0][0].module = "New Module";
			const gridWithModification1 = { ...currentStoredGrid1, cells: modifiedCells1 };
			state.setGrid(gridWithModification1);
			expect(state.selectHasModulesInGrid()).toBe(true);
		});

		it("should update after a module is removed", () => {
			const state = useGridStore.getState();
			const newGrid = createGrid(2, 1);
			newGrid.cells[0][0].module = "Existing Module";
			newGrid.cells[0][1].module = "Another Module";
			state.setGrid(newGrid);
			expect(state.selectHasModulesInGrid()).toBe(true); // Initial check

			const currentStoredGrid1 = useGridStore.getState().grid;
			const modifiedCells1 = currentStoredGrid1.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells1[0][0].module = null; // Remove one module
			const gridWithModification1 = { ...currentStoredGrid1, cells: modifiedCells1 };
			state.setGrid(gridWithModification1);
			expect(state.selectHasModulesInGrid()).toBe(true); // cells[0][1] should still have 'Another Module'

			const currentStoredGrid2 = useGridStore.getState().grid;
			const modifiedCells2 = currentStoredGrid2.cells.map((row) =>
				row.map((cell) => ({ ...cell }))
			);
			modifiedCells2[0][1].module = null; // Remove the last module
			const gridWithModification2 = { ...currentStoredGrid2, cells: modifiedCells2 };
			state.setGrid(gridWithModification2);
			expect(state.selectHasModulesInGrid()).toBe(false); // Now false
		});

		it("should return false if grid is null (though store initializes grid)", () => {
			const state = useGridStore.getState();
			// @ts-expect-error For testing this specific scenario
			state.setGrid(null);
			expect(state.selectHasModulesInGrid()).toBe(false);
		});

		it("should return false if grid.cells is null (though store initializes grid.cells)", () => {
			const state = useGridStore.getState();
			// @ts-expect-error For testing this specific scenario
			state.setGrid({ cells: null, width: 0, height: 0 });
			expect(state.selectHasModulesInGrid()).toBe(false);
		});
	});
});
