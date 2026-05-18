import type { Mock } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";

import { ModuleSelectionDialog } from "./ModuleSelectionDialog";

// Mocking external dependencies
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { techName?: string }) => {
			if (key === "moduleSelection.title") return `Modules for ${options?.techName}`;
			if (key === "moduleSelection.trails") return "Starship Trails";
			if (key === "moduleSelection.figurines") return "Figurines";
			if (key === "moduleSelection.bonus") return "Bonus Modules";
			if (key === "moduleSelection.cosmetic") return "Cosmetic Modules";
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
		fireEvent.click(await screen.findByRole("checkbox", { name: "selectAll" }));
		await vi.waitFor(() => {
			expect(defaultProps.handleSelectAllChange).toHaveBeenCalled();
		});
	});

	it("disables the optimize button when no modules are checked", async () => {
		renderDialog({ currentCheckedModules: [] });
		const optimizeButton = await screen.findByRole("button", { name: "optimizeButton" });
		expect(optimizeButton).toBeDisabled();
	});

	it("calls handleOptimizeClick when the optimize button is clicked", async () => {
		renderDialog();
		const optimizeButton = await screen.findByRole("button", { name: "optimizeButton" });
		fireEvent.click(optimizeButton);
		await vi.waitFor(() => {
			expect(defaultProps.handleOptimizeClick).toHaveBeenCalled();
		});
	});
});
