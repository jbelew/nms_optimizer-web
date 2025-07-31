import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "../GridStore";

describe("handleCellDoubleTap action in GridStore", () => {
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

	it("should supercharge an active, non-supercharged cell on double tap", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = true;
				state.grid.cells[0][0].supercharged = false;
				state._initialCellStateForTap = { ...state.grid.cells[0][0] };
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.supercharged).toBe(true);
		expect(finalCell.active).toBe(true);
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull();
	});

	it("should de-supercharge an active, supercharged cell on double tap", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = true;
				state.grid.cells[0][0].supercharged = true;
				state._initialCellStateForTap = { ...state.grid.cells[0][0] };
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.supercharged).toBe(false);
		expect(finalCell.active).toBe(true);
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull();
	});

	it("should activate a cell on double tap even if it was inactive initially", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = false;
				state.grid.cells[0][0].supercharged = false;
				state._initialCellStateForTap = { ...state.grid.cells[0][0] };
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(true);
		expect(finalCell.supercharged).toBe(true); // Should become supercharged as it was false initially
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull();
	});

	it("should not change cell state if initialCellStateForTap is null", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = true;
				state.grid.cells[0][0].supercharged = false;
				state._initialCellStateForTap = null; // Simulate no initial tap
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(true);
		expect(finalCell.supercharged).toBe(false);
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull();
	});

	it("should not change cell state if cell is undefined", () => {
		act(() => {
			useGridStore.setState((state) => {
				state._initialCellStateForTap = { ...state.grid.cells[0][0] };
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(99, 99); // Non-existent cell
		});

		// Expect no changes or errors
		expect(useGridStore.getState()._initialCellStateForTap).toBeNull(); // Should remain as it was
	});
});
