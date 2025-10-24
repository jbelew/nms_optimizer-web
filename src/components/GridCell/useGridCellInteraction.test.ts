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

const mockUseGridStore = useGridStore as unknown as Mock;
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

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		// Reset mocks to default state before each test
		mockUseGridStore.mockImplementation((selector) => {
			if (typeof selector === "function") {
				return selector(baseMockGridStoreState);
			}
			return baseMockGridStoreState;
		});

		(useGridStore as unknown as { getState: () => typeof baseMockGridStoreState }).getState =
			() => baseMockGridStoreState;

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

	const renderGridCellHook = (cellOverrides = {}, isSharedGrid = false) => {
		const cell = {
			active: false,
			supercharged: false,
			module: "some-module",
			...cellOverrides,
		} as Cell;

		return renderHook(() => useGridCellInteraction(cell, 0, 0, isSharedGrid));
	};

	it("should call handleCellTap on single click", () => {
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart();
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500); // Advance timers to clear lastTapTime
		expect(mockHandleCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
		expect(mockRevertCellTap).not.toHaveBeenCalled();
		expect(mockTriggerShake).not.toHaveBeenCalled();
	});

	it("should call handleCellDoubleTap on double click", () => {
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100); // Simulate a quick second click
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500); // Advance timers to clear lastTapTime
		expect(mockHandleCellDoubleTap).toHaveBeenCalledWith(0, 0);
		expect(mockRevertCellTap).not.toHaveBeenCalled();
		expect(mockTriggerShake).not.toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if superchargedFixed on double tap", () => {
		(useGridStore as unknown as { getState: () => typeof baseMockGridStoreState }).getState =
			() => ({
				...baseMockGridStoreState,
				superchargedFixed: true,
			});

		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if gridFixed on double tap", () => {
		(useGridStore as unknown as { getState: () => typeof baseMockGridStoreState }).getState =
			() => ({ ...baseMockGridStoreState, gridFixed: true });

		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if totalSupercharged >= 4 and cell is not supercharged on double tap", () => {
		(useGridStore as unknown as { getState: () => typeof baseMockGridStoreState }).getState =
			() => ({
				...baseMockGridStoreState,
				selectTotalSuperchargedCells: vi.fn(() => 4),
			});

		const { result } = renderGridCellHook({ supercharged: false });
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should trigger shake and not call handleCellTap if gridFixed on single tap", () => {
		(useGridStore as unknown as { getState: () => typeof baseMockGridStoreState }).getState =
			() => ({ ...baseMockGridStoreState, gridFixed: true });

		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should trigger shake and not call handleCellTap if superchargedFixed and cell is supercharged on single tap", () => {
		(useGridStore as unknown as { getState: () => typeof baseMockGridStoreState }).getState =
			() => ({
				...baseMockGridStoreState,
				superchargedFixed: true,
			});

		const { result } = renderGridCellHook({ supercharged: true });
		act(() => {
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should not interact if isSharedGrid is true", () => {
		const { result } = renderGridCellHook({}, true); // isSharedGrid = true
		act(() => {
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
		expect(mockRevertCellTap).not.toHaveBeenCalled();
		expect(mockTriggerShake).not.toHaveBeenCalled();
	});

	it("should prevent default on context menu", () => {
		const { result } = renderGridCellHook();
		const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
		act(() => {
			result.current.handleContextMenu(mockEvent);
		});
		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it("should call handleClick on spacebar key down", () => {
		const { result } = renderGridCellHook();
		const mockEvent = { key: " ", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(mockEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockToggleCellActive).toHaveBeenCalledWith(0, 0);
	});

	it("should call handleClick on enter key down", () => {
		const { result } = renderGridCellHook();
		const mockEvent = {
			key: "Enter",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(mockEvent);
		});
		vi.advanceTimersByTime(500);
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
			result.current.handleTouchStart(); // First set to true
		});
		expect(result.current.isTouching).toBe(true);
		act(() => {
			result.current.handleTouchEnd();
		});
		expect(result.current.isTouching).toBe(false);
	});
});
