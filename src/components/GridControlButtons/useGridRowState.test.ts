import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useGridStore } from "@/store/grid/gridStore";

import { useGridRowState } from "./useGridRowState";

vi.mock("@/store/grid/gridStore");

describe("useGridRowState", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return both flags as false when row is null", () => {
		(useGridStore as unknown as Mock).mockImplementation(
			(
				selector: (state: {
					firstInactiveRowIndex: number;
					grid: { cells: { every: () => boolean; some: () => boolean }[] };
					lastActiveRowIndex: number;
				}) => unknown
			) => {
				const mockState = {
					firstInactiveRowIndex: 2,
					grid: { cells: [] },
					lastActiveRowIndex: 5,
				};

				return selector(mockState);
			}
		);

		const { result } = renderHook(() => useGridRowState(0));

		expect(result.current.isFirstInactiveRow).toBe(false);
		expect(result.current.isLastActiveRow).toBe(false);
	});

	it("should return isFirstInactiveRow true when row is first inactive row", () => {
		const mockRow = [{ active: false }, { active: false }, { active: false }];

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) => {
				const mockState = {
					firstInactiveRowIndex: 2,
					grid: { cells: [null, null, mockRow] },
					lastActiveRowIndex: 1,
				};

				return selector(mockState);
			}
		);

		const { result } = renderHook(() => useGridRowState(2));

		expect(result.current.isFirstInactiveRow).toBe(true);
		expect(result.current.isLastActiveRow).toBe(false);
	});

	it("should return isFirstInactiveRow false when row is not first inactive row", () => {
		const mockRow = [{ active: false }, { active: false }, { active: false }];

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) => {
				const mockState = {
					firstInactiveRowIndex: 3,
					grid: { cells: [null, null, mockRow] },
					lastActiveRowIndex: 1,
				};

				return selector(mockState);
			}
		);

		const { result } = renderHook(() => useGridRowState(2));

		expect(result.current.isFirstInactiveRow).toBe(false);
		expect(result.current.isLastActiveRow).toBe(false);
	});

	it("should return isLastActiveRow true when row is last active row within threshold", () => {
		const mockRow = [{ active: true }, { active: false }, { active: true }];

		const mockState = {
			firstInactiveRowIndex: 5,
			grid: { cells: [null, null, null, null, null, null, null, mockRow, null, null] },
			lastActiveRowIndex: 7,
		};

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) => {
				return selector(mockState);
			}
		);
		(useGridStore as unknown as { getState: () => typeof mockState }).getState = () =>
			mockState;

		const { result } = renderHook(() => useGridRowState(7));

		expect(result.current.isLastActiveRow).toBe(true);
		expect(result.current.isFirstInactiveRow).toBe(false);
	});

	it("should return isLastActiveRow false when row is last active row but outside threshold", () => {
		const mockRow = [{ active: true }, { active: false }, { active: true }];

		const mockState = {
			firstInactiveRowIndex: 2,
			grid: { cells: [null, mockRow, null, null, null, null, null, null] },
			lastActiveRowIndex: 1,
		};

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) => {
				return selector(mockState);
			}
		);
		(useGridStore as unknown as { getState: () => typeof mockState }).getState = () =>
			mockState;

		const { result } = renderHook(() => useGridRowState(1));

		expect(result.current.isLastActiveRow).toBe(false);
		expect(result.current.isFirstInactiveRow).toBe(false);
	});

	it("should return isLastActiveRow false when row has no active cells", () => {
		const mockRow = [{ active: false }, { active: false }, { active: false }];

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) => {
				const mockState = {
					firstInactiveRowIndex: 5,
					grid: {
						cells: [null, null, null, null, null, null, null, mockRow, null, null],
					},
					lastActiveRowIndex: 7,
				};

				return selector(mockState);
			}
		);

		const { result } = renderHook(() => useGridRowState(7));

		expect(result.current.isLastActiveRow).toBe(false);
		expect(result.current.isFirstInactiveRow).toBe(false);
	});

	it("should handle edge case where rowIndex is at grid boundary", () => {
		const mockRow = [{ active: true }, { active: true }];

		const mockState = {
			firstInactiveRowIndex: 10,
			grid: { cells: [null, null, null, null, null, null, null, null, null, mockRow] },
			lastActiveRowIndex: 9,
		};

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: Record<string, unknown>) => unknown) => {
				return selector(mockState);
			}
		);
		(useGridStore as unknown as { getState: () => typeof mockState }).getState = () =>
			mockState;

		const { result } = renderHook(() => useGridRowState(9));

		expect(result.current.isLastActiveRow).toBe(true);
		expect(result.current.isFirstInactiveRow).toBe(false);
	});
});
