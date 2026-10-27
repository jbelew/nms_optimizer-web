import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUiStore } from "./uiStore";

describe("useUiStore persistence", () => {
	beforeEach(() => {
		useUiStore.setState({
			a11yMode: false,
			appearance: "dark",
			isModuleSelectionDialogOpen: false,
			selectedTechData: null,
		});
		localStorage.clear();
	});

	it("skips redundant localStorage.setItem writes on ephemeral dialog and layout updates", () => {
		const setItemSpy = vi.spyOn(localStorage, "setItem");

		useUiStore.getState().openModuleSelectionDialog({
			tech: "pulse",
			techColor: "blue",
			techImage: "pulse.webp",
		});
		useUiStore.getState().closeModuleSelectionDialog();
		useUiStore.getState().setGridSectionHeight(640);
		useUiStore.getState().setSolving(true);
		useUiStore.getState().setProgressPercent(50);
		useUiStore.getState().setSolving(false);

		expect(setItemSpy).not.toHaveBeenCalled();

		useUiStore.getState().toggleA11yMode();
		expect(setItemSpy).toHaveBeenCalledTimes(1);

		setItemSpy.mockRestore();
	});
});
