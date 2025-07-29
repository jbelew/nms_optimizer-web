import type { Grid } from "../GridStore";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../GridStore";

describe("toggleCellSupercharged action in GridStore", () => {
	beforeEach(() => {
		act(() => {
			useGridStore.getState().resetGrid();
			const defaultTestGrid = createGrid(3, 3);
			defaultTestGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, true)); // Default: active, not supercharged
				})
			);
			useGridStore.setState({ grid: defaultTestGrid, result: null, isSharedGrid: false });
		});
	});

	// Helper to modify the current grid state for a specific test
	const modifyGridSetup = (setupCallback: (grid: Grid) => void) => {
		act(() => {
			const currentGrid = useGridStore.getState().grid;
			const newGrid = JSON.parse(JSON.stringify(currentGrid)); // Deep clone
			setupCallback(newGrid);
			useGridStore.setState({ grid: newGrid });
		});
	};

	it("should supercharge an active, non-supercharged cell", () => {
		// Cell at (0,0) is active and not supercharged by default from beforeEach

		act(() => {
			useGridStore.getState().toggleCellSupercharged(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.supercharged).toBe(true);
		expect(finalCell.active).toBe(true); // Ensure active status didn't change
	});

	it("should de-supercharge an active, supercharged cell", () => {
		modifyGridSetup((grid) => {
			grid.cells[1][1].active = true;
			grid.cells[1][1].supercharged = true;
		});

		act(() => {
			useGridStore.getState().toggleCellSupercharged(1, 1);
		});

		const finalCell = useGridStore.getState().grid.cells[1][1];
		expect(finalCell.supercharged).toBe(false);
		expect(finalCell.active).toBe(true); // Ensure active status didn't change
	});

	it("should supercharge an inactive cell", () => {
		modifyGridSetup((grid) => {
			grid.cells[2][2].active = false;
			grid.cells[2][2].supercharged = false;
		});

		act(() => {
			useGridStore.getState().toggleCellSupercharged(2, 2);
		});

		const finalCell = useGridStore.getState().grid.cells[2][2];
		expect(finalCell.supercharged).toBe(true); // Should now supercharge inactive cells
		expect(finalCell.active).toBe(true); // Should now activate inactive cells
	});

	it("should de-supercharge an inactive, supercharged cell", () => {
		act(() => {
			const grid = useGridStore.getState().grid;
			grid.cells[0][1].active = false;
			grid.cells[0][1].supercharged = true;
			useGridStore.setState({ grid });
		});

		act(() => {
			useGridStore.getState().toggleCellSupercharged(0, 1);
		});

		const finalCell = useGridStore.getState().grid.cells[0][1];
		expect(finalCell.supercharged).toBe(false); // Should now de-supercharge inactive cells
		expect(finalCell.active).toBe(true); // Should now activate inactive cells
	});
});
