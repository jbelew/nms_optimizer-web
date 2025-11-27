import React from "react";
import { Dialog } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { usePlatformStore } from "../../store/PlatformStore";
import { ModuleSelectionDialog } from "./index";

// Mocking external dependencies
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { techName?: string }) => {
			if (key === "moduleSelection.title") return `Modules for ${options?.techName}`;
			if (key === "moduleSelection.trails") return "Starship Trails";
			if (key === "moduleSelection.figurines") return "Figurines";
			if (key === "moduleSelection.bonus") return "Bonus Modules";
			if (key === "moduleSelection.cosmetic") return "Cosmetic Modules";
			if (key.startsWith("moduleSelection.")) return key.split(".")[1];
			return key;
		},
	}),
}));

vi.mock("../../store/PlatformStore");

const mockGroupedModules = {
	core: [{ id: "core1", label: "Core Module", image: "core.png" }],
	bonus: [
		{ id: "bonus2", label: "Beta Bonus", image: "bonus.png" },
		{ id: "bonus1", label: "Alpha Bonus", image: "bonus.png" },
	],
	upgrade: [
		{ id: "upgrade_sigma", label: "Upgrade Sigma", image: "upgrade.png" },
		{ id: "upgrade_tau", label: "Upgrade Tau", image: "upgrade.png" },
	],
	cosmetic: [{ id: "cosmetic1", label: "Cosmetic Module", image: "cosmetic.png" }],
	atlantid: [],
	reactor: [],
};

const defaultProps = {
	translatedTechName: "Hyperdrive",
	groupedModules: mockGroupedModules,
	currentCheckedModules: ["bonus1", "upgrade_tau"],
	handleValueChange: vi.fn(),
	handleSelectAllChange: vi.fn(),
	handleOptimizeClick: vi.fn(),
	allModulesSelected: false,
	isIndeterminate: true,
	techColor: "blue" as const,
	techImage: "hyperdrive.png",
};

const renderDialog = (props = {}) => {
	(usePlatformStore as unknown as Mock).mockReturnValue({
		selectedPlatform: "explorer",
	});
	return render(
		<Dialog.Root open={true}>
			<ModuleSelectionDialog {...defaultProps} {...props} />
		</Dialog.Root>
	);
};

describe("ModuleSelectionDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the dialog with the correct title", () => {
		renderDialog();
		expect(screen.getByText("Modules for Hyperdrive")).toBeInTheDocument();
	});

	it("renders module groups correctly", () => {
		renderDialog();
		expect(screen.getByText("Bonus Modules")).toBeInTheDocument();
		expect(screen.getByText("Alpha Bonus")).toBeInTheDocument();
		expect(screen.getByText("upgrade")).toBeInTheDocument();
		expect(screen.getByText("Cosmetic Modules")).toBeInTheDocument();
	});

	it("sorts 'bonus' modules alphabetically", () => {
		renderDialog();
		const bonusModules = screen
			.getByText("Bonus Modules")
			.parentElement?.querySelectorAll("label");
		expect(bonusModules).not.toBeNull();
		expect(bonusModules![0]).toHaveTextContent("Alpha Bonus");
		expect(bonusModules![1]).toHaveTextContent("Beta Bonus");
	});

	it("sorts 'trails' and 'figurines' modules alphabetically", () => {
		const props = {
			...defaultProps,
			groupedModules: {
				...mockGroupedModules,
				trails: [
					{ id: "trail2", label: "Beta Trail", image: "trail.png" },
					{ id: "trail1", label: "Alpha Trail", image: "trail.png" },
				],
				figurines: [
					{ id: "fig2", label: "Beta Figurine", image: "fig.png" },
					{ id: "fig1", label: "Alpha Figurine", image: "fig.png" },
				],
			},
		};
		renderDialog(props);

		const trailModules = screen
			.getByText("Starship Trails")
			.parentElement?.querySelectorAll("label");
		expect(trailModules![0]).toHaveTextContent("Alpha Trail");
		expect(trailModules![1]).toHaveTextContent("Beta Trail");

		const figModules = screen.getByText("Figurines").parentElement?.querySelectorAll("label");
		expect(figModules![0]).toHaveTextContent("Alpha Figurine");
		expect(figModules![1]).toHaveTextContent("Beta Figurine");
	});

	it("disables an upgrade module if its prerequisite is not selected", () => {
		// Prerequisite 'upgrade_tau' is not included in currentCheckedModules
		renderDialog({ currentCheckedModules: ["bonus1"] });
		// Radix checkboxes are buttons with a role of checkbox
		const sigmaCheckbox = screen.getByRole("checkbox", { name: "Upgrade Sigma" });
		expect(sigmaCheckbox).toBeDisabled();
	});

	it("enables an upgrade module if its prerequisite is selected", () => {
		// Prerequisite 'upgrade_tau' is included
		renderDialog({ currentCheckedModules: ["bonus1", "upgrade_tau"] });
		const sigmaCheckbox = screen.getByRole("checkbox", { name: "Upgrade Sigma" });
		expect(sigmaCheckbox).not.toBeDisabled();
	});

	it("renames 'bonus' group to 'Starship Trails' when tech is 'trails'", () => {
		renderDialog({ tech: "trails" });
		expect(screen.getByText("Starship Trails")).toBeInTheDocument();
		expect(screen.queryByText("bonus")).not.toBeInTheDocument();
	});

	it("does not rename 'bonus' group when tech is not 'trails'", () => {
		renderDialog({ tech: "hyperdrive" });
		expect(screen.getByText("Bonus Modules")).toBeInTheDocument();
		expect(screen.queryByText("Starship Trails")).not.toBeInTheDocument();
	});

	it("calls handleValueChange when a checkbox is clicked", () => {
		renderDialog();
		// CheckboxGroup.Item is a button inside the label
		fireEvent.click(screen.getByRole("checkbox", { name: "Alpha Bonus" }));
		// The CheckboxGroup.Root `onValueChange` is called with the new array of values.
		// "Alpha Bonus" (id: bonus1) was checked, so clicking unchecks it.
		// The new array should not contain "bonus1".
		expect(defaultProps.handleValueChange).toHaveBeenCalledWith(["upgrade_tau"]);
	});

	it("calls handleSelectAllChange when 'Select All' is clicked", () => {
		renderDialog();
		fireEvent.click(screen.getByRole("checkbox", { name: "selectAll" }));
		expect(defaultProps.handleSelectAllChange).toHaveBeenCalledWith(true);
	});

	it("disables the optimize button when no modules are checked", () => {
		renderDialog({ currentCheckedModules: [] });
		const optimizeButton = screen.getByRole("button", { name: /optimizeButton/i });
		expect(optimizeButton).toBeDisabled();
	});

	it("calls handleOptimizeClick when the optimize button is clicked", () => {
		renderDialog();
		const optimizeButton = screen.getByRole("button", { name: /optimizeButton/i });
		fireEvent.click(optimizeButton);
		expect(defaultProps.handleOptimizeClick).toHaveBeenCalled();
	});
});
