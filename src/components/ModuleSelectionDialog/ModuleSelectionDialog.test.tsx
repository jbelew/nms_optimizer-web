import type { Mock } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";

import { ModuleSelectionDialog } from "./ModuleSelectionDialog";

// Mocking external dependencies
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
			if (key.startsWith("moduleSelection.")) return key.split(".").pop();

			return key;
		},
	}),
}));

vi.mock("@/store/app/platformStore");
vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		openDialog: vi.fn(),
	}),
}));

// Mock AppDialog to support compound component pattern
vi.mock("@/components/AppDialog/Base/AppDialog", () => {
	const MockRoot = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
	const MockTitle = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
	const MockBody = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
	const MockFooter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

	interface MockAppDialogProps {
		content?: React.ReactNode;
		footer?: React.ReactNode;
		title?: React.ReactNode;
	}
	const MockAppDialog = ({ content, footer, title }: MockAppDialogProps) => (
		<div>
			<h1>{title}</h1>
			<div>{content}</div>
			<div>{footer}</div>
		</div>
	);

	return {
		default: Object.assign(MockAppDialog, {
			Body: MockBody,
			Footer: MockFooter,
			Root: MockRoot,
			Title: MockTitle,
		}),
	};
});

const mockGroupedModules = {
	atlantid: [],
	bonus: [
		{ id: "bonus2", image: "bonus.png", label: "Beta Bonus" },
		{ id: "bonus1", image: "bonus.png", label: "Alpha Bonus" },
	],
	core: [{ id: "core1", image: "core.png", label: "Core Module" }],
	cosmetic: [{ id: "cosmetic1", image: "cosmetic.png", label: "Cosmetic Module" }],
	reactor: [],
	upgrade: [
		{ id: "upgrade_sigma", image: "upgrade.png", label: "Upgrade Sigma" },
		{ id: "upgrade_tau", image: "upgrade.png", label: "Upgrade Tau" },
	],
};

const defaultProps = {
	allModulesSelected: false,
	currentCheckedModules: ["bonus1", "upgrade_tau"],
	groupedModules: mockGroupedModules,
	handleOptimizeClick: vi.fn(),
	handleSelectAllChange: vi.fn(),
	handleValueChange: vi.fn(),
	isIndeterminate: true,
	isOpen: true,
	onClose: vi.fn(),
	techColor: "blue" as const,
	techImage: "hyperdrive.png",
	translatedTechName: "Hyperdrive",
};

/**
 * Helper to render the dialog for testing.
 */
const renderDialog = (props = {}) => {
	(usePlatformStore as unknown as Mock).mockReturnValue({
		selectedPlatform: "explorer",
	});

	return render(<ModuleSelectionDialog {...defaultProps} {...props} />);
};

