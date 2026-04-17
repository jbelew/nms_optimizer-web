import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Cell, createEmptyCell, GridStore, useGridStore } from "../../store/grid/gridStore";
import { useCell } from "./useCell";

vi.mock("../../store/grid/gridStore", () => ({
	useGridStore: vi.fn(),
	createEmptyCell: vi.fn((sc, active) => ({
		active: !!active,
		adjacency: "none",
		adjacency_bonus: 0,
		bonus: 0,
		image: null,
		module: null,
		label: "",
		sc_eligible: false,
		supercharged: !!sc,
		group_adjacent: false,
		tech: null,
		total: 0,
		type: "",
		value: 0,
	})),
}));

// Mock useShallow to just return the selector for easy testing
vi.mock("zustand/react/shallow", () => ({
	useShallow: <T, U>(selector: (state: T) => U) => selector,
}));

describe("useCell", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return the correct cell from the store", () => {
		const mockCell: Cell = {
			...createEmptyCell(false, true),
			tech: "test-tech",
		};
		const mockGrid = {
			cells: [
				[createEmptyCell(), createEmptyCell()],
				[createEmptyCell(), mockCell],
			],
			width: 2,
			height: 2,
		};

		// Mock the store implementation using a type-safe approach
		vi.mocked(useGridStore).mockImplementation((selector) =>
			selector({ grid: mockGrid } as GridStore)
		);

		const { result } = renderHook(() => useCell(1, 1));

		expect(result.current).toEqual(mockCell);
	});
});
