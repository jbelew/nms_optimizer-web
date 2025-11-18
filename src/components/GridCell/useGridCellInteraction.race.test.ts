import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

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

describe("useGridCellInteraction Race Conditions", () => {
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
		// Mock the hook implementation for useGridStore to return state values
		(useGridStore as unknown as Mock).mockImplementation((selector) => {
			if (typeof selector === "function") {
				return selector(baseMockGridStoreState);
			}
			return baseMockGridStoreState;
		});

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
			module: null,
			...cellOverrides,
		} as Cell;

		return renderHook(() => useGridCellInteraction(cell, 0, 0, isSharedGrid));
	};

	it("should handle rapid taps correctly without timeout interference", () => {
		const { result } = renderGridCellHook({ module: null });

		// Tap 1 Start
		act(() => {
			result.current.handleTouchStart();
		});
		// Tap 1 End (Sets timeout for 500ms)
		act(() => {
			result.current.handleTouchEnd();
		});

		// Advance time by 450ms (Timeout 1 pending, 50ms remaining)
		vi.advanceTimersByTime(450);

		// Tap 2 Start (Should set isTouchInteraction = true)
		act(() => {
			result.current.handleTouchStart();
		});

		// Advance time by 100ms (Timeout 1 fires! It might reset isTouchInteraction to false)
		vi.advanceTimersByTime(100);

		// Tap 2 Click (Should be treated as Touch)
		act(() => {
			result.current.handleClick({} as React.MouseEvent);
		});

		// If treated as Touch, handleCellTap should be called.
		// If treated as Mouse, toggleCellSupercharged should be called.
		expect(mockHandleCellTap).toHaveBeenCalled();
		expect(mockToggleCellSupercharged).not.toHaveBeenCalled();
	});
});
