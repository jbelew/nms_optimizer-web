import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TechTreeItem } from "@/types/tech";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";

import { ModuleSelectionDialog } from "./ModuleSelectionDialog";

vi.mock("react-i18next", () => ({
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	useTranslation: () => ({
		t: (key: string, options?: { height?: number; techName?: string; width?: number }) => {
			if (key === "moduleSelection.title") return `Modules for ${options?.techName}`;
			if (key === "moduleSelection.trails") return "Starship Trails";
			if (key === "moduleSelection.figurines") return "Figurines";
			if (key === "moduleSelection.bonus") return "Bonus Modules";
			if (key === "moduleSelection.cosmetic") return "Cosmetic Modules";
			if (key === "moduleSelection.selectAll") return "Select All";
			if (key === "moduleSelection.optimizeButton") return "Optimize";
			if (key === "moduleSelection.cancelButton") return "Cancel";
			if (key === "moduleSelection.solverWindow")
				return `Window: ${options?.width}×${options?.height}`;
			if (key === "moduleSelection.solverWindowEmpty") return "Window: —";
			if (key === "technologies.starship.hyperdrive") return "Hyperdrive";
			if (key.startsWith("moduleSelection.")) return key.split(".").pop();

			return key;
		},
	}),
}));

vi.mock("@/hooks/useOptimize/useOptimize");
vi.mock("@/hooks/useAnalytics/useAnalytics");
vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		openDialog: vi.fn(),
	}),
}));

vi.mock("@/components/AppDialog/Base/AppDialog", () => {
	interface MockAppDialogProps {
		content?: React.ReactNode;
		footer?: React.ReactNode;
		isOpen?: boolean;
		title?: React.ReactNode;
	}
	const MockAppDialog = ({ content, footer, isOpen, title }: MockAppDialogProps) =>
		isOpen ?
			<div data-testid="app-dialog">
				<h1>{title}</h1>
				<div>{content}</div>
				<div>{footer}</div>
			</div>
		:	null;

	return {
		default: MockAppDialog,
	};
});

const baseModules: TechTreeItem["modules"] = [
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: true,
		id: "core1",
		image: "core.png",
		label: "Core Module",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "core",
		value: 0,
	},
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: true,
		id: "bonus2",
		image: "bonus.png",
		label: "Beta Bonus",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "bonus",
		value: 0,
	},
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: true,
		id: "bonus1",
		image: "bonus.png",
		label: "Alpha Bonus",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "bonus",
		value: 0,
	},
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: false,
		id: "cosmetic1",
		image: "cosmetic.png",
		label: "Cosmetic Module",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "cosmetic",
		value: 0,
	},
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: true,
		id: "upgrade_theta",
		image: "upgrade.png",
		label: "Upgrade Theta",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "upgrade",
		value: 0,
	},
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: true,
		id: "upgrade_tau",
		image: "upgrade.png",
		label: "Upgrade Tau",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "upgrade",
		value: 0,
	},
	{
		active: true,
		adjacency: "",
		adjacency_bonus: 0,
		bonus: 0,
		checked: false,
		id: "upgrade_sigma",
		image: "upgrade.png",
		label: "Upgrade Sigma",
		sc_eligible: false,
		supercharged: false,
		tech: "hyperdrive",
		type: "upgrade",
		value: 0,
	},
];

interface SeedOptions {
	checkedModules?: string[];
	isGridFull?: boolean;
	isOpen?: boolean;
	modules?: TechTreeItem["modules"];
	platform?: string;
	selectedTechData?: null | {
		tech: string;
		techColor: "blue";
		techImage: null | string;
	};
	windowRules?: Record<string, [number, number]>;
}

