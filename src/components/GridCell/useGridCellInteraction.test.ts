import type { Cell } from "@/store/grid/gridStore";
import type { Mock } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
		mockGetGridState = vi.fn(() => baseMockMockGridStoreState());
		(useGridStore as unknown as { getState: Mock }).getState = mockGetGridState;
	});

	// Helper to get fresh mock state for each test run to avoid reference mutation issues
	const baseMockMockGridStoreState = () => ({
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
