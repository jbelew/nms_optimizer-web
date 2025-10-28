/// <reference types="@testing-library/jest-dom" />

import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useCell } from "@/hooks/useCell/useCell";

import { TechState, useTechStore } from "../../store/TechStore";
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

// Mock the useCell hook
vi.mock("../../hooks/useCell/useCell", () => ({
	useCell: vi.fn(),
}));

// Mock the GridStore and its actions
vi.mock("../../store/GridStore", () => {
	const mockState = {
		handleCellTap: vi.fn(),
		handleCellDoubleTap: vi.fn(),
		revertCellTap: vi.fn(),
		clearInitialCellStateForTap: vi.fn(),
		toggleCellActive: vi.fn(),
		toggleCellSupercharged: vi.fn(),
		selectTotalSuperchargedCells: vi.fn(() => 0),
		superchargedFixed: false,
		gridFixed: false,
	};
	const useGridStore = vi.fn(() => mockState);
	// @ts-expect-error - Mocking getState
	useGridStore.getState = () => mockState;
	return { useGridStore };
});

vi.mock("../../store/ShakeStore", () => ({
	useShakeStore: vi.fn(() => ({
		setShaking: vi.fn(),
	})),
}));

vi.mock("../../store/TechStore", () => ({
	useTechStore: vi.fn(),
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
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

		// Mock useCell to return a specific cell state
		(useCell as unknown as Mock).mockReturnValue(mockCellState);

		(useTechStore as unknown as Mock).mockImplementation(
			(selector: (state: TechState) => unknown) => {
				const state: TechState = {
					max_bonus: {},
					solved_bonus: {},
					solve_method: {},
					techColors: {},
					checkedModules: {},
					techGroups: {},
					activeGroups: {},
					clearTechMaxBonus: vi.fn(),
					setTechMaxBonus: vi.fn(),
					clearTechSolvedBonus: vi.fn(),
					setTechSolvedBonus: vi.fn(),
					setTechSolveMethod: vi.fn(),
					setTechColors: vi.fn(),
					getTechColor: vi.fn(() => "blue"),
					setCheckedModules: vi.fn(),
					clearCheckedModules: vi.fn(),
					clearResult: vi.fn(),
					setTechGroups: vi.fn(),
					setActiveGroup: vi.fn(),
				};
				return selector(state);
			}
		);
	});

	const renderComponent = (cellOverrides = {}, props = {}) => {
		// Mutate mockCellState with overrides before rendering
		Object.assign(mockCellState, cellOverrides);

		return render(<GridCell rowIndex={0} columnIndex={0} {...props} />);
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
