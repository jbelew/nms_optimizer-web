import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUiStore } from "@/store/ui/uiStore";

import { createEmptyCell, createGrid, useGridStore } from "./gridStore";

describe("registerCellTap action in GridStore", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		act(() => {
			useGridStore.getState().resetGrid();
			useGridStore.getState().clearInteractionState();
			useUiStore.getState().resetSession();
			useUiStore.setState({ shakeCount: 0 });

			const defaultTestGrid = createGrid(5, 5);
			defaultTestGrid.cells.forEach((row) =>
				row.forEach((cell) => {
					Object.assign(cell, createEmptyCell(false, false)); // Default: inactive, not supercharged
				})
			);
			useGridStore.setState({
				grid: defaultTestGrid,
				gridFixed: false,
				isSharedGrid: false,
				result: null,
				superchargedFixed: false,
			});
		});
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it("should toggle cell active on a single tap", () => {
		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		const cell = useGridStore.getState().grid.cells[0][0];
		expect(cell.active).toBe(true);
		expect(cell.supercharged).toBe(false);
	});

	it("should toggle cell supercharged and active on double tap within threshold", () => {
		const now = Date.now();
		act(() => {
			// First tap
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);

		act(() => {
			// Second tap within 400ms
			useGridStore.getState().registerCellTap(0, 0, now + 100);
		});

		const cell = useGridStore.getState().grid.cells[0][0];
		expect(cell.active).toBe(true);
		expect(cell.supercharged).toBe(true);
	});

	it("should treat taps as two single taps if timing exceeds double tap threshold", () => {
		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);

		act(() => {
			// Second tap after 500ms (threshold is 400ms)
			useGridStore.getState().registerCellTap(0, 0, now + 500);
		});

		const cell = useGridStore.getState().grid.cells[0][0];
		expect(cell.active).toBe(false); // Toggled off
		expect(cell.supercharged).toBe(false);
	});

	it("should treat taps on different cells as single taps even within time threshold", () => {
		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		act(() => {
			useGridStore.getState().registerCellTap(0, 1, now + 100);
		});

		expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
		expect(useGridStore.getState().grid.cells[0][1].active).toBe(true);
		expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);
		expect(useGridStore.getState().grid.cells[0][1].supercharged).toBe(false);
	});

	it("should block single tap and trigger shake if cell has module", () => {
		act(() => {
			useGridStore.getState().grid.cells[0][0].module = "some-module";
		});

		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		const cell = useGridStore.getState().grid.cells[0][0];
		expect(cell.active).toBe(false);
		expect(useUiStore.getState().moduleLockedCount).toBe(1);
		expect(useUiStore.getState().shakeCount).toBe(1);
	});

	it("should block single tap and trigger shake if grid layout is locked", () => {
		act(() => {
			useGridStore.setState({ gridFixed: true });
		});

		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		const cell = useGridStore.getState().grid.cells[0][0];
		expect(cell.active).toBe(false);
		expect(useUiStore.getState().gridFixedCount).toBe(1);
		expect(useUiStore.getState().shakeCount).toBe(1);
	});

	it("should revert first tap active status and trigger shake if double tap fails row limit", () => {
		const now = Date.now();
		// Tap on row 4 (which is >= 4 and therefore violates row limit for supercharging)
		act(() => {
			useGridStore.getState().registerCellTap(4, 0, now);
		});

		expect(useGridStore.getState().grid.cells[4][0].active).toBe(true);

		act(() => {
			useGridStore.getState().registerCellTap(4, 0, now + 100);
		});

		const cell = useGridStore.getState().grid.cells[4][0];
		// Reverted back to the original inactive state
		expect(cell.active).toBe(false);
		expect(cell.supercharged).toBe(false);
		expect(useUiStore.getState().rowLimitCount).toBe(1);
		expect(useUiStore.getState().shakeCount).toBe(1);
	});

	it("should revert first tap active status and trigger shake if double tap exceeds supercharged slots limit", () => {
		// Set 4 other cells as supercharged
		act(() => {
			useGridStore.setState((state) => {
				state.grid.cells[0][1].supercharged = true;
				state.grid.cells[0][2].supercharged = true;
				state.grid.cells[0][3].supercharged = true;
				state.grid.cells[0][4].supercharged = true;
			});
			useGridStore.getState().triggerRecompute();
		});

		expect(useGridStore.getState().totalSuperchargedCells).toBe(4);

		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(1, 0, now);
		});

		expect(useGridStore.getState().grid.cells[1][0].active).toBe(true);

		act(() => {
			useGridStore.getState().registerCellTap(1, 0, now + 100);
		});

		const cell = useGridStore.getState().grid.cells[1][0];
		expect(cell.active).toBe(false); // reverted
		expect(cell.supercharged).toBe(false);
		expect(useUiStore.getState().superchargedLimitCount).toBe(1);
		expect(useUiStore.getState().shakeCount).toBe(1);
	});

	it("should revert first tap active status and trigger shake if double tap is performed when supercharged slots are locked", () => {
		act(() => {
			useGridStore.setState({ superchargedFixed: true });
		});

		const now = Date.now();
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now);
		});

		expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);

		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now + 100);
		});

		const cell = useGridStore.getState().grid.cells[0][0];
		expect(cell.active).toBe(false); // reverted
		expect(cell.supercharged).toBe(false);
		expect(useUiStore.getState().superchargedFixedCount).toBe(1);
		expect(useUiStore.getState().shakeCount).toBe(1);
	});
});
