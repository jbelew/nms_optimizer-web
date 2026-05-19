import type { GridStore } from "@/store/grid/gridStore";
import type { TechState } from "@/store/tech/techStore";
import type { ModuleSelectionDialogState, ShakeState } from "@/store/ui/uiStore";
import type { TechTreeRowProps } from "@/types/props";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTechTree } from "@/components/TechTree/useTechTreeContext";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore, useShakeStore } from "@/store/ui/uiStore";

import { TechTreeRow } from "./TechTreeRow";

// Mock the stores and hooks
vi.mock("@/store/grid/gridStore", () => ({ useGridStore: vi.fn() }));
vi.mock("@/store/tech/techStore", () => ({ useTechStore: vi.fn() }));
vi.mock("@/store/ui/uiStore", () => ({
	useModuleSelectionDialogStore: vi.fn(),
	useShakeStore: vi.fn(),
}));
vi.mock("@/components/TechTree/useTechTreeContext", () => ({
	useTechTree: vi.fn(),
}));

vi.mock("@/components/ConditionalTooltip/ConditionalTooltip", () => ({
	ConditionalTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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
const mockUseModuleSelectionDialogStore = vi.mocked(useModuleSelectionDialogStore);
const mockUseTechTree = vi.mocked(useTechTree);

const defaultProps: TechTreeRowProps = {
	tech: "testTech",
	techColor: "blue",
	techImage: "test.webp",
};

// Helper to render
/**
 *
 * @example
 */
const renderWithProviders = (ui: React.ReactElement) => {
	return render(ui);
};

// Helper to set up the default store mocks
/**
 *
 * @example
 */
const setupMocks = (hasTechInGrid: boolean, solving = false) => {
	mockUseTechTree.mockReturnValue({
		handleOptimize: vi.fn(),
		isGridFull: false,
		solving,
	});

	mockUseGridStore.mockImplementation((selector?: (state: GridStore) => unknown) => {
		const state: Partial<GridStore> = {
			activeTechs: hasTechInGrid ? new Set(["testTech"]) : new Set(),
			resetGridTech: vi.fn(),
		};

		return selector ? selector(state as GridStore) : (state as GridStore);
	});

	mockUseTechStore.mockImplementation((selector?: (state: TechState) => unknown) => {
		const state: Partial<TechState> = {
			checkedModules: { testTech: ["module1"] },

			clearTechMaxBonus: vi.fn(),

			clearTechSolvedBonus: vi.fn(),

			max_bonus: {},

			solved_bonus: {},

			techGroups: {
				testTech: [
					{
						color: "blue",

						image: null,

						key: "testTech",

						label: "Test Tech Group",

						module_count: 1,

						modules: [
							{
								active: false,

								adjacency: "",

								adjacency_bonus: 0,

								bonus: 0,

								id: "module1",

								image: "",

								label: "Module 1",

								sc_eligible: false,

								supercharged: false,

								tech: "testTech",

								type: "",

								value: 0,
							},
						],
					},
				],
			},
		};

		return selector ? selector(state as TechState) : (state as TechState);
	});

	mockUseShakeStore.mockImplementation((selector?: (state: ShakeState) => unknown) => {
		const state: Partial<ShakeState> = { triggerShake: vi.fn() };

		return selector ? selector(state as ShakeState) : (state as ShakeState);
	});

	mockUseModuleSelectionDialogStore.mockImplementation(
		(selector?: (state: ModuleSelectionDialogState) => unknown) => {
			const state: ModuleSelectionDialogState = {
				closeDialog: vi.fn(),
				isOpen: false,
				openDialog: vi.fn(),
				selectedTechData: null,
			};

			return selector ? selector(state) : state;
		}
	);
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
		const handleOptimizeMock = vi.fn();
		setupMocks(false);
		mockUseTechTree.mockReturnValue({
			handleOptimize: handleOptimizeMock,
			isGridFull: false,
			solving: false,
		});

		renderWithProviders(<TechTreeRow {...defaultProps} />);

		// Act
		const solveButton = screen.getByRole("button", { name: "Solve Test Tech Name" });
		fireEvent.click(solveButton);

		// Assert
		expect(handleOptimizeMock).toHaveBeenCalledWith("testTech");
	});

	it("should disable buttons when solving", () => {
		// Arrange
		setupMocks(true, true);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		// Assert
		const updateButton = screen.getByRole("button", { name: "Update Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(updateButton).toBeDisabled();
		expect(resetButton).toBeDisabled();
	});
});
