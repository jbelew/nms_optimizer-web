/// <reference types="@testing-library/jest-dom" />

import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGridStore } from "../../store/GridStore";
// Import the component after mocks are defined
import GridCell from "./GridCell";

let mockCellState = {
	active: false,
	supercharged: false,
	module: "some-module",
	image: "some-image.webp",
	label: "My Module",
	adjacency_bonus: 1,
	tech: "some-tech",
};

// Mock the GridStore and its actions
vi.mock("../../store/GridStore", () => ({
	useGridStore: vi.fn(),
}));

vi.mock("../../store/ShakeStore", () => ({
	useShakeStore: vi.fn(() => ({
		setShaking: vi.fn(),
	})),
}));

vi.mock("../../store/TechStore", () => ({
	useTechStore: vi.fn((selector) => selector({ getTechColor: vi.fn(() => "blue") })),
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key, options) => options?.defaultValue || key,
	}),
}));

// Explicitly mock the Tooltip component from @radix-ui/themes
vi.mock("@radix-ui/themes", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Render children directly
}));

describe("GridCell", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock state for each test
		mockCellState = {
			active: false,
			supercharged: false,
			module: "some-module",
			image: "some-image.webp",
			label: "My Module",
			adjacency_bonus: 1,
			tech: "some-tech",
		};

		// Mock useGridStore to return a specific cell state and actions
		(useGridStore as unknown as vi.Mock).mockImplementation((selector) => {
			const state = {
				grid: { cells: [[mockCellState]] },
				selectTotalSuperchargedCells: vi.fn(() => 0),
				superchargedFixed: false,
				gridFixed: false,
			};
			return selector(state);
		});
	});

	const renderComponent = (cellOverrides = {}, props = {}) => {
		// Mutate mockCellState with overrides before rendering
		Object.assign(mockCellState, cellOverrides);

		return render(<GridCell rowIndex={0} columnIndex={0} isSharedGrid={false} {...props} />);
	};

	it("renders correctly", () => {
		renderComponent();
		expect(screen.getByRole("gridcell")).toBeInTheDocument();
	});

	it("renders upgrade priority label when applicable", () => {
		renderComponent({ label: "Upgrade sigma" });
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("renders corner elements when not supercharged", () => {
		renderComponent({ supercharged: false });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).toBeInTheDocument();
	});

	it("does not render corner elements when supercharged", () => {
		renderComponent({ supercharged: true });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).not.toBeInTheDocument();
	});
});
