import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGridCellElementId, useGridFocusStore } from "./useGridFocusStore";

describe("useGridFocusStore", () => {
	beforeEach(() => {
		useGridFocusStore.getState().resetFocus();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("computes element ID correctly with getGridCellElementId", () => {
		expect(getGridCellElementId(2, 4)).toBe("grid-cell-2-4");
	});

	it("initializes with focused cell at (0, 0)", () => {
		const state = useGridFocusStore.getState();
		expect(state.focusedRow).toBe(0);
		expect(state.focusedCol).toBe(0);
	});

	it("updates focused cell coordinates with setFocusedCell", () => {
		useGridFocusStore.getState().setFocusedCell(3, 5);
		const state = useGridFocusStore.getState();
		expect(state.focusedRow).toBe(3);
		expect(state.focusedCol).toBe(5);
	});

	it("resets focus back to (0, 0)", () => {
		useGridFocusStore.getState().setFocusedCell(4, 7);
		useGridFocusStore.getState().resetFocus();
		const state = useGridFocusStore.getState();
		expect(state.focusedRow).toBe(0);
		expect(state.focusedCol).toBe(0);
	});

	it("navigates down and right with arrow keys and updates store", () => {
		const dummyElement = document.createElement("div");
		const spyFocus = vi.spyOn(dummyElement, "focus");
		vi.spyOn(document, "getElementById").mockReturnValue(dummyElement);

		const store = useGridFocusStore.getState();
		const handledDown = store.navigateGrid("ArrowDown", 0, 0, 10, 6, false);
		expect(handledDown).toBe(true);
		expect(useGridFocusStore.getState().focusedRow).toBe(1);
		expect(useGridFocusStore.getState().focusedCol).toBe(0);
		expect(spyFocus).toHaveBeenCalled();

		const handledRight = store.navigateGrid("ArrowRight", 1, 0, 10, 6, false);
		expect(handledRight).toBe(true);
		expect(useGridFocusStore.getState().focusedRow).toBe(1);
		expect(useGridFocusStore.getState().focusedCol).toBe(1);
	});

	it("returns false for non-navigation keys", () => {
		const store = useGridFocusStore.getState();
		expect(store.navigateGrid("Enter", 0, 0, 10, 6, false)).toBe(false);
		expect(store.navigateGrid("a", 0, 0, 10, 6, false)).toBe(false);
	});
});
