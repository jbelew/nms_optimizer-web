import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as toastModule from "@/hooks/useToast/useToast";
import { useUiStore } from "@/store/ui/uiStore";

import { createGrid, useGridStore } from "./gridStore";

describe("GridStore actions with validation", () => {
	beforeEach(() => {
		act(() => {
			useGridStore.getState().resetGrid();
			useUiStore.getState().resetSession();
			const testGrid = createGrid(5, 5);
			useGridStore.setState({
				grid: testGrid,
				gridFixed: false,
				superchargedFixed: false,
			});
		});
	});

	describe("toggleCellActive", () => {
		it("returns true and toggles active state when valid", () => {
			let result = false;
			act(() => {
				result = useGridStore.getState().toggleCellActive(0, 0);
			});

			expect(result).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
		});

		it("returns false and triggers shake/count when layout is fixed", () => {
			act(() => {
				useGridStore.setState({ gridFixed: true });
			});

			const shakeSpy = vi.spyOn(useUiStore.getState(), "triggerShake");
			const incrementSpy = vi.spyOn(useUiStore.getState(), "incrementGridFixedCount");

			let result = true;
			act(() => {
				result = useGridStore.getState().toggleCellActive(0, 0);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(false);
			expect(shakeSpy).toHaveBeenCalled();
			expect(incrementSpy).toHaveBeenCalled();

			shakeSpy.mockRestore();
			incrementSpy.mockRestore();
		});

		it("returns false and triggers shake/count when target cell contains a module", () => {
			act(() => {
				useGridStore.setState((state) => {
					state.grid.cells[0][0].active = true;
					state.grid.cells[0][0].module = "some-module-id";
				});
			});

			const shakeSpy = vi.spyOn(useUiStore.getState(), "triggerShake");
			const incrementSpy = vi.spyOn(useUiStore.getState(), "incrementModuleLockedCount");

			let result = true;
			act(() => {
				result = useGridStore.getState().toggleCellActive(0, 0);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
			expect(shakeSpy).toHaveBeenCalled();
			expect(incrementSpy).toHaveBeenCalled();

			shakeSpy.mockRestore();
			incrementSpy.mockRestore();
		});
	});

	describe("toggleCellSupercharged", () => {
		it("returns true and toggles supercharged state when valid", () => {
			let result = false;
			act(() => {
				result = useGridStore.getState().toggleCellSupercharged(0, 0);
			});

			expect(result).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(true);
		});

		it("returns false and triggers shake/count when supercharged limit of 4 is exceeded", () => {
			act(() => {
				useGridStore.setState((state) => {
					state.grid.cells[0][0].active = true;
					state.grid.cells[0][1].active = true;
					state.grid.cells[0][2].active = true;
					state.grid.cells[0][3].active = true;
					state.grid.cells[0][4].active = true;

					state.grid.cells[0][0].supercharged = true;
					state.grid.cells[0][1].supercharged = true;
					state.grid.cells[0][2].supercharged = true;
					state.grid.cells[0][3].supercharged = true;
				});
				useGridStore.getState().triggerRecompute();
			});

			const shakeSpy = vi.spyOn(useUiStore.getState(), "triggerShake");
			const incrementSpy = vi.spyOn(useUiStore.getState(), "incrementSuperchargedLimitCount");

			let result = true;
			act(() => {
				result = useGridStore.getState().toggleCellSupercharged(0, 4);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[0][4].supercharged).toBe(false);
			expect(shakeSpy).toHaveBeenCalled();
			expect(incrementSpy).toHaveBeenCalled();

			shakeSpy.mockRestore();
			incrementSpy.mockRestore();
		});

		it("returns false and triggers shake/count when rowIndex >= 4", () => {
			act(() => {
				useGridStore.setState((state) => {
					state.grid.cells[4][0].active = true;
				});
			});

			const shakeSpy = vi.spyOn(useUiStore.getState(), "triggerShake");
			const incrementSpy = vi.spyOn(useUiStore.getState(), "incrementRowLimitCount");

			let result = true;
			act(() => {
				result = useGridStore.getState().toggleCellSupercharged(4, 0);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[4][0].supercharged).toBe(false);
			expect(shakeSpy).toHaveBeenCalled();
			expect(incrementSpy).toHaveBeenCalled();

			shakeSpy.mockRestore();
			incrementSpy.mockRestore();
		});
	});

	describe("Slot Restriction threshold warning toast", () => {
		it("dispatches showGlobalError once on the 3rd violation of a reason and resets after resetSession", () => {
			const errorToastSpy = vi.spyOn(toastModule, "showGlobalError");
			act(() => {
				useGridStore.setState({ gridFixed: true });
			});

			// 1st and 2nd attempts shake the grid without dispatching a toast
			act(() => {
				useGridStore.getState().toggleCellActive(0, 0);
				useGridStore.getState().toggleCellActive(0, 0);
			});
			expect(errorToastSpy).not.toHaveBeenCalled();

			// 3rd attempt dispatches the restriction warning toast once
			act(() => {
				useGridStore.getState().toggleCellActive(0, 0);
			});
			expect(errorToastSpy).toHaveBeenCalledTimes(1);
			expect(errorToastSpy).toHaveBeenCalledWith(
				"restrictions.title",
				"restrictions.gridFixed",
				5000
			);

			// 4th attempt does not re-dispatch in the same session
			act(() => {
				useGridStore.getState().toggleCellActive(0, 0);
			});
			expect(errorToastSpy).toHaveBeenCalledTimes(1);

			// Resetting the session allows the 3rd subsequent violation to dispatch again
			act(() => {
				useUiStore.getState().resetSession();
				useGridStore.getState().toggleCellActive(0, 0);
				useGridStore.getState().toggleCellActive(0, 0);
				useGridStore.getState().toggleCellActive(0, 0);
			});
			expect(errorToastSpy).toHaveBeenCalledTimes(2);

			errorToastSpy.mockRestore();
		});
	});
});
