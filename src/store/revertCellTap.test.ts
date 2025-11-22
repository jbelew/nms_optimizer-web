import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "./GridStore";

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
			useGridStore.setState({ grid: defaultTestGrid, result: null, isSharedGrid: false });
		});
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("should revert cell to initial state", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = false;
				state.grid.cells[0][0].supercharged = true;
				state._initialCellStateForTap = {
					...state.grid.cells[0][0],
					active: true,
					supercharged: false,
				};
			});
		});

		act(() => {
			useGridStore.getState().revertCellTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(true);
		expect(finalCell.supercharged).toBe(false);
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull();
	});

	it("should not change cell state if initialCellStateForTap is null", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = false;
				state.grid.cells[0][0].supercharged = true;
				state._initialCellStateForTap = null;
			});
		});

		act(() => {
			useGridStore.getState().revertCellTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(false);
		expect(finalCell.supercharged).toBe(true);
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull();
	});

	it("should not change cell state if cell is undefined", () => {
		act(() => {
			useGridStore.setState((state) => {
				state._initialCellStateForTap = { ...state.grid.cells[0][0] };
			});
		});

		act(() => {
			useGridStore.getState().revertCellTap(99, 99); // Non-existent cell
		});

		// Expect no changes or errors
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull(); // Should remain as it was
	});
});
