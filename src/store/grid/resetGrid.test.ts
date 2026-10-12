import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useGridStore } from "./gridStore";

describe("resetGrid in GridStore", () => {
	beforeEach(() => {
		act(() => {
			useGridStore.getState().resetGrid();
		});
	});

	it("atomically resets cells, result, shared flag, build name, and interaction state in a single action", () => {
		act(() => {
			useGridStore.setState({
				_initialCellStateForTap: {
					active: true,
					adjacency: "",
					adjacency_bonus: 0,
					bonus: 0,
					group_adjacent: false,
					image: "",
					label: "Test",
					module: "mod-1",
					sc_eligible: true,
					supercharged: false,
					tech: "mining",
					total: 0,
					type: "mining",
					value: 10,
				},
				_lastTapCell: [2, 3],
				_lastTapTime: 123456789,
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
		expect(useGridStore.getState()._lastTapCell).toEqual([2, 3]);

		act(() => {
			useGridStore.getState().resetGrid();
		});

		const state = useGridStore.getState();
		expect(state.result).toBeNull();
		expect(state.isSharedGrid).toBe(false);
		expect(state.buildName).toBeNull();
		expect(state._initialCellStateForTap).toBeNull();
		expect(state._lastTapCell).toEqual([-1, -1]);
		expect(state._lastTapTime).toBe(0);
		expect(state.hasModulesInGrid).toBe(false);
		expect(state.activeTechs.size).toBe(0);
	});
});
