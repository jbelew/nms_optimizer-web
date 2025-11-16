import React from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GridStore, useGridStore } from "@/store/GridStore";
import { ShakeState, useShakeStore } from "@/store/ShakeStore";
import { TechState, useTechStore } from "@/store/TechStore";

import { TechTreeRow, TechTreeRowProps } from "./TechTreeRow";

// Mock the stores and hooks
vi.mock("@/store/GridStore", () => ({ useGridStore: vi.fn() }));
vi.mock("@/store/TechStore", () => ({ useTechStore: vi.fn() }));
vi.mock("@/store/ShakeStore", () => ({ useShakeStore: vi.fn() }));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => {
			if (key === "technologies.test") return "Test Tech Name";
			if (key === "techTree.tooltips.solve") return "Solve";
			if (key === "techTree.tooltips.reset") return "Reset";
			if (key === "techTree.tooltips.update") return "Update";
			return key;
		},
	}),
}));

const mockUseGridStore = vi.mocked(useGridStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUseShakeStore = vi.mocked(useShakeStore);

const defaultProps: TechTreeRowProps = {
	tech: "testTech",
	handleOptimize: vi.fn(),
	solving: false,
	techImage: "test.webp",
	isGridFull: false,
	techColor: "blue",
};

// Helper to render with the TooltipProvider
const renderWithProviders = (ui: React.ReactElement) => {
	return render(<TooltipProvider>{ui}</TooltipProvider>);
};

// Helper to set up the default store mocks
const setupMocks = (hasTechInGrid: boolean) => {
	mockUseGridStore.mockImplementation((selector?: (state: GridStore) => unknown) => {
		const state: Partial<GridStore> = {
			hasTechInGrid: () => hasTechInGrid,
			resetGridTech: vi.fn(),
		};
		return selector ? selector(state as GridStore) : (state as GridStore);
	});

	mockUseTechStore.mockImplementation((selector?: (state: TechState) => unknown) => {
		const state: Partial<TechState> = {
			techGroups: {
				testTech: [
					{
						label: "Test Tech Group",

						key: "testTech",

						image: null,

						color: "blue",

						modules: [
							{
								id: "module1",

								label: "Module 1",

								active: false,

								adjacency: "",

								adjacency_bonus: 0,

								bonus: 0,

								image: "",

								sc_eligible: false,

								supercharged: false,

								tech: "testTech",

								type: "",

								value: 0,
							},
						],

						module_count: 1,
					},
				],
			},

			max_bonus: {},

			solved_bonus: {},

			checkedModules: { testTech: ["module1"] },

			clearTechMaxBonus: vi.fn(),

			clearTechSolvedBonus: vi.fn(),
		};

		return selector ? selector(state as TechState) : (state as TechState);
	});

	mockUseShakeStore.mockImplementation((selector?: (state: ShakeState) => unknown) => {
		const state: Partial<ShakeState> = { triggerShake: vi.fn() };
		return selector ? selector(state as ShakeState) : (state as ShakeState);
	});
};

describe("TechTreeRow", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should have Solve enabled and Reset disabled when tech is not in grid", () => {
		// Arrange
		setupMocks(false);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		// Assert
		expect(screen.getByText("Test Tech Name")).toBeInTheDocument();
		const solveButton = screen.getByRole("button", { name: "Solve Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(solveButton).not.toBeDisabled();
		expect(resetButton).toBeDisabled();
	});

	it("should have Update enabled and Reset enabled when tech is in grid", () => {
		// Arrange
		setupMocks(true);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		// Assert
		expect(screen.getByText("Test Tech Name")).toBeInTheDocument();
		const updateButton = screen.getByRole("button", { name: "Update Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(updateButton).not.toBeDisabled();
		expect(resetButton).not.toBeDisabled();
	});

	it("should call handleOptimize when the solve button is clicked", () => {
		// Arrange
		setupMocks(false);
		const handleOptimizeMock = vi.fn();
		renderWithProviders(<TechTreeRow {...defaultProps} handleOptimize={handleOptimizeMock} />);

		// Act
		const solveButton = screen.getByRole("button", { name: "Solve Test Tech Name" });
		fireEvent.click(solveButton);

		// Assert
		expect(handleOptimizeMock).toHaveBeenCalledWith("testTech");
	});

	it("should disable buttons when solving", () => {
		// Arrange
		setupMocks(true); // Tech can be in grid or not, doesn't matter
		renderWithProviders(<TechTreeRow {...defaultProps} solving={true} />);

		// Assert
		const updateButton = screen.getByRole("button", { name: "Update Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(updateButton).toBeDisabled();
		expect(resetButton).toBeDisabled();
	});
});
