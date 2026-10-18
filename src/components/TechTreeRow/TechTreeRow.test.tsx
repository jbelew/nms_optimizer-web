import type { GridStore } from "@/store/grid/gridStore";
import type { BonusStatusData, TechStore } from "@/store/tech/techStore";
import type { ModuleSelectionDialogState } from "@/store/ui/uiStore";
import type { TechTreeRowProps } from "@/types/props";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";

import { TechTreeRow } from "./TechTreeRow";

// Mock the stores and hooks
vi.mock("@/store/grid/gridStore", () => ({ useGridStore: vi.fn() }));
vi.mock("@/store/tech/techStore", () => ({ useTechStore: vi.fn() }));
vi.mock("@/store/ui/uiStore", () => ({
	useModuleSelectionDialogStore: vi.fn(),
}));
vi.mock("@/hooks/useOptimize/useOptimize", () => ({
	useOptimize: vi.fn(),
}));

vi.mock("@/components/ConditionalTooltip/ConditionalTooltip", () => ({
	ConditionalTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { count?: number; techName?: string }) => {
			if (key === "technologies.test") return "Test Tech Name";
			if (key === "techTree.tooltips.solve") return "Solve";
			if (key === "techTree.tooltips.reset") return "Reset";
			if (key === "techTree.tooltips.update") return "Update";
			if (key === "techTree.tooltips.gridFull") return "Grid Full";
			if (key === "moduleSelection.tooltip")
				return `${options?.techName ?? "Technology"} Module Selection`;

			return key;
		},
	}),
}));

