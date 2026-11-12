import React from "react";
import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerToolbarForceShow } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import i18n from "@/test/i18n";
import { sendDeferredEvent } from "@/utils/analytics/tracking";
import { DialogProvider } from "@/utils/system/dialogUtils";

import { MobileToolbar } from "./MobileToolbar";

const mockForceShow = vi.fn();
const mockHandleLoadBuild = vi.fn();
const mockHandleSaveBuild = vi.fn();
let solvingState = false;

// Mock hooks used in MobileToolbar
vi.mock("@/utils/analytics/tracking", () => ({
	sendDeferredEvent: vi.fn(),
	sendEvent: vi.fn(),
	syncAnalyticsPlatformProperty: vi.fn(),
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

const LocationDisplay = () => {
	const location = useLocation();

	return <div data-testid="router-location">{`${location.pathname}${location.search}`}</div>;
};

const renderToolbar = (initialEntry = "/") =>
	render(
		<I18nextProvider i18n={i18n}>
			<MemoryRouter initialEntries={[initialEntry]}>
				<DialogProvider>
					<Theme>
						<MobileToolbar />
						<LocationDisplay />
					</Theme>
				</DialogProvider>
			</MemoryRouter>
		</I18nextProvider>,
	);

describe("MobileToolbar", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		solvingState = false;
		await i18n.changeLanguage("en");
	});

	it("should register toolbar forceShow on mount", () => {
		renderToolbar();

		expect(registerToolbarForceShow).toHaveBeenCalledWith(mockForceShow);
	});

	it("should render load, save, share, changelog, stats, and accessibility buttons", () => {
		renderToolbar();

		// Verify buttons by their translation keys / aria-labels
		expect(screen.getByLabelText("buttons.loadBuild")).toBeDefined();
		expect(screen.getByLabelText("buttons.saveBuild")).toBeDefined();
		expect(screen.getByLabelText("buttons.share")).toBeDefined();
		expect(screen.getByLabelText("buttons.changelog")).toBeDefined();
		expect(screen.getByLabelText("buttons.userStats")).toBeDefined();
		expect(screen.getByLabelText("buttons.accessibility")).toBeDefined();
	});

	it("should call handleLoadBuild when the load button is clicked", () => {
		renderToolbar();

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		fireEvent.click(loadButton);

		expect(mockHandleLoadBuild).toHaveBeenCalledTimes(1);
	});

	it("should call handleSaveBuild when the save button is clicked", () => {
		renderToolbar();

		const saveButton = screen.getByLabelText("buttons.saveBuild");
		fireEvent.click(saveButton);

		expect(mockHandleSaveBuild).toHaveBeenCalledTimes(1);
	});

	it("should disable load and save buttons when solving is active", () => {
		solvingState = true;

		renderToolbar();

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		const saveButton = screen.getByLabelText("buttons.saveBuild");

		expect(loadButton.hasAttribute("disabled")).toBe(true);
		expect(saveButton.hasAttribute("disabled")).toBe(true);
	});

	it("should call handleLoadBuild when the child SVG icon of the load button is clicked", () => {
		renderToolbar();

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		const svg = loadButton.querySelector("svg");
		expect(svg).toBeInTheDocument();
		fireEvent.click(svg!);

		expect(mockHandleLoadBuild).toHaveBeenCalledTimes(1);
	});

	it("should emit unified share event when share button is clicked", () => {
		renderToolbar();

		const shareButton = screen.getByLabelText("buttons.share");
		fireEvent.click(shareButton);

		expect(sendDeferredEvent).toHaveBeenCalledWith({
			action: "share",
			category: "ui",
			method: "url",
			nonInteraction: false,
			platform: "standard",
		});
	});

	it("should emit focus_mode select_content event when Focus Mode button is clicked", () => {
		renderToolbar();

		const focusModeButton = screen.getByLabelText("buttons.accessibility");
		fireEvent.click(focusModeButton);

		expect(sendDeferredEvent).toHaveBeenCalledWith({
			action: "select_content",
			category: "ui",
			content_type: "focus_mode",
			item_id: "enabled",
			nonInteraction: false,
		});
	});

	it("renders Changelog and User Statistics as crawlable <a href> links with SPA primary click and native modifier click", async () => {
		await i18n.changeLanguage("fr");
		const { unmount } = renderToolbar("/fr/?platform=solar");

		try {
			const changelogLink = screen.getByRole("link", { name: "buttons.changelog" });
			const userStatsLink = screen.getByRole("link", { name: "buttons.userStats" });

			expect(changelogLink.tagName).toBe("A");
			expect(changelogLink).toHaveAttribute("href", "/fr/changelog/?platform=solar");
			expect(userStatsLink.tagName).toBe("A");
			expect(userStatsLink).toHaveAttribute("href", "/fr/userstats/?platform=solar");

			expect(fireEvent.click(changelogLink, { button: 0, metaKey: true })).toBe(true);
			expect(fireEvent.click(changelogLink, { button: 1 })).toBe(true);
			expect(screen.getByTestId("router-location")).toHaveTextContent("/fr/?platform=solar");

			expect(fireEvent.click(userStatsLink, { button: 0 })).toBe(false);
			expect(screen.getByTestId("router-location")).toHaveTextContent(
				"/fr/userstats/?platform=solar",
			);
		} finally {
			unmount();
			await i18n.changeLanguage("en");
		}
	});
});
