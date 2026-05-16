import type { Cell, GridStore } from "../../store/grid/gridStore";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createEmptyCell, useGridStore } from "../../store/grid/gridStore";
import { useCell } from "./useCell";

vi.mock("../../store/grid/gridStore", () => ({
	createEmptyCell: vi.fn((sc, active) => ({
		active: !!active,
		adjacency: "none",
		adjacency_bonus: 0,
		bonus: 0,
		group_adjacent: false,
		image: null,
		label: "",
		module: null,
		sc_eligible: false,
		supercharged: !!sc,
		tech: null,
		total: 0,
		type: "",
		value: 0,
	})),
	useGridStore: vi.fn(),
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
			height: 2,
			width: 2,
		};

		// Mock the store implementation using a type-safe approach
		vi.mocked(useGridStore).mockImplementation((selector) =>
			selector({ grid: mockGrid } as GridStore)
		);

		const { result } = renderHook(() => useCell(1, 1));

		expect(result.current).toEqual(mockCell);
	});
});
