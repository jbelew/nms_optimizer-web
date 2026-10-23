import React from "react";
import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerToolbarForceShow } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import i18n from "@/test/i18n";

import { MobileToolbar } from "./MobileToolbar";

const mockForceShow = vi.fn();
const mockHandleLoadBuild = vi.fn();
const mockHandleSaveBuild = vi.fn();
const mockOpenDialog = vi.fn();
const mockSendDeferredEvent = vi.fn();
let solvingState = false;

// Mock hooks used in MobileToolbar
vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: mockSendDeferredEvent,
	}),
}));

vi.mock("@/hooks/useScrollGridIntoView/useScrollGridIntoView", () => ({
	registerToolbarForceShow: vi.fn(),
}));

vi.mock("@/hooks/useScrollHide/useScrollHide", () => ({
	useScrollHide: () => ({
		forceShow: mockForceShow,
		isVisible: true,
		toolbarRef: { current: null },
	}),
}));

vi.mock("@/hooks/useBuildFileManager/useBuildFileManager", () => ({
	useBuildFileManager: () => ({
		fileInputRef: { current: null },
		handleBuildNameCancel: vi.fn(),
		handleBuildNameConfirm: vi.fn(),
		handleFileSelect: vi.fn(),
		handleLoadBuild: mockHandleLoadBuild,
		handleSaveBuild: mockHandleSaveBuild,
		isLoadPending: false,
		isSaveBuildDialogOpen: false,
		isSavePending: false,
	}),
}));

vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: Object.assign(
		vi.fn((selector) => selector({ hasModulesInGrid: true, isSharedGrid: false })),
		{
			getState: () => ({ grid: { cells: [], height: 6, width: 10 } }),
		},
	),
}));

vi.mock("@/components/LanguageSelector/LanguageSelector", () => ({
	LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

vi.mock("@/store/ui/uiStore", () => ({
	useA11yStore: () => ({
		a11yMode: false,
		toggleA11yMode: vi.fn(),
	}),
	useOptimizeStore: vi.fn((selector) =>
		selector({ status: solvingState ? { progress: 0, type: "solving" } : { type: "idle" } }),
	),
}));

vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		openDialog: mockOpenDialog,
	}),
}));

describe("MobileToolbar", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		solvingState = false;
	});

	it("should register toolbar forceShow on mount", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		expect(registerToolbarForceShow).toHaveBeenCalledWith(mockForceShow);
	});

	it("should render load, save, share, changelog, stats, and accessibility buttons", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		// Verify buttons by their translation keys / aria-labels
		expect(screen.getByLabelText("buttons.loadBuild")).toBeDefined();
		expect(screen.getByLabelText("buttons.saveBuild")).toBeDefined();
		expect(screen.getByLabelText("buttons.share")).toBeDefined();
		expect(screen.getByLabelText("buttons.changelog")).toBeDefined();
		expect(screen.getByLabelText("buttons.userStats")).toBeDefined();
		expect(screen.getByLabelText("buttons.accessibility")).toBeDefined();
	});

	it("should call handleLoadBuild when the load button is clicked", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		fireEvent.click(loadButton);

		expect(mockHandleLoadBuild).toHaveBeenCalledTimes(1);
	});

	it("should call handleSaveBuild when the save button is clicked", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		const saveButton = screen.getByLabelText("buttons.saveBuild");
		fireEvent.click(saveButton);

		expect(mockHandleSaveBuild).toHaveBeenCalledTimes(1);
	});

	it("should disable load and save buttons when solving is active", () => {
		solvingState = true;

		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		const saveButton = screen.getByLabelText("buttons.saveBuild");

		expect(loadButton.hasAttribute("disabled")).toBe(true);
		expect(saveButton.hasAttribute("disabled")).toBe(true);
	});

	it("should call handleLoadBuild when the child SVG icon of the load button is clicked", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		const svg = loadButton.querySelector("svg");
		expect(svg).toBeInTheDocument();
		fireEvent.click(svg!);

		expect(mockHandleLoadBuild).toHaveBeenCalledTimes(1);
	});

	it("should emit unified share event when share button is clicked", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar />
				</Theme>
			</I18nextProvider>,
		);

		const shareButton = screen.getByLabelText("buttons.share");
		fireEvent.click(shareButton);

		expect(mockSendDeferredEvent).toHaveBeenCalledWith({
			action: "share",
			category: "ui",
			method: "url",
			nonInteraction: false,
			platform: "standard",
			value: 1,
		});
	});
});