const mockUseGridStore = vi.mocked(useGridStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUseModuleSelectionDialogStore = vi.mocked(useModuleSelectionDialogStore);
const mockUseOptimize = vi.mocked(useOptimize);

const defaultProps: TechTreeRowProps = {
	tech: "testTech",
	techColor: "blue",
	techImage: "test.webp",
};

const renderWithProviders = (ui: React.ReactElement) => {
	return render(ui);
};

const mockResetGridTech = vi.fn();
const mockClearTechMaxBonus = vi.fn();
const mockClearTechSolvedBonus = vi.fn();
const mockOpenDialog = vi.fn();

const setupMocks = (hasTechInGrid: boolean, solving = false, isGridFull = false) => {
	mockUseOptimize.mockReturnValue({
		clearPatternNoFitTech: vi.fn(),
		gridContainerRef: { current: null },
		handleForceCurrentPnfOptimize: vi.fn(),
		handleOptimize: vi.fn(),
		patternNoFitTech: null,
		solving,
	});

	const gridState: Partial<GridStore> = {
		activeTechs: hasTechInGrid ? new Set(["testTech"]) : new Set(),
		isGridFull,
		resetGridTech: mockResetGridTech,
	};
	mockUseGridStore.mockImplementation((selector?: (state: GridStore) => unknown) => {
		return selector ? selector(gridState as GridStore) : (gridState as GridStore);
	});
	Object.assign(mockUseGridStore, { getState: () => gridState });

	mockUseTechStore.mockImplementation((selector?: (state: TechStore) => unknown) => {
		const state: Partial<TechStore> = {
			checkedModules: { testTech: ["module1"] },
			clearBonusStatus: vi.fn(),
			clearTechMaxBonus: mockClearTechMaxBonus,
			clearTechSolvedBonus: mockClearTechSolvedBonus,
			clearTechSolveMethod: vi.fn(),
			getBonusStatus: vi.fn(() => null),
			maxBonus: {},
			solvedBonus: {},
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

		return selector ? selector(state as TechStore) : (state as TechStore);
	});

	mockUseModuleSelectionDialogStore.mockImplementation(
		(selector?: (state: ModuleSelectionDialogState) => unknown) => {
			const state: ModuleSelectionDialogState = {
				closeDialog: vi.fn(),
				isOpen: false,
				openDialog: mockOpenDialog,
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
		setupMocks(false);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		expect(screen.getByText("Test Tech Name")).toBeInTheDocument();
		const solveButton = screen.getByRole("button", { name: "Solve Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(solveButton).not.toBeDisabled();
		expect(resetButton).toBeDisabled();
	});

	it("should have Update enabled and Reset enabled when tech is in grid", () => {
		setupMocks(true);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		expect(screen.getByText("Test Tech Name")).toBeInTheDocument();
		const updateButton = screen.getByRole("button", { name: "Update Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(updateButton).not.toBeDisabled();
		expect(resetButton).not.toBeDisabled();
	});

	it("should disable optimize button with Grid Full label when grid is full and tech is not in grid", () => {
		setupMocks(false, false, true);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const gridFullButton = screen.getByRole("button", { name: "Grid Full Test Tech Name" });
		expect(gridFullButton).toBeDisabled();
	});

	it("should gracefully handle missing tech in techStore and disable solve when 0 modules are checked", () => {
		setupMocks(false);
		mockUseTechStore.mockImplementation((selector?: (state: TechStore) => unknown) => {
			const state: Partial<TechStore> = {
				checkedModules: {},
				getBonusStatus: vi.fn(() => null),
				solvedBonus: {},
				techGroups: {},
			};

			return selector ? selector(state as TechStore) : (state as TechStore);
		});

		renderWithProviders(<TechTreeRow {...defaultProps} techImage={null} />);

		const solveButton = screen.getByRole("button", {
			name: "Solve technologies.testTech",
		});
		expect(solveButton).toBeDisabled();
		const moduleButton = screen.getByRole("button", {
			name: "x0 - technologies.testTech Module Selection",
		});
		expect(moduleButton).toHaveTextContent("x0");
	});

	it("should call handleOptimize when the solve button is clicked", () => {
		const handleOptimizeMock = vi.fn();
		setupMocks(false);
		mockUseOptimize.mockReturnValue({
			clearPatternNoFitTech: vi.fn(),
			gridContainerRef: { current: null },
			handleForceCurrentPnfOptimize: vi.fn(),
			handleOptimize: handleOptimizeMock,
			patternNoFitTech: null,
			solving: false,
		});

		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const solveButton = screen.getByRole("button", { name: "Solve Test Tech Name" });
		fireEvent.click(solveButton);

		expect(handleOptimizeMock).toHaveBeenCalledWith("testTech");
	});

	it("should disable buttons when solving", () => {
		setupMocks(true, true);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const updateButton = screen.getByRole("button", { name: "Update Test Tech Name" });
		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		expect(updateButton).toBeDisabled();
		expect(resetButton).toBeDisabled();
	});

	it("should call handleReset and initiate reset transition when the reset button is clicked", () => {
		const resetTechSpy = vi
			.spyOn(sessionCoordinator, "resetTechnology")
			.mockImplementation(() => {});
		setupMocks(true);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const resetButton = screen.getByRole("button", { name: "Reset Test Tech Name" });
		fireEvent.click(resetButton);

		expect(resetTechSpy).toHaveBeenCalledWith("testTech");
		resetTechSpy.mockRestore();
	});

	it("should initiate solve transition without executing synchronous layout queries", () => {
		const handleOptimizeMock = vi.fn();
		setupMocks(false);
		mockUseOptimize.mockReturnValue({
			clearPatternNoFitTech: vi.fn(),
			gridContainerRef: { current: null },
			handleForceCurrentPnfOptimize: vi.fn(),
			handleOptimize: handleOptimizeMock,
			patternNoFitTech: null,
			solving: false,
		});

		const scrollToMock = vi.fn();
		Object.defineProperty(window, "scrollTo", {
			configurable: true,
			value: scrollToMock,
			writable: true,
		});

		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const solveButton = screen.getByRole("button", { name: "Solve Test Tech Name" });
		fireEvent.click(solveButton);

		expect(handleOptimizeMock).toHaveBeenCalledWith("testTech");
		expect(scrollToMock).not.toHaveBeenCalled();
	});

	it("should render module count button with accessible name including visible text for WCAG 2.5.3", () => {
		setupMocks(false);
		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const moduleButton = screen.getByRole("button", {
			name: "x1 - Test Tech Name Module Selection",
		});
		expect(moduleButton).toBeInTheDocument();
		expect(moduleButton).toHaveTextContent("x1");
	});

	it("should open module selection dialog within transition when module count button is clicked", () => {
		setupMocks(false);
		mockUseTechStore.mockImplementation((selector?: (state: TechStore) => unknown) => {
			const state: Partial<TechStore> = {
				checkedModules: { testTech: ["module1", "module2"] },
				clearTechMaxBonus: mockClearTechMaxBonus,
				clearTechSolvedBonus: mockClearTechSolvedBonus,
				getBonusStatus: vi.fn(() => null),
				maxBonus: {},
				solvedBonus: {},
				techGroups: {
					testTech: [
						{
							color: "blue",
							image: null,
							key: "testTech",
							label: "Test Tech Group",
							module_count: 2,
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
								{
									active: false,
									adjacency: "",
									adjacency_bonus: 0,
									bonus: 0,
									id: "module2",
									image: "",
									label: "Module 2",
									sc_eligible: false,
									supercharged: false,
									tech: "testTech",
									type: "",
									value: 0,
								},
							],
							type: "normal",
						},
					],
				},
			};

			return selector ? selector(state as TechStore) : (state as TechStore);
		});

		renderWithProviders(<TechTreeRow {...defaultProps} />);

		const moduleButton = screen.getByRole("button", {
			name: "x2 - Test Tech Name Module Selection",
		});
		expect(moduleButton).not.toBeDisabled();
		fireEvent.click(moduleButton);

		expect(mockOpenDialog).toHaveBeenCalledWith({
			tech: "testTech",
			techColor: "blue",
			techImage: "test.webp",
		});
	});

	it("should not render BonusStatusIcon for single-module tech group even if in grid and solved", () => {
		setupMocks(true);
		const mockValidStatus: BonusStatusData = { icon: "check", percent: 0 };
		mockUseTechStore.mockImplementation((selector?: (state: TechStore) => unknown) => {
			const state: Partial<TechStore> = {
				checkedModules: { testTech: ["module1"] },
				clearTechMaxBonus: mockClearTechMaxBonus,
				clearTechSolvedBonus: mockClearTechSolvedBonus,
				getBonusStatus: vi.fn((): BonusStatusData | null => mockValidStatus),
				maxBonus: { testTech: 100 },
				solvedBonus: { testTech: 100 },
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
							type: "normal",
						},
					],
				},
			};

			return selector ? selector(state as TechStore) : (state as TechStore);
		});

		renderWithProviders(<TechTreeRow {...defaultProps} />);

		expect(
			screen.queryByRole("button", { name: "techTree.tooltips.validSolve" })
		).not.toBeInTheDocument();
	});

	it("should render BonusStatusIcon for multi-module tech group when in grid and solved", () => {
		setupMocks(true);
		const mockValidStatus: BonusStatusData = { icon: "check", percent: 0 };
		mockUseTechStore.mockImplementation((selector?: (state: TechStore) => unknown) => {
			const state: Partial<TechStore> = {
				checkedModules: { testTech: ["module1", "module2"] },
				clearTechMaxBonus: mockClearTechMaxBonus,
				clearTechSolvedBonus: mockClearTechSolvedBonus,
				getBonusStatus: vi.fn((): BonusStatusData | null => mockValidStatus),
				maxBonus: { testTech: 100 },
				solvedBonus: { testTech: 100 },
				techGroups: {
					testTech: [
						{
							color: "blue",
							image: null,
							key: "testTech",
							label: "Test Tech Group",
							module_count: 2,
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
								{
									active: false,
									adjacency: "",
									adjacency_bonus: 0,
									bonus: 0,
									id: "module2",
									image: "",
									label: "Module 2",
									sc_eligible: false,
									supercharged: false,
									tech: "testTech",
									type: "",
									value: 0,
								},
							],
							type: "normal",
						},
					],
				},
			};

			return selector ? selector(state as TechStore) : (state as TechStore);
		});

		renderWithProviders(<TechTreeRow {...defaultProps} />);

		expect(
			screen.getByRole("button", { name: "techTree.tooltips.validSolve" })
		).toBeInTheDocument();
	});
});
