import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

	describe("setCellActive", () => {
		it("returns true and updates cell when valid", () => {
			let result = false;
			act(() => {
				result = useGridStore.getState().setCellActive(0, 0, true);
			});

			expect(result).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
		});

		it("returns true when target state is already active", () => {
			act(() => {
				useGridStore.setState((state) => {
					state.grid.cells[0][0].active = true;
				});
			});

			let result = false;
			act(() => {
				result = useGridStore.getState().setCellActive(0, 0, true);
			});

			expect(result).toBe(true);
		});

		it("returns false and triggers shake/count when grid layout is locked", () => {
			act(() => {
				useGridStore.setState({ gridFixed: true });
			});

			const shakeSpy = vi.spyOn(useUiStore.getState(), "triggerShake");
			const incrementSpy = vi.spyOn(useUiStore.getState(), "incrementGridFixedCount");

			let result = true;
			act(() => {
				result = useGridStore.getState().setCellActive(0, 0, true);
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
				result = useGridStore.getState().setCellActive(0, 0, false);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[0][0].active).toBe(true);
			expect(shakeSpy).toHaveBeenCalled();
			expect(incrementSpy).toHaveBeenCalled();

			shakeSpy.mockRestore();
			incrementSpy.mockRestore();
		});
	});

	describe("setCellSupercharged", () => {
		it("returns true and updates cell when valid", () => {
			act(() => {
				useGridStore.setState((state) => {
					state.grid.cells[0][0].active = true;
				});
			});

			let result = false;
			act(() => {
				result = useGridStore.getState().setCellSupercharged(0, 0, true);
			});

			expect(result).toBe(true);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(true);
		});

		it("returns false when cell is inactive", () => {
			let result = true;
			act(() => {
				result = useGridStore.getState().setCellSupercharged(0, 0, true);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[0][0].supercharged).toBe(false);
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
				result = useGridStore.getState().setCellSupercharged(0, 4, true);
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
				result = useGridStore.getState().setCellSupercharged(4, 0, true);
			});

			expect(result).toBe(false);
			expect(useGridStore.getState().grid.cells[4][0].supercharged).toBe(false);
			expect(shakeSpy).toHaveBeenCalled();
			expect(incrementSpy).toHaveBeenCalled();

			shakeSpy.mockRestore();
			incrementSpy.mockRestore();
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
	});
});
