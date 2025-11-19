import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

// We need to import from the mocked modules
import { Cell, useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import { useGridCellInteraction } from "./useGridCellInteraction";

// Mock stores
vi.mock("../../store/GridStore");
vi.mock("../../store/ShakeStore");

// Define mock functions
const mockHandleCellTap = vi.fn();
const mockHandleCellDoubleTap = vi.fn();
const mockRevertCellTap = vi.fn();
const mockToggleCellActive = vi.fn();
const mockToggleCellSupercharged = vi.fn();
const mockClearInitialCellStateForTap = vi.fn();
const mockTriggerShake = vi.fn();
const mockSelectTotalSuperchargedCells = vi.fn(() => 0);

const mockUseShakeStore = useShakeStore as unknown as Mock;

describe("useGridCellInteraction", () => {
	const baseMockGridStoreState = {
		handleCellTap: mockHandleCellTap,
		handleCellDoubleTap: mockHandleCellDoubleTap,
		revertCellTap: mockRevertCellTap,
		selectTotalSuperchargedCells: mockSelectTotalSuperchargedCells,
		superchargedFixed: false,
		gridFixed: false,
		toggleCellActive: mockToggleCellActive,
		toggleCellSupercharged: mockToggleCellSupercharged,
		clearInitialCellStateForTap: mockClearInitialCellStateForTap,
	};

	let mockGetState: Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		mockGetState = vi.fn(() => baseMockGridStoreState);
		(useGridStore as unknown as { getState: Mock }).getState = mockGetState;

		mockUseShakeStore.mockImplementation((selector) => {
			const state = { triggerShake: mockTriggerShake };
			if (typeof selector === "function") {
				return selector(state);
			}
			return state;
		});
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	const renderGridCellHook = (cellOverrides = {}, isSharedGrid = false, rowIndex = 0) => {
		const cell = {
			active: false,
			supercharged: false,
			module: null, // Default to empty cell
			...cellOverrides,
		} as Cell;

		return renderHook(() => useGridCellInteraction(cell, rowIndex, 0, isSharedGrid));
	};

	it("should call handleCellTap on single click on empty cell", () => {
		const { result } = renderGridCellHook({ module: null });
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
	});

	it("should call handleCellDoubleTap on double click on empty cell", () => {
		const { result } = renderGridCellHook({ module: null });
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({} as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellDoubleTap).toHaveBeenCalledWith(0, 0);
	});

	it("should trigger shake and do nothing else if cell has a module", () => {
		const { result } = renderGridCellHook({ module: "some-module" });
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockTriggerShake).toHaveBeenCalled();
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if superchargedFixed on double tap", () => {
		mockGetState.mockReturnValue({
			...baseMockGridStoreState,
			superchargedFixed: true,
		});

		const { result } = renderGridCellHook({ module: null });
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({} as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if gridFixed on double tap", () => {
		mockGetState.mockReturnValue({ ...baseMockGridStoreState, gridFixed: true });

		const { result } = renderGridCellHook({ module: null });
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({} as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if totalSupercharged >= 4 on double tap", () => {
		mockGetState.mockReturnValue({
			...baseMockGridStoreState,
			selectTotalSuperchargedCells: vi.fn(() => 4),
		});

		const { result } = renderGridCellHook({ module: null, supercharged: false });
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({} as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should not interact if isSharedGrid is true", () => {
		const { result } = renderGridCellHook({}, true);
		act(() => {
			result.current.handleClick({} as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
	});

	it("should prevent default on context menu", () => {
		const { result } = renderGridCellHook();
		const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
		act(() => {
			result.current.handleContextMenu(mockEvent);
		});
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it("should toggle active on spacebar key down", () => {
		const { result } = renderGridCellHook();
		const mockEvent = { key: " ", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(mockEvent);
		});
		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockToggleCellActive).toHaveBeenCalledWith(0, 0);
	});

	it("should toggle active on enter key down", () => {
		const { result } = renderGridCellHook();
		const mockEvent = {
			key: "Enter",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(mockEvent);
		});
		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockToggleCellActive).toHaveBeenCalledWith(0, 0);
	});

	it("should set isTouching to true on touch start", () => {
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart();
		});
		expect(result.current.isTouching).toBe(true);
	});

	it("should set isTouching to false on touch end", () => {
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart();
		});
		expect(result.current.isTouching).toBe(true);
		act(() => {
			result.current.handleTouchEnd();
			// Run the safety timeout
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.isTouching).toBe(false);
	});

	describe("module blocking - preventing state changes", () => {
		it("should trigger shake on mouse click and not toggle supercharged when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleClick({} as React.MouseEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
		});

		it("should trigger shake on Ctrl+Click and not toggle active when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleClick({ ctrlKey: true } as React.MouseEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockToggleCellActive).not.toHaveBeenCalled();
		});

		it("should trigger shake on touch tap and not call handleCellTap when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleTouchStart();
				result.current.handleClick({} as React.MouseEvent);
			});
			vi.advanceTimersByTime(500);
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockHandleCellTap).not.toHaveBeenCalled();
		});

		it("should trigger shake on double-tap and not call handleCellDoubleTap when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleTouchStart();
				result.current.handleClick({} as React.MouseEvent);
				vi.advanceTimersByTime(100);
				result.current.handleClick({} as React.MouseEvent);
			});
			vi.advanceTimersByTime(500);
			// Both clicks should trigger shake (once each)
			expect(mockTriggerShake).toHaveBeenCalledTimes(2);
			expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
		});

		it("should trigger shake on keyboard spacebar and not toggle active when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			const mockEvent = {
				key: " ",
				preventDefault: vi.fn(),
			} as unknown as React.KeyboardEvent;
			act(() => {
				result.current.handleKeyDown(mockEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockToggleCellActive).not.toHaveBeenCalled();
		});

		it("should trigger shake on keyboard enter and not toggle active when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			const mockEvent = {
				key: "Enter",
				preventDefault: vi.fn(),
			} as unknown as React.KeyboardEvent;
			act(() => {
				result.current.handleKeyDown(mockEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockToggleCellActive).not.toHaveBeenCalled();
		});

		it("should block all interactions when module is present (mixed click and keyboard)", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				// Mouse click
				result.current.handleClick({} as React.MouseEvent);
				// Keyboard
				const keyEvent = {
					key: " ",
					preventDefault: vi.fn(),
				} as unknown as React.KeyboardEvent;
				result.current.handleKeyDown(keyEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(2);
			expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
			expect(mockToggleCellActive).not.toHaveBeenCalled();
		});

		it("should allow interactions when module is null", () => {
			const { result } = renderGridCellHook({ module: null });
			act(() => {
				result.current.handleTouchStart();
				result.current.handleClick({} as React.MouseEvent);
			});
			vi.advanceTimersByTime(500);
			expect(mockHandleCellTap).toHaveBeenCalled();
			expect(mockTriggerShake).not.toHaveBeenCalled();
		});
	});

	describe("supercharge row limit - first 4 rows only", () => {
		it("should block supercharging on row 4 and trigger shake", () => {
			const { result } = renderGridCellHook({ module: null }, false, 4);
			act(() => {
				result.current.handleClick({} as React.MouseEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalled();
			expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
		});

		it("should block supercharging on row 5 and trigger shake", () => {
			const { result } = renderGridCellHook({ module: null }, false, 5);
			act(() => {
				result.current.handleClick({} as React.MouseEvent);
			});
			expect(mockTriggerShake).toHaveBeenCalled();
			expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
		});

		it("should allow supercharging on row 0", () => {
			const { result } = renderGridCellHook({ module: null }, false, 0);
			act(() => {
				result.current.handleClick({} as React.MouseEvent);
			});
			expect(mockToggleCellSupercharged).toHaveBeenCalledWith(0, 0);
			expect(mockTriggerShake).not.toHaveBeenCalled();
		});

		it("should allow supercharging on row 3", () => {
			const { result } = renderGridCellHook({ module: null }, false, 3);
			act(() => {
				result.current.handleClick({} as React.MouseEvent);
			});
			expect(mockToggleCellSupercharged).toHaveBeenCalledWith(3, 0);
			expect(mockTriggerShake).not.toHaveBeenCalled();
		});

		it("should block double-tap supercharge on row 4", () => {
			const { result } = renderGridCellHook({ module: null }, false, 4);
			act(() => {
				result.current.handleTouchStart();
				result.current.handleClick({} as React.MouseEvent);
				vi.advanceTimersByTime(100);
				result.current.handleClick({} as React.MouseEvent);
			});
			vi.advanceTimersByTime(500);
			expect(mockTriggerShake).toHaveBeenCalled();
			expect(mockRevertCellTap).toHaveBeenCalled();
			expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
		});
	});
});