describe("ModuleSelectionDialog", () => {
	const mockHandleOptimize = vi.fn();
	const mockSendDeferredEvent = vi.fn();

	const seedAndRender = ({
		checkedModules = ["core1", "bonus1", "upgrade_theta", "upgrade_tau"],
		isGridFull = false,
		isOpen = true,
		modules = baseModules,
		platform = "explorer",
		selectedTechData = {
			tech: "hyperdrive",
			techColor: "blue",
			techImage: "starship/hyperdrive.webp",
		},
		windowRules,
	}: SeedOptions = {}) => {
		usePlatformStore.setState({ selectedPlatform: platform });
		useGridStore.setState({ activeTechs: new Set(["hyperdrive"]), isGridFull });
		useTechStore.setState({
			activeGroups: { hyperdrive: "normal" },
			checkedModules: { hyperdrive: checkedModules },
			techGroups: {
				hyperdrive: [
					{
						color: "blue",
						image: "starship/hyperdrive.webp",
						key: "hyperdrive",
						label: "Hyperdrive",
						module_count: modules.length,
						modules,
						type: "normal",
						window_rules: windowRules,
					},
				],
			},
		});
		useModuleSelectionDialogStore.setState({
			isOpen,
			selectedTechData,
		});

		vi.mocked(useOptimize).mockReturnValue({
			clearPatternNoFitTech: vi.fn(),
			gridContainerRef: { current: null },
			handleForceCurrentPnfOptimize: vi.fn(),
			handleOptimize: mockHandleOptimize,
			patternNoFitTech: null,
			solving: false,
		});

		vi.mocked(useAnalytics).mockReturnValue({
			sendDeferredEvent: mockSendDeferredEvent,
			sendEvent: vi.fn(),
		});

		return render(<ModuleSelectionDialog />);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders null when selectedTechData is null", () => {
		const { container } = seedAndRender({ isOpen: false, selectedTechData: null });
		expect(container.firstChild).toBeNull();
	});

	it("renders the dialog with localized title and fires page_view analytics on open", async () => {
		seedAndRender();
		expect(await screen.findByText("Modules for Hyperdrive")).toBeInTheDocument();
		expect(mockSendDeferredEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page_title: "Hyperdrive Selection | appName",
			}),
		);
	});

	it("renders Module Groups and sorts alphabetical groups ('bonus', 'figurines', 'trails')", async () => {
		seedAndRender({
			modules: [
				...baseModules,
				{
					...baseModules[0],
					id: "fig2",
					label: "Beta Figurine",
					type: "bonus",
				},
				{
					...baseModules[0],
					id: "fig1",
					label: "Alpha Figurine",
					type: "bonus",
				},
				{
					...baseModules[0],
					id: "trail2",
					label: "Beta Trail",
					type: "trails",
				},
				{
					...baseModules[0],
					id: "trail1",
					label: "Alpha Trail",
					type: "trails",
				},
			],
		});

		const bonusHeader = await screen.findByText("Bonus Modules");
		const bonusLabels = bonusHeader.parentElement?.querySelectorAll("label");
		expect(bonusLabels![0]).toHaveTextContent("Alpha Bonus");
		expect(bonusLabels![1]).toHaveTextContent("Beta Bonus");

		const figurinesHeader = await screen.findByText("Figurines");
		const figLabels = figurinesHeader.parentElement?.querySelectorAll("label");
		expect(figLabels![0]).toHaveTextContent("Alpha Figurine");
		expect(figLabels![1]).toHaveTextContent("Beta Figurine");

		const trailsHeader = await screen.findByText("Starship Trails");
		const trailLabels = trailsHeader.parentElement?.querySelectorAll("label");
		expect(trailLabels![0]).toHaveTextContent("Alpha Trail");
		expect(trailLabels![1]).toHaveTextContent("Beta Trail");
	});

	it("enforces Module Rank Order prerequisite disabling and cascading deselection", async () => {
		seedAndRender({
			checkedModules: ["core1", "upgrade_theta", "upgrade_tau", "upgrade_sigma"],
		});

		const thetaCheckbox = await screen.findByRole("checkbox", { name: /Upgrade Theta/i });
		const tauCheckbox = screen.getByRole("checkbox", { name: /Upgrade Tau/i });
		const sigmaCheckbox = screen.getByRole("checkbox", { name: /Upgrade Sigma/i });

		expect(tauCheckbox).not.toBeDisabled();
		expect(sigmaCheckbox).not.toBeDisabled();

		// Uncheck Theta -> cascades to deselect Tau and Sigma and disables both
		fireEvent.click(thetaCheckbox);

		await waitFor(() => {
			expect(useTechStore.getState().checkedModules["hyperdrive"]).toEqual(["core1"]);
		});
		expect(tauCheckbox).toBeDisabled();
		expect(sigmaCheckbox).toBeDisabled();
	});

	it("updates Solver Window dimensions and store selection when checkboxes or Select All are toggled", async () => {
		seedAndRender({
			checkedModules: ["core1", "bonus1"],
		});

		expect(await screen.findByText(/2×1 \(x2\)/)).toBeInTheDocument();

		// Check Beta Bonus -> 3 modules checked -> 2×2 (x3)
		fireEvent.click(screen.getByRole("checkbox", { name: /Beta Bonus/i }));
		expect(screen.getByText(/2×2 \(x3\)/)).toBeInTheDocument();

		// Select All -> all 7 modules checked -> 3×3 (x7)
		fireEvent.click(screen.getByRole("checkbox", { name: "Select All" }));
		expect(screen.getByText(/3×3 \(x7\)/)).toBeInTheDocument();

		// Deselect All -> only core1 remains -> 1×1 (x1)
		fireEvent.click(screen.getByRole("checkbox", { name: "Select All" }));
		expect(screen.getByText(/1×1 \(x1\)/)).toBeInTheDocument();
	});

	it("respects custom windowRules overrides when displaying Solver Window dimensions", async () => {
		seedAndRender({
			checkedModules: ["core1", "bonus1", "bonus2", "upgrade_theta", "upgrade_tau"],
			windowRules: {
				"1": [1, 1],
				"2": [2, 1],
				"4": [2, 2],
				"6": [3, 3],
				default: [3, 3],
			},
		});

		expect(await screen.findByText(/3×3 \(x5\)/)).toBeInTheDocument();
	});

	it("disables Optimize and displays empty window when zero modules are checked", async () => {
		seedAndRender({ checkedModules: [] });

		expect(await screen.findByText(/— \(x0\)/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Optimize" })).toBeDisabled();
	});

	it("reverts uncommitted Module Selection changes to the initial snapshot when Cancel is clicked", async () => {
		seedAndRender({
			checkedModules: ["core1", "bonus1"],
		});

		// Modify selection by checking Beta Bonus
		fireEvent.click(await screen.findByRole("checkbox", { name: /Beta Bonus/i }));
		expect(useTechStore.getState().checkedModules["hyperdrive"]).toContain("bonus2");

		// Click Cancel -> reverts to ["core1", "bonus1"] and closes dialog
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		await waitFor(() => {
			expect(useTechStore.getState().checkedModules["hyperdrive"]).toEqual([
				"core1",
				"bonus1",
			]);
			expect(useModuleSelectionDialogStore.getState().isOpen).toBe(false);
		});
	});

	it("calls handleOptimize and closes dialog without reverting when Optimize is clicked", async () => {
		seedAndRender({
			checkedModules: ["core1", "bonus1"],
		});

		fireEvent.click(await screen.findByRole("checkbox", { name: /Beta Bonus/i }));
		fireEvent.click(screen.getByRole("button", { name: "Optimize" }));

		await waitFor(() => {
			expect(mockHandleOptimize).toHaveBeenCalledWith("hyperdrive");
			expect(useModuleSelectionDialogStore.getState().isOpen).toBe(false);
		});
		expect(useTechStore.getState().checkedModules["hyperdrive"]).toContain("bonus2");
	});
});
