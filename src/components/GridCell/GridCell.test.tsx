/// <reference types="@testing-library/jest-dom" />

import type { TechState } from "@/store/tech/techStore";
import type { Mock } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCell } from "@/hooks/useCell/useCell";
import { useTechStore } from "@/store/tech/techStore";

// Import the component after mocks are defined
import GridCell from "./GridCell";

let mockCellState = {
	active: false,
	adjacency_bonus: 1,
	image: "some-image.webp",
	label: "My Module",
	module: "some-module",
	supercharged: false,
	tech: "some-tech",
};

// Mock the useCell hook
vi.mock("@/hooks/useCell/useCell", () => ({
	useCell: vi.fn(),
}));

// Mock the GridStore and its actions
vi.mock("@/store/grid/gridStore", () => {
	const mockState = {
		clearInitialCellStateForTap: vi.fn(),
		gridFixed: false,
		handleCellDoubleTap: vi.fn(),
		handleCellTap: vi.fn(),
		revertCellTap: vi.fn(),
		selectTotalSuperchargedCells: vi.fn(() => 0),
		superchargedFixed: false,
		toggleCellActive: vi.fn(),
		toggleCellSupercharged: vi.fn(),
	};
	const useGridStore = vi.fn(() => mockState);
	// @ts-expect-error - Mocking getState
	useGridStore.getState = () => mockState;

	return { useGridStore };
});

vi.mock("@/store/app/shakeStore", () => ({
	useShakeStore: vi.fn(() => ({
		setShaking: vi.fn(),
	})),
}));

vi.mock("@/store/tech/techStore", () => ({
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
			adjacency_bonus: 1,
			image: "some-image.webp",
			label: "My Module",
			module: "some-module",
			supercharged: false,
			tech: "some-tech",
		};

		// Mock useCell to return a specific cell state
		(useCell as unknown as Mock).mockReturnValue(mockCellState);

		(useTechStore as unknown as Mock).mockImplementation(
			(selector: (state: TechState) => unknown) => {
				const state: TechState = {
					activeGroups: {},
					checkedModules: {},
					clearAllCheckedModules: vi.fn(),
					clearCheckedModules: vi.fn(),
					clearResult: vi.fn(),
					clearTechGroups: vi.fn(),
					clearTechMaxBonus: vi.fn(),
					clearTechSolvedBonus: vi.fn(),
					getTechColor: vi.fn(() => "blue"),
					initializeTechTree: vi.fn(),
					max_bonus: {},
					setActiveGroup: vi.fn(),
					setActiveGroups: vi.fn(),
					setCheckedModules: vi.fn(),
					setTechColors: vi.fn(),
					setTechGroups: vi.fn(),
					setTechMaxBonus: vi.fn(),
					setTechSolvedBonus: vi.fn(),
					setTechSolveMethod: vi.fn(),
					solve_method: {},
					solved_bonus: {},
					techColors: {},
					techGroups: {},
				};

				return selector(state);
			}
		);
	});

	const renderComponent = (cellOverrides = {}, props = {}) => {
		// Mutate mockCellState with overrides before rendering
		Object.assign(mockCellState, cellOverrides);

		return render(<GridCell columnIndex={0} rowIndex={0} {...props} />);
	};

	it("renders correctly", () => {
		renderComponent();
		expect(screen.getByRole("gridcell")).toBeInTheDocument();
	});

	it("renders upgrade priority label when applicable", () => {
		renderComponent({ active: true, label: "Upgrade sigma" });
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("renders 'S1' for 'Salvaged Upgrade Module Theta'", () => {
		renderComponent({ active: true, label: "Salvaged Upgrade Module Theta" });
		expect(screen.getByText("S1")).toBeInTheDocument();
	});

	it("renders 'F1' for 'Forbidden Upgrade Module Theta'", () => {
		renderComponent({ active: true, label: "Forbidden Upgrade Module Theta" });
		expect(screen.getByText("F1")).toBeInTheDocument();
	});

	it("renders corner elements when not supercharged and no image is present", () => {
		renderComponent({ image: null, supercharged: false });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).toBeInTheDocument();
	});

	it("does not render corner elements when an image is present", () => {
		renderComponent({ image: "some-image.webp", supercharged: false });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).not.toBeInTheDocument();
	});

	it("does not render corner elements when supercharged", () => {
		renderComponent({ supercharged: true });
		const cellElement = screen.getByRole("gridcell");
		expect(cellElement.querySelector(".corner.top-left")).not.toBeInTheDocument();
	});

	it("should be wrapped in React.memo for performance", () => {
		// React.memo wraps the component, setting $$typeof to Symbol.for("react.memo")
		// and placing the original component in the `type` property.
		expect(GridCell).toHaveProperty("$$typeof", Symbol.for("react.memo"));
	});
});
