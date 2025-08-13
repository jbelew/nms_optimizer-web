import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import { useGridCellInteraction } from "./useGridCellInteraction";

// Mock the GridStore and its actions
vi.mock("../../store/GridStore", () => ({
	useGridStore: vi.fn(),
}));

// Mock the ShakeStore
vi.mock("../../store/ShakeStore", () => ({
	useShakeStore: vi.fn(),
}));

describe("useGridCellInteraction", () => {
	let mockHandleCellTap: vi.Mock;
	let mockHandleCellDoubleTap: vi.Mock;
	let mockRevertCellTap: vi.Mock;
	let mockSelectTotalSuperchargedCells: vi.Mock;
	let mockSetShaking: vi.Mock;
	let mockToggleCellActive: vi.Mock;
	let mockToggleCellSupercharged: vi.Mock;
	let mockClearInitialCellStateForTap: vi.Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		mockHandleCellTap = vi.fn();
		mockHandleCellDoubleTap = vi.fn();
		mockRevertCellTap = vi.fn();
		mockSelectTotalSuperchargedCells = vi.fn(() => 0);
		mockSetShaking = vi.fn();
		mockToggleCellActive = vi.fn();
		mockToggleCellSupercharged = vi.fn();
		mockClearInitialCellStateForTap = vi.fn();

		(useGridStore as unknown as vi.Mock).mockImplementation((selector) => {
			const state = {
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
			return selector(state);
		});

		(useShakeStore as unknown as vi.Mock).mockImplementation(() => ({
			setShaking: mockSetShaking,
		}));
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
		} as Cell; // Cast to any to allow partial Cell type for testing

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
		expect(mockSetShaking).not.toHaveBeenCalled();
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
		expect(mockSetShaking).not.toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if superchargedFixed on double tap", () => {
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) =>
			selector({
				handleCellTap: mockHandleCellTap,
				handleCellDoubleTap: mockHandleCellDoubleTap,
				revertCellTap: mockRevertCellTap,
				selectTotalSuperchargedCells: mockSelectTotalSuperchargedCells,
				superchargedFixed: true,
				gridFixed: false,
			})
		);
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockSetShaking).toHaveBeenCalledWith(true);
		vi.advanceTimersByTime(500); // For shake timeout
		expect(mockSetShaking).toHaveBeenCalledWith(false);
	});

	it("should call revertCellTap and trigger shake if gridFixed on double tap", () => {
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) =>
			selector({
				handleCellTap: mockHandleCellTap,
				handleCellDoubleTap: mockHandleCellDoubleTap,
				revertCellTap: mockRevertCellTap,
				selectTotalSuperchargedCells: mockSelectTotalSuperchargedCells,
				superchargedFixed: false,
				gridFixed: true,
				clearInitialCellStateForTap: mockClearInitialCellStateForTap,
			})
		);
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockSetShaking).toHaveBeenCalledWith(true);
		vi.advanceTimersByTime(500); // For shake timeout
		expect(mockSetShaking).toHaveBeenCalledWith(false);
	});

	it("should call revertCellTap and trigger shake if totalSupercharged >= 4 and cell is not supercharged on double tap", () => {
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) =>
			selector({
				handleCellTap: mockHandleCellTap,
				handleCellDoubleTap: mockHandleCellDoubleTap,
				revertCellTap: mockRevertCellTap,
				selectTotalSuperchargedCells: vi.fn(() => 4),
				superchargedFixed: false,
				gridFixed: false,
			})
		);
		const { result } = renderGridCellHook({ supercharged: false });
		act(() => {
			result.current.handleTouchStart(); // Enable touch interaction
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
			vi.advanceTimersByTime(100);
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockSetShaking).toHaveBeenCalledWith(true);
		vi.advanceTimersByTime(500); // For shake timeout
		expect(mockSetShaking).toHaveBeenCalledWith(false);
	});

	it("should trigger shake and not call handleCellTap if gridFixed on single tap", () => {
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) =>
			selector({
				handleCellTap: mockHandleCellTap,
				handleCellDoubleTap: mockHandleCellDoubleTap,
				revertCellTap: mockRevertCellTap,
				selectTotalSuperchargedCells: mockSelectTotalSuperchargedCells,
				superchargedFixed: false,
				gridFixed: true,
			})
		);
		const { result } = renderGridCellHook();
		act(() => {
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockSetShaking).toHaveBeenCalledWith(true);
		vi.advanceTimersByTime(500); // For shake timeout
		expect(mockSetShaking).toHaveBeenCalledWith(false);
	});

	it("should trigger shake and not call handleCellTap if superchargedFixed and cell is supercharged on single tap", () => {
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) =>
			selector({
				handleCellTap: mockHandleCellTap,
				handleCellDoubleTap: mockHandleCellDoubleTap,
				revertCellTap: mockRevertCellTap,
				selectTotalSuperchargedCells: mockSelectTotalSuperchargedCells,
				superchargedFixed: true,
				gridFixed: false,
				clearInitialCellStateForTap: mockClearInitialCellStateForTap,
			})
		);
		const { result } = renderGridCellHook({ supercharged: true });
		act(() => {
			result.current.handleClick({ ctrlKey: false, metaKey: false } as React.MouseEvent);
		});
		vi.advanceTimersByTime(500);
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockSetShaking).toHaveBeenCalledWith(true);
		vi.advanceTimersByTime(500); // For shake timeout
		expect(mockSetShaking).toHaveBeenCalledWith(false);
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
		expect(mockSetShaking).not.toHaveBeenCalled();
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
