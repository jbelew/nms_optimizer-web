import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useGridStore } from "./gridStore";

describe("resetGrid in GridStore", () => {
	beforeEach(() => {
		act(() => {
			useGridStore.getState().resetGrid();
		});
	});

	it("atomically resets cells, result, shared flag, build name, and tap gesture state in a single action", () => {
		const now = 1_000_000;

		act(() => {
			// Register an initial single tap on [0, 0] before resetting
			useGridStore.getState().registerCellTap(0, 0, now);
			useGridStore.setState({
				buildName: "Custom Build",
				hasModulesInGrid: true,
				isSharedGrid: true,
				result: {
					grid: null,
					maxBonus: 100,
					solvedBonus: 100,
					solveMethod: "method",
				},
			});
		});

		expect(useGridStore.getState().isSharedGrid).toBe(true);
		expect(useGridStore.getState().buildName).toBe("Custom Build");

		act(() => {
			useGridStore.getState().resetGrid();
		});

		const state = useGridStore.getState();
		expect(state.result).toBeNull();
		expect(state.isSharedGrid).toBe(false);
		expect(state.buildName).toBeNull();
		expect(state.hasModulesInGrid).toBe(false);
		expect(state.activeTechs.size).toBe(0);

		// A tap on [0, 0] within DOUBLE_TAP_THRESHOLD after resetGrid must be treated as a single tap, not a double tap
		act(() => {
			useGridStore.getState().registerCellTap(0, 0, now + 50);
		});
		expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);
	});
});
