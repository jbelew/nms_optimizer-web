import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../GridStore";

describe("handleCellTap action in GridStore", () => {
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

	it("should activate an inactive cell on single tap", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = false;
			});
		});

		act(() => {
			useGridStore.getState().handleCellTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(true);
		expect(finalCell.supercharged).toBe(false);
	});

	it("should deactivate an active cell on single tap and set supercharged to false", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = true;
				state.grid.cells[0][0].supercharged = true;
			});
		});

		act(() => {
			useGridStore.getState().handleCellTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(false);
		expect(finalCell.supercharged).toBe(false);
	});

	it("should store initial cell state on first tap", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = true;
				state.grid.cells[0][0].supercharged = false;
			});
		});

		act(() => {
			useGridStore.getState().handleCellTap(0, 0);
		});

		const storedState = useGridStore.getState()._initialCellStateForTap;
		expect(storedState).toBeDefined();
		expect(storedState?.active).toBe(true);
		expect(storedState?.supercharged).toBe(false);
	});

	it("should not change cell state if cell is undefined", () => {
		const { handleCellTap } = useGridStore.getState();
		const initialState = useGridStore.getState().grid.cells[0][0];
		useGridStore.setState({ _initialCellStateForTap: initialState });

		handleCellTap(999, 999); // Use out-of-bounds indices

		// Expect no changes or errors
		expect(useGridStore.getState()._initialCellStateForTap).toEqual(initialState);
	});
});
