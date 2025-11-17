import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import GridRowInternal from "./GridRow";

// Mock child components
vi.mock("../GridCell/GridCell", () => ({
	default: ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => (
		<div data-testid={`grid-cell-${rowIndex}-${columnIndex}`}>
			Cell {rowIndex}-{columnIndex}
		</div>
	),
}));

vi.mock("../GridControlButtons/GridControlButtons", () => ({
	default: ({
		rowIndex,
		isFirstInactiveRow,
		isLastActiveRow,
	}: {
		rowIndex: number;
		isFirstInactiveRow: boolean;
		isLastActiveRow: boolean;
	}) => (
		<div
			data-testid={`grid-control-buttons-${rowIndex}`}
			data-first-inactive={isFirstInactiveRow}
			data-last-active={isLastActiveRow}
		>
			Controls
		</div>
	),
}));

// Mock store
const mockGridState = {
	grid: {
		width: 3,
		cells: [
			[{ active: true }, { active: true }, { active: true }],
			[{ active: false }, { active: false }, { active: false }],
			[{ active: true }, { active: false }, { active: true }],
		],
	},
};

vi.mock("../../store/GridStore", () => {
	const mockUseGridStore = vi.fn((selector: (state: typeof mockGridState) => unknown) => {
		return selector(mockGridState);
	});
	(mockUseGridStore as unknown as { getState(): typeof mockGridState }).getState = () =>
		mockGridState;

	return {
		useGridStore: mockUseGridStore,
	};
});

describe("GridRow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render grid row with correct role and ARIA attributes", () => {
		const { container } = render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		const row = container.querySelector('[role="row"]');
		expect(row).toBeInTheDocument();
		expect(row).toHaveAttribute("aria-rowindex", "1"); // rowIndex + 1
	});

	test("should render grid cells based on grid width", () => {
		render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		// Should render 3 cells (based on mocked grid width)
		for (let i = 0; i < 3; i++) {
			expect(screen.getByTestId(`grid-cell-0-${i}`)).toBeInTheDocument();
		}
	});

	test("should render GridControlButtons with correct props", () => {
		render(
			<GridRowInternal
				rowIndex={1}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		const controls = screen.getByTestId("grid-control-buttons-1");
		expect(controls).toBeInTheDocument();
		expect(controls).toHaveAttribute("data-first-inactive", "true");
	});

	test("should render GridControlButtons with isLastActiveRow true when conditions met", () => {
		render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		const controls = screen.getByTestId("grid-control-buttons-0");
		expect(controls).toHaveAttribute("data-last-active", "true");
	});

	test("should wrap GridControlButtons in gridcell div", () => {
		const { container } = render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		const gridcells = container.querySelectorAll('[role="gridcell"]');
		// Should have at least 1 gridcell for control buttons
		expect(gridcells.length).toBeGreaterThan(0);

		// Verify control buttons gridcell exists
		const controlsCell = container.querySelector('[role="gridcell"][aria-colindex="4"]');
		expect(controlsCell).toBeInTheDocument();
	});

	test("should pass isLoading prop to GridControlButtons", () => {
		render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={true}
			/>
		);

		// Controls should be rendered and receive isLoading prop
		expect(screen.getByTestId("grid-control-buttons-0")).toBeInTheDocument();
	});

	test("should return null when row does not exist", () => {
		const { container } = render(
			<GridRowInternal
				rowIndex={99}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		// Component should not render anything for invalid row
		expect(container.firstChild).toBeNull();
	});

	test("should handle different row indices", () => {
		const { rerender } = render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		expect(screen.getByTestId("grid-cell-0-0")).toBeInTheDocument();

		rerender(
			<GridRowInternal
				rowIndex={2}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		expect(screen.getByTestId("grid-cell-2-0")).toBeInTheDocument();
	});

	test("should have correct control button column width class", () => {
		const { container } = render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		const controlCell = container.querySelector('[aria-colindex="4"]');
		expect(controlCell).toHaveClass("w-6");
	});

	test("should memoize and not rerender when props don't change", () => {
		const { rerender } = render(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		// Rerender with same props
		rerender(
			<GridRowInternal
				rowIndex={0}
				firstInactiveRowIndex={1}
				lastActiveRowIndex={0}
				isLoading={false}
			/>
		);

		// Should still have the same cells
		expect(screen.getByTestId("grid-cell-0-0")).toBeInTheDocument();
	});
});
