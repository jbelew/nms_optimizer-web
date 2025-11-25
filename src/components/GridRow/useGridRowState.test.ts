import { renderHook } from "@testing-library/react";
import { describe, expect, it, Mock, vi } from "vitest";

import { useGridStore } from "@/store/GridStore";

import { useGridRowState } from "./useGridRowState";

vi.mock("@/store/GridStore");

describe("useGridRowState", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return both flags as false when row is null", () => {
		(useGridStore as unknown as Mock).mockImplementation(
			(
				selector: (state: {
					selectFirstInactiveRowIndex: () => number;
					selectLastActiveRowIndex: () => number;
					grid: { cells: { every: () => boolean; some: () => boolean }[] };
				}) => unknown
			) => {
				const mockState = {
					selectFirstInactiveRowIndex: () => 2,
					selectLastActiveRowIndex: () => 5,
					grid: { cells: [] },
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
					selectFirstInactiveRowIndex: () => 2,
					selectLastActiveRowIndex: () => 1,
					grid: { cells: [null, null, mockRow] },
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
					selectFirstInactiveRowIndex: () => 3,
					selectLastActiveRowIndex: () => 1,
					grid: { cells: [null, null, mockRow] },
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
			selectFirstInactiveRowIndex: () => 5,
			selectLastActiveRowIndex: () => 7,
			grid: { cells: [null, null, null, null, null, null, null, mockRow, null, null] },
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
			selectFirstInactiveRowIndex: () => 2,
			selectLastActiveRowIndex: () => 1,
			grid: { cells: [null, mockRow, null, null, null, null, null, null] },
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
					selectFirstInactiveRowIndex: () => 5,
					selectLastActiveRowIndex: () => 7,
					grid: {
						cells: [null, null, null, null, null, null, null, mockRow, null, null],
					},
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
			selectFirstInactiveRowIndex: () => 10,
			selectLastActiveRowIndex: () => 9,
			grid: { cells: [null, null, null, null, null, null, null, null, null, mockRow] },
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
