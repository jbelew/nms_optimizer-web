import type { Cell } from "@/store/grid/gridStore";
import type { Mock } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "@/store/grid/gridStore";

import { useGridCellInteraction } from "./useGridCellInteraction";

// Mock store
vi.mock("@/store/grid/gridStore");

// Define mock functions
const mockRegisterCellTap = vi.fn();
const mockToggleCellActive = vi.fn();
const mockToggleCellSupercharged = vi.fn();

describe("useGridCellInteraction (Thin DOM Adapter)", () => {
	let mockGetGridState: Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetGridState = vi.fn(() => createMockGridStoreState());
		(useGridStore as unknown as { getState: Mock }).getState = mockGetGridState;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Helper to get fresh mock state for each test run to avoid reference mutation issues
	const createMockGridStoreState = () => ({
		grid: { height: 6, width: 10 },
		registerCellTap: mockRegisterCellTap,
		toggleCellActive: mockToggleCellActive,
		toggleCellSupercharged: mockToggleCellSupercharged,
	});

	const renderGridCellHook = (cellOverrides = {}, isSharedGrid = false, rowIndex = 0) => {
		const cell = {
			active: false,
			module: null,
			supercharged: false,
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
			ctrlKey: false,
			metaKey: false,
			preventDefault: vi.fn(),
			...overrides,
		}) as unknown as React.MouseEvent;

	it("should route touch interaction to registerCellTap with correct coordinates and timestamp", () => {
		const { result } = renderGridCellHook();
		const mockEvent = createMockTouchEvent();
		Object.defineProperty(mockEvent, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		const now = Date.now();
		const spyDateNow = vi.spyOn(Date, "now").mockReturnValue(now);

		act(() => {
			result.current.handleTouchStart(mockEvent);
			result.current.handleTouchEnd(mockEvent);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
		expect(mockRegisterCellTap).toHaveBeenCalledWith(0, 0, now);

		spyDateNow.mockRestore();
	});

	it("should not call registerCellTap if touch interaction is detected as a scroll/gesture", () => {
		const { result } = renderGridCellHook();
		const mockEventStart = createMockTouchEvent();
		Object.defineProperty(mockEventStart, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		const mockEventMove = createMockTouchEvent();
		Object.defineProperty(mockEventMove, "touches", {
			value: [{ clientX: 20, clientY: 20 }], // Moved > 10px
		});

		act(() => {
			result.current.handleTouchStart(mockEventStart);
			result.current.handleTouchMove(mockEventMove);
			result.current.handleTouchEnd(mockEventStart);
		});

		expect(mockRegisterCellTap).not.toHaveBeenCalled();
	});

	it("should not call registerCellTap on touch if isSharedGrid is true", () => {
		const { result } = renderGridCellHook({}, true);
		const mockEvent = createMockTouchEvent();
		Object.defineProperty(mockEvent, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		act(() => {
			result.current.handleTouchStart(mockEvent);
			result.current.handleTouchEnd(mockEvent);
		});

		expect(mockRegisterCellTap).not.toHaveBeenCalled();
	});

	it("should call toggleCellSupercharged on mouse click", () => {
		const { result } = renderGridCellHook();
		const mockEvent = createMockMouseEvent();

		act(() => {
			result.current.handleClick(mockEvent);
		});

		expect(mockToggleCellSupercharged).toHaveBeenCalledWith(0, 0);
		expect(mockToggleCellActive).not.toHaveBeenCalled();
	});

	it("should call toggleCellActive on Ctrl+Click or Cmd+Click", () => {
		const { result } = renderGridCellHook();
		const mockEvent = createMockMouseEvent({ ctrlKey: true });

		act(() => {
			result.current.handleClick(mockEvent);
		});

		expect(mockToggleCellActive).toHaveBeenCalledWith(0, 0);
		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
	});

	it("should not invoke any actions on mouse click if isSharedGrid is true", () => {
		const { result } = renderGridCellHook({}, true);
		const mockEvent = createMockMouseEvent();

		act(() => {
			result.current.handleClick(mockEvent);
		});

		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
		expect(mockToggleCellActive).not.toHaveBeenCalled();
	});

	it("should toggle cell active on spacebar or Enter key down", () => {
		const { result } = renderGridCellHook();
		const mockEventSpace = {
			key: " ",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		const mockEventEnter = {
			key: "Enter",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;

		act(() => {
			result.current.handleKeyDown(mockEventSpace);
			result.current.handleKeyDown(mockEventEnter);
		});

		expect(mockEventSpace.preventDefault).toHaveBeenCalled();
		expect(mockEventEnter.preventDefault).toHaveBeenCalled();
		expect(mockToggleCellActive).toHaveBeenCalledTimes(2);
		expect(mockToggleCellActive).toHaveBeenNthCalledWith(1, 0, 0);
		expect(mockToggleCellActive).toHaveBeenNthCalledWith(2, 0, 0);
	});

	it("should toggle cell supercharged on 's', 'S', or Shift+Enter key down", () => {
		const { result } = renderGridCellHook();
		const mockEventLowerS = {
			key: "s",
			preventDefault: vi.fn(),
			shiftKey: false,
		} as unknown as React.KeyboardEvent;
		const mockEventUpperS = {
			key: "S",
			preventDefault: vi.fn(),
			shiftKey: true,
		} as unknown as React.KeyboardEvent;
		const mockEventShiftEnter = {
			key: "Enter",
			preventDefault: vi.fn(),
			shiftKey: true,
		} as unknown as React.KeyboardEvent;

		act(() => {
			result.current.handleKeyDown(mockEventLowerS);
			result.current.handleKeyDown(mockEventUpperS);
			result.current.handleKeyDown(mockEventShiftEnter);
		});

		expect(mockEventLowerS.preventDefault).toHaveBeenCalled();
		expect(mockEventUpperS.preventDefault).toHaveBeenCalled();
		expect(mockEventShiftEnter.preventDefault).toHaveBeenCalled();
		expect(mockToggleCellSupercharged).toHaveBeenCalledTimes(3);
		expect(mockToggleCellSupercharged).toHaveBeenNthCalledWith(1, 0, 0);
		expect(mockToggleCellSupercharged).toHaveBeenNthCalledWith(2, 0, 0);
		expect(mockToggleCellSupercharged).toHaveBeenNthCalledWith(3, 0, 0);
	});

	it("should not toggle supercharged on keyboard shortcuts if isSharedGrid is true", () => {
		const { result } = renderGridCellHook({}, true);
		const mockEventS = {
			key: "s",
			preventDefault: vi.fn(),
			shiftKey: false,
		} as unknown as React.KeyboardEvent;

		act(() => {
			result.current.handleKeyDown(mockEventS);
		});

		expect(mockEventS.preventDefault).toHaveBeenCalled();
		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
	});

	it("should navigate across grid with ArrowRight, ArrowLeft, ArrowDown, and ArrowUp", () => {
		const targetElement = document.createElement("div");
		targetElement.id = "grid-cell-1-1";
		vi.spyOn(document, "getElementById").mockReturnValue(targetElement);
		const spyFocus = vi.spyOn(targetElement, "focus");

		// Start at (1, 1)
		const cell = { active: true, module: null, supercharged: false } as Cell;
		const { result } = renderHook(() => useGridCellInteraction(cell, 1, 1, false));

		const rightEvent = {
			key: "ArrowRight",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(rightEvent);
		});
		expect(rightEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-1-2");

		const downEvent = {
			key: "ArrowDown",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(downEvent);
		});
		expect(downEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-2-1");

		const leftEvent = {
			key: "ArrowLeft",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(leftEvent);
		});
		expect(leftEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-1-0");

		const upEvent = {
			key: "ArrowUp",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(upEvent);
		});
		expect(upEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-0-1");

		expect(spyFocus).toHaveBeenCalled();
	});

	it("should not hijack browser shortcuts like Ctrl+S or Cmd+S", () => {
		const { result } = renderGridCellHook();
		const mockEventCtrlS = {
			altKey: false,
			ctrlKey: true,
			key: "s",
			metaKey: false,
			preventDefault: vi.fn(),
			shiftKey: false,
		} as unknown as React.KeyboardEvent;

		act(() => {
			result.current.handleKeyDown(mockEventCtrlS);
		});

		expect(mockEventCtrlS.preventDefault).not.toHaveBeenCalled();
		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
	});

	it("should navigate to bounds on Home and End", () => {
		const targetElement = document.createElement("div");
		targetElement.id = "grid-cell-0-0";
		vi.spyOn(document, "getElementById").mockReturnValue(targetElement);

		// Start at (2, 5)
		const cell = { active: true, module: null, supercharged: false } as Cell;
		const { result } = renderHook(() => useGridCellInteraction(cell, 2, 5, false));

		const homeEvent = {
			key: "Home",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(homeEvent);
		});
		expect(homeEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-2-0");

		const endEvent = { key: "End", preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(endEvent);
		});
		expect(endEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-2-9");

		const ctrlHomeEvent = {
			ctrlKey: true,
			key: "Home",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(ctrlHomeEvent);
		});
		expect(ctrlHomeEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-0-0");

		const ctrlEndEvent = {
			ctrlKey: true,
			key: "End",
			preventDefault: vi.fn(),
		} as unknown as React.KeyboardEvent;
		act(() => {
			result.current.handleKeyDown(ctrlEndEvent);
		});
		expect(ctrlEndEvent.preventDefault).toHaveBeenCalled();
		expect(document.getElementById).toHaveBeenCalledWith("grid-cell-5-9");
	});

	it("should update focus store on handleFocus", () => {
		const cell = { active: true, module: null, supercharged: false } as Cell;
		const { result } = renderHook(() => useGridCellInteraction(cell, 3, 4, false));

		act(() => {
			result.current.handleFocus();
		});

		// Focus store should now be set to (3, 4)
	});

	it("should prevent context menu default behavior", () => {
		const { result } = renderGridCellHook();
		const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent;

		act(() => {
			result.current.handleContextMenu(mockEvent);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it("should manage isTouching state correctly", () => {
		const { result } = renderGridCellHook();
		const mockEvent = createMockTouchEvent();
		Object.defineProperty(mockEvent, "touches", {
			value: [{ clientX: 0, clientY: 0 }],
		});

		expect(result.current.isTouching).toBe(false);

		act(() => {
			result.current.handleTouchStart(mockEvent);
		});
		expect(result.current.isTouching).toBe(true);

		act(() => {
			result.current.handleTouchCancel();
		});
		expect(result.current.isTouching).toBe(false);
	});
});
