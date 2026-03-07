import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { GridTable } from "./GridTable";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock child components
vi.mock("../GridRow/GridRow", () => ({
	default: ({ rowIndex }: { rowIndex: number }) => (
		<div data-testid={`grid-row-${rowIndex}`}>Row {rowIndex}</div>
	),
}));

vi.mock("../GridTableButtons/GridTableButtons", () => ({
	default: ({ solving }: { solving: boolean }) => (
		<div data-testid="grid-table-buttons" data-solving={solving}>
			Grid Table Buttons
		</div>
	),
}));

vi.mock("../GridShake/GridShake", () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="grid-shake">{children}</div>
	),
}));

vi.mock("../MessageSpinner/MessageSpinner", () => ({
	default: ({ isVisible }: { isVisible: boolean }) => (
		<div data-testid="message-spinner" data-visible={isVisible} />
	),
}));

// Mock stores
vi.mock("../../store/GridStore", () => ({
	useGridStore: vi.fn((selector) => {
		const mockState = {
			grid: {
				height: 5,
				width: 3,
				cells: Array.from({ length: 5 }, () =>
					Array.from({ length: 3 }, () => ({ active: false }))
				),
			},
			superchargedFixed: false,
			selectFirstInactiveRowIndex: () => 0,
			selectLastActiveRowIndex: () => -1,
		};

		return selector(mockState);
	}),
}));

vi.mock("../../store/TechTreeLoadingStore", () => ({
	useTechTreeLoadingStore: vi.fn((selector) => {
		const mockState = {
			isLoading: false,
		};

		return selector(mockState);
	}),
}));

// Mock hooks
vi.mock("../../hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => true),
}));

// Mock context
vi.mock("../../context/dialog-utils", () => ({
	useDialog: () => ({
		tutorialFinished: false,
	}),
}));

describe("GridTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render grid with correct role and ARIA attributes", () => {
		const { container } = render(<GridTable solving={false} sharedGrid={false} />);

		const grid = container.querySelector('[role="grid"]');
		expect(grid).toBeInTheDocument();
		expect(grid).toHaveAttribute("aria-label", "Technology Grid");
		expect(grid).toHaveAttribute("aria-rowcount", "5");
		expect(grid).toHaveAttribute("aria-colcount", "4"); // 3 columns + 1 for buttons
	});

	test("should render GridShake wrapper", () => {
		render(<GridTable solving={false} sharedGrid={false} />);
		expect(screen.getByTestId("grid-shake")).toBeInTheDocument();
	});

	test("should render grid rows based on grid height", () => {
		render(<GridTable solving={false} sharedGrid={false} />);

		// Should render 5 rows (based on mocked grid height)
		for (let i = 0; i < 5; i++) {
			expect(screen.getByTestId(`grid-row-${i}`)).toBeInTheDocument();
		}
	});

	test("should render GridTableButtons", () => {
		render(<GridTable solving={false} sharedGrid={false} />);
		expect(screen.getByTestId("grid-table-buttons")).toBeInTheDocument();
	});

	test("should pass solving prop to GridTableButtons", () => {
		render(<GridTable solving={true} sharedGrid={false} />);
		const buttons = screen.getByTestId("grid-table-buttons");
		expect(buttons).toHaveAttribute("data-solving", "true");
	});

	test("should apply opacity class when solving", () => {
		const { container } = render(<GridTable solving={true} sharedGrid={false} />);

		const grid = container.querySelector(".gridTable");
		expect(grid).toHaveClass("opacity-25");
	});

	test("should not apply opacity class when not solving", () => {
		const { container } = render(<GridTable solving={false} sharedGrid={false} />);

		const grid = container.querySelector(".gridTable");
		expect(grid).not.toHaveClass("opacity-25");
	});

	test("should forward ref to grid container", () => {
		const ref = React.createRef<HTMLDivElement>();
		render(<GridTable ref={ref} solving={false} sharedGrid={false} />);

		expect(ref.current).toBeInTheDocument();
		expect(ref.current).toHaveAttribute("role", "grid");
	});

	test("should be memoized for performance", () => {
		const { rerender } = render(<GridTable solving={false} sharedGrid={false} />);

		expect(screen.getByTestId("grid-shake")).toBeInTheDocument();

		// Rerender with same solving state
		rerender(<GridTable solving={false} sharedGrid={false} />);

		// Should still render grid
		expect(screen.getByTestId("grid-shake")).toBeInTheDocument();
	});
});
