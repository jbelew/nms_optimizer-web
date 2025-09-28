import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dialog } from "@radix-ui/themes";
import { ModuleSelectionDialog } from "./index";
import { usePlatformStore } from "../../store/PlatformStore";

// Mocking external dependencies
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { techName?: string }) => {
			if (key === "moduleSelection.title") return `Modules for ${options?.techName}`;
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
	handleAllCheckboxesChange: vi.fn(),
};

const renderDialog = (props = {}) => {
	// @ts-ignore
	usePlatformStore.mockReturnValue("explorer");
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
		expect(screen.getByText("bonus")).toBeInTheDocument();
		expect(screen.getByText("Alpha Bonus")).toBeInTheDocument();
		expect(screen.getByText("upgrade")).toBeInTheDocument();
		expect(screen.getByText("cosmetic")).toBeInTheDocument();
	});

	it("sorts 'bonus' modules alphabetically", () => {
		renderDialog();
		const bonusModules = screen.getByText("bonus").parentElement?.querySelectorAll("label");
		expect(bonusModules).not.toBeNull();
		// @ts-ignore
		expect(bonusModules[0]).toHaveTextContent("Alpha Bonus");
		// @ts-ignore
		expect(bonusModules[1]).toHaveTextContent("Beta Bonus");
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

	it("calls handleAllCheckboxesChange with initial state on cancel", () => {
		renderDialog();
		const cancelButton = screen.getByRole("button", { name: /cancelButton/i });
		fireEvent.click(cancelButton);
		expect(defaultProps.handleAllCheckboxesChange).toHaveBeenCalledWith(
			defaultProps.currentCheckedModules
		);
	});
});