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

	// Helper for mock events
	const createMockTouchEvent = () =>
		({
			cancelable: true,
			preventDefault: vi.fn(),
		}) as unknown as React.TouchEvent;

	const createMockMouseEvent = (overrides = {}) =>
		({
			cancelable: true,
			preventDefault: vi.fn(),
			ctrlKey: false,
			metaKey: false,
			...overrides,
		}) as unknown as React.MouseEvent;

	it("should call handleCellTap on single tap (touch end) on empty cell", () => {
		const { result } = renderGridCellHook({ module: null });
		const mockEvent = createMockTouchEvent();
		Object.defineProperty(mockEvent, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		act(() => {
			result.current.handleTouchStart(mockEvent);
			result.current.handleTouchEnd(mockEvent);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockHandleCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
	});

	it("should call handleCellDoubleTap on double tap (touch end) on empty cell", () => {
		const { result } = renderGridCellHook({ module: null });
		const mockEvent1 = createMockTouchEvent();
		const mockEvent2 = createMockTouchEvent();

		act(() => {
			// First Tap
			result.current.handleTouchEnd(mockEvent1);
		});

		// Simulate time passing (less than threshold)
		vi.advanceTimersByTime(100);

		act(() => {
			// Second Tap
			result.current.handleTouchEnd(mockEvent2);
		});

		expect(mockEvent1.preventDefault).toHaveBeenCalled();
		expect(mockEvent2.preventDefault).toHaveBeenCalled();
		expect(mockHandleCellDoubleTap).toHaveBeenCalledWith(0, 0);
	});

	it("should trigger shake and do nothing else if cell has a module (Touch)", () => {
		const { result } = renderGridCellHook({ module: "some-module" });
		const mockEvent = createMockTouchEvent();

		act(() => {
			result.current.handleTouchEnd(mockEvent);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockTriggerShake).toHaveBeenCalled();
		expect(mockHandleCellTap).not.toHaveBeenCalled();
		expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
	});

	it("should trigger shake and do nothing else if cell has a module (Mouse)", () => {
		const { result } = renderGridCellHook({ module: "some-module" });
		const mockEvent = createMockMouseEvent();

		act(() => {
			result.current.handleClick(mockEvent);
		});

		expect(mockTriggerShake).toHaveBeenCalled();
		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if superchargedFixed on double tap", () => {
		mockGetState.mockReturnValue({
			...baseMockGridStoreState,
			superchargedFixed: true,
		});

		const { result } = renderGridCellHook({ module: null });

		act(() => {
			result.current.handleTouchEnd(createMockTouchEvent());
		});
		vi.advanceTimersByTime(100);
		act(() => {
			result.current.handleTouchEnd(createMockTouchEvent());
		});

		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should call revertCellTap and trigger shake if gridFixed on double tap", () => {
		mockGetState.mockReturnValue({ ...baseMockGridStoreState, gridFixed: true });

		const { result } = renderGridCellHook({ module: null });

		act(() => {
			result.current.handleTouchEnd(createMockTouchEvent());
		});
		vi.advanceTimersByTime(100);
		act(() => {
			result.current.handleTouchEnd(createMockTouchEvent());
		});

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
			result.current.handleTouchEnd(createMockTouchEvent());
		});
		vi.advanceTimersByTime(100);
		act(() => {
			result.current.handleTouchEnd(createMockTouchEvent());
		});

		expect(mockRevertCellTap).toHaveBeenCalledWith(0, 0);
		expect(mockTriggerShake).toHaveBeenCalled();
	});

	it("should not interact if isSharedGrid is true (Touch)", () => {
		const { result } = renderGridCellHook({}, true);
		const mockEvent = createMockTouchEvent();

		act(() => {
			result.current.handleTouchEnd(mockEvent);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockHandleCellTap).not.toHaveBeenCalled();
	});

	it("should not interact if isSharedGrid is true (Mouse)", () => {
		const { result } = renderGridCellHook({}, true);
		const mockEvent = createMockMouseEvent();

		act(() => {
			result.current.handleClick(mockEvent);
		});

		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
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
		const mockEvent = createMockTouchEvent();
		// Mock single touch for default behavior
		Object.defineProperty(mockEvent, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		act(() => {
			result.current.handleTouchStart(mockEvent);
		});
		expect(result.current.isTouching).toBe(true);
	});

	it("should set isTouching to false on touch end", () => {
		const { result } = renderGridCellHook();
		const mockEvent = createMockTouchEvent();
		Object.defineProperty(mockEvent, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		act(() => {
			result.current.handleTouchStart(mockEvent);
		});
		expect(result.current.isTouching).toBe(true);
		act(() => {
			result.current.handleTouchEnd(createMockTouchEvent());
		});
		expect(result.current.isTouching).toBe(false);
	});

	describe("module blocking - preventing state changes", () => {
		it("should trigger shake on mouse click and not toggle supercharged when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleClick(createMockMouseEvent());
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
		});

		it("should trigger shake on Ctrl+Click and not toggle active when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleClick(createMockMouseEvent({ ctrlKey: true }));
			});
			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(mockToggleCellActive).not.toHaveBeenCalled();
		});

		it("should trigger shake on double-tap and not call handleCellDoubleTap when cell has module", () => {
			const { result } = renderGridCellHook({ module: "exocraft" });
			act(() => {
				result.current.handleTouchEnd(createMockTouchEvent());
			});
			vi.advanceTimersByTime(100);
			act(() => {
				result.current.handleTouchEnd(createMockTouchEvent());
			});

			// Both taps should trigger shake (once each)
			expect(mockTriggerShake).toHaveBeenCalledTimes(2);
			expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
		});

		// Removed combined test as mouse and keyboard are separate handlers now
	});

	describe("supercharge row limit - first 4 rows only", () => {
		// Mouse tests
		it("should block supercharging on row 4 and trigger shake (Mouse)", () => {
			const { result } = renderGridCellHook({ module: null }, false, 4);
			act(() => {
				result.current.handleClick(createMockMouseEvent());
			});
			expect(mockTriggerShake).toHaveBeenCalled();
			expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
		});

		it("should allow supercharging on row 3 (Mouse)", () => {
			const { result } = renderGridCellHook({ module: null }, false, 3);
			act(() => {
				result.current.handleClick(createMockMouseEvent());
			});
			expect(mockToggleCellSupercharged).toHaveBeenCalledWith(3, 0);
			expect(mockTriggerShake).not.toHaveBeenCalled();
		});

		// Touch tests
		it("should block double-tap supercharge on row 4", () => {
			const { result } = renderGridCellHook({ module: null }, false, 4);
			act(() => {
				result.current.handleTouchEnd(createMockTouchEvent());
			});
			vi.advanceTimersByTime(100);
			act(() => {
				result.current.handleTouchEnd(createMockTouchEvent());
			});

			expect(mockTriggerShake).toHaveBeenCalled();
			expect(mockRevertCellTap).toHaveBeenCalled();
			expect(mockHandleCellDoubleTap).not.toHaveBeenCalled();
		});
	});
});