describe("ModuleSelectionDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the dialog with the correct title", async () => {
		renderDialog();
		expect(await screen.findByText("Modules for Hyperdrive")).toBeInTheDocument();
	});

	it("renders module groups correctly", async () => {
		renderDialog();
		expect(await screen.findByText("Bonus Modules")).toBeInTheDocument();
		expect(screen.getByText("Alpha Bonus")).toBeInTheDocument();
		expect(screen.getByText("upgrade")).toBeInTheDocument();
		expect(screen.getByText("Cosmetic Modules")).toBeInTheDocument();
	});

	it("sorts 'bonus' modules alphabetically", async () => {
		renderDialog();
		const header = await screen.findByText("Bonus Modules");
		const group = header.parentElement;
		const bonusModules = group?.querySelectorAll("label");
		expect(bonusModules).not.toBeNull();
		expect(bonusModules![0]).toHaveTextContent("Alpha Bonus");
		expect(bonusModules![1]).toHaveTextContent("Beta Bonus");
	});

	it("sorts 'trails' and 'figurines' modules alphabetically", async () => {
		const props = {
			...defaultProps,
			groupedModules: {
				...mockGroupedModules,
				figurines: [
					{ id: "fig2", image: "fig.png", label: "Beta Figurine" },
					{ id: "fig1", image: "fig.png", label: "Alpha Figurine" },
				],
				trails: [
					{ id: "trail2", image: "trail.png", label: "Beta Trail" },
					{ id: "trail1", image: "trail.png", label: "Alpha Trail" },
				],
			},
		};
		renderDialog(props);

		const trailsHeader = await screen.findByText("Starship Trails");
		const trailsGroup = trailsHeader.parentElement;
		const trailModules = trailsGroup?.querySelectorAll("label");
		expect(trailModules![0]).toHaveTextContent("Alpha Trail");
		expect(trailModules![1]).toHaveTextContent("Beta Trail");

		const figurinesHeader = await screen.findByText("Figurines");
		const figurinesGroup = figurinesHeader.parentElement;
		const figModules = figurinesGroup?.querySelectorAll("label");
		expect(figModules![0]).toHaveTextContent("Alpha Figurine");
		expect(figModules![1]).toHaveTextContent("Beta Figurine");
	});

	it("calls handleValueChange when a checkbox is clicked", async () => {
		renderDialog();
		// Find the checkbox by its value (id)
		const checkbox = await screen.findByRole("checkbox", { name: "Alpha Bonus" });
		fireEvent.click(checkbox);

		// The CheckboxGroup.Root onValueChange should be called with the new array
		await vi.waitFor(() => {
			expect(defaultProps.handleValueChange).toHaveBeenCalled();
		});
	});

	it("calls handleSelectAllChange when 'Select All' is clicked", async () => {
		renderDialog();
		fireEvent.click(await screen.findByRole("checkbox", { name: "Select All" }));
		await vi.waitFor(() => {
			expect(defaultProps.handleSelectAllChange).toHaveBeenCalled();
		});
	});

	it("disables the optimize button when no modules are checked", async () => {
		renderDialog({ currentCheckedModules: [] });
		const optimizeButton = await screen.findByRole("button", { name: "Optimize" });
		expect(optimizeButton).toBeDisabled();
	});

	it("calls handleOptimizeClick when the optimize button is clicked", async () => {
		renderDialog();
		const optimizeButton = await screen.findByRole("button", { name: "Optimize" });
		fireEvent.click(optimizeButton);
		await vi.waitFor(() => {
			expect(defaultProps.handleOptimizeClick).toHaveBeenCalled();
		});
	});

	it("renders Solver Window dimensions in the footer when modules are selected", async () => {
		renderDialog({
			currentCheckedModules: [
				"bonus1",
				"bonus2",
				"upgrade_sigma",
				"upgrade_tau",
				"cosmetic1",
			],
		});
		expect(await screen.findByText("Window: 3×2 (x5)")).toBeInTheDocument();
	});

	it("renders 'Window: — (x0)' in the footer when zero modules are selected", async () => {
		renderDialog({ currentCheckedModules: [] });
		expect(await screen.findByText("Window: — (x0)")).toBeInTheDocument();
	});

	it("respects custom windowRules overrides when displaying Solver Window dimensions", async () => {
		renderDialog({
			currentCheckedModules: [
				"bonus1",
				"bonus2",
				"upgrade_sigma",
				"upgrade_tau",
				"cosmetic1",
			],
			windowRules: {
				"1": [1, 1],
				"2": [2, 1],
				"4": [2, 2],
				"6": [3, 3],
				default: [3, 3],
			},
		});
		expect(await screen.findByText("Window: 3×3 (x5)")).toBeInTheDocument();
	});

	it("updates Solver Window dimensions immediately as module checkboxes are checked and unchecked", async () => {
		const InteractiveWrapper = () => {
			const [checkedModules, setCheckedModules] = React.useState<string[]>([
				"bonus1",
				"upgrade_sigma",
			]);
			const nonCoreIds = ["bonus1", "bonus2", "cosmetic1", "upgrade_sigma", "upgrade_tau"];
			const allSelected = nonCoreIds.every((id) => checkedModules.includes(id));

			return (
				<ModuleSelectionDialog
					{...defaultProps}
					allModulesSelected={allSelected}
					currentCheckedModules={checkedModules}
					handleSelectAllChange={(checked) => {
						setCheckedModules(checked ? nonCoreIds : []);
					}}
					handleValueChange={setCheckedModules}
					isIndeterminate={checkedModules.length > 0 && !allSelected}
				/>
			);
		};

		(usePlatformStore as unknown as Mock).mockReturnValue({
			selectedPlatform: "explorer",
		});

		render(<InteractiveWrapper />);

		// Initially 2 modules checked -> 2×1 (x2)
		expect(await screen.findByText("Window: 2×1 (x2)")).toBeInTheDocument();

		// Check a 3rd module ("Beta Bonus") -> 3 modules checked -> 2×2 (x3)
		fireEvent.click(screen.getByRole("checkbox", { name: /Beta Bonus/i }));
		expect(screen.getByText("Window: 2×2 (x3)")).toBeInTheDocument();

		// Select All -> 5 modules checked -> 3×2 (x5)
		fireEvent.click(screen.getByRole("checkbox", { name: "Select All" }));
		expect(screen.getByText("Window: 3×2 (x5)")).toBeInTheDocument();

		// Deselect All -> 0 modules checked -> Window: — (x0)
		fireEvent.click(screen.getByRole("checkbox", { name: "Select All" }));
		expect(screen.getByText("Window: — (x0)")).toBeInTheDocument();
	});
});
