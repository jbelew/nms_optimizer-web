import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "./gridStore";

describe("revertCellTap action in GridStore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		act(() => {
			useGridStore.getState().resetGrid();
			const defaultTestGrid = createGrid(3, 3);
			defaultTestGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, true)); // Default: active, not supercharged
				})
			);
			useGridStore.setState({ grid: defaultTestGrid, isSharedGrid: false, result: null });
		});
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("should revert cell to provided initial state", () => {
		const originalState = {
			...createEmptyCell(false, true),
			active: true,
			supercharged: false,
		};

		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = false;
				state.grid.cells[0][0].supercharged = true;
			});
		});

		act(() => {
			useGridStore.getState().revertCellTap(0, 0, originalState);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(true);
		expect(finalCell.supercharged).toBe(false);
	});

	it("should not change cell state if cell is undefined", () => {
		const originalState = createEmptyCell(false, true);
		const initialGrid = useGridStore.getState().grid;

		act(() => {
			useGridStore.getState().revertCellTap(99, 99, originalState); // Non-existent cell
		});

		// Expect no changes or errors
		expect(useGridStore.getState().grid).toEqual(initialGrid);
	});
});
