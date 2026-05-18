import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, createGrid, useGridStore } from "./gridStore";

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
			useGridStore.setState({ grid: defaultTestGrid, isSharedGrid: false, result: null });
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
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.supercharged).toBe(true);
		expect(finalCell.active).toBe(true);
	});

	it("should de-supercharge an active, supercharged cell on double tap", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = true;
				state.grid.cells[0][0].supercharged = true;
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.supercharged).toBe(false);
		expect(finalCell.active).toBe(true);
	});

	it("should activate a cell on double tap even if it was inactive initially", () => {
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][0].active = false;
				state.grid.cells[0][0].supercharged = false;
			});
		});

		act(() => {
			useGridStore.getState().handleCellDoubleTap(0, 0);
		});

		const finalCell = useGridStore.getState().grid.cells[0][0];
		expect(finalCell.active).toBe(true);
		expect(finalCell.supercharged).toBe(true); // Should become supercharged as it was false initially
	});

	it("should not change cell state if cell is undefined", () => {
		const initialGrid = useGridStore.getState().grid;

		act(() => {
			useGridStore.getState().handleCellDoubleTap(99, 99); // Non-existent cell
		});

		// Expect no changes
		expect(useGridStore.getState().grid).toEqual(initialGrid);
	});
});
