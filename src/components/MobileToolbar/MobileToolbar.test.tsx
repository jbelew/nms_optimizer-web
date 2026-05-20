import React from "react";
import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/test/i18n";

import { MobileToolbar } from "./MobileToolbar";

// Mock hooks used in MobileToolbar
vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: vi.fn(),
	}),
}));

vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: vi.fn((selector) => selector({ isSharedGrid: false })),
}));

vi.mock("@/components/LanguageSelector/LanguageSelector", () => ({
	LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

vi.mock("@/store/ui/uiStore", () => ({
	useA11yStore: () => ({
		a11yMode: false,
		toggleA11yMode: vi.fn(),
	}),
}));

vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		openDialog: vi.fn(),
	}),
}));

vi.mock("@/hooks/useUrlSync/useUrlSync", () => ({
	useUrlSync: () => ({
		updateUrlForShare: vi.fn(() => "http://test-share-url"),
	}),
}));

describe("MobileToolbar", () => {
	const mockOnLoadBuild = vi.fn();
	const mockOnSaveBuild = vi.fn();
	const mockOnShowChangelog = vi.fn();
	const mockGridRef = { current: null };

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render load, save, share, changelog, stats, and accessibility buttons", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar
						gridRef={mockGridRef}
						hasModulesInGrid={true}
						isVisible={true}
						onLoadBuild={mockOnLoadBuild}
						onSaveBuild={mockOnSaveBuild}
						onShowChangelog={mockOnShowChangelog}
						solving={false}
					/>
				</Theme>
			</I18nextProvider>
		);

		// Verify buttons by their translation keys / aria-labels
		expect(screen.getByLabelText("buttons.loadBuild")).toBeDefined();
		expect(screen.getByLabelText("buttons.saveBuild")).toBeDefined();
		expect(screen.getByLabelText("buttons.share")).toBeDefined();
		expect(screen.getByLabelText("buttons.changelog")).toBeDefined();
		expect(screen.getByLabelText("buttons.userStats")).toBeDefined();
		expect(screen.getByLabelText("buttons.accessibility")).toBeDefined();
	});

	it("should call onLoadBuild when the load button is clicked", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar
						gridRef={mockGridRef}
						hasModulesInGrid={true}
						isVisible={true}
						onLoadBuild={mockOnLoadBuild}
						onSaveBuild={mockOnSaveBuild}
						onShowChangelog={mockOnShowChangelog}
						solving={false}
					/>
				</Theme>
			</I18nextProvider>
		);

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		fireEvent.click(loadButton);

		expect(mockOnLoadBuild).toHaveBeenCalledTimes(1);
	});

	it("should call onSaveBuild when the save button is clicked", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar
						gridRef={mockGridRef}
						hasModulesInGrid={true}
						isVisible={true}
						onLoadBuild={mockOnLoadBuild}
						onSaveBuild={mockOnSaveBuild}
						onShowChangelog={mockOnShowChangelog}
						solving={false}
					/>
				</Theme>
			</I18nextProvider>
		);

		const saveButton = screen.getByLabelText("buttons.saveBuild");
		fireEvent.click(saveButton);

		expect(mockOnSaveBuild).toHaveBeenCalledTimes(1);
	});

	it("should disable load and save buttons when solving is active", () => {
		render(
			<I18nextProvider i18n={i18n}>
				<Theme>
					<MobileToolbar
						gridRef={mockGridRef}
						hasModulesInGrid={true}
						isVisible={true}
						onLoadBuild={mockOnLoadBuild}
						onSaveBuild={mockOnSaveBuild}
						onShowChangelog={mockOnShowChangelog}
						solving={true}
					/>
				</Theme>
			</I18nextProvider>
		);

		const loadButton = screen.getByLabelText("buttons.loadBuild");
		const saveButton = screen.getByLabelText("buttons.saveBuild");

		expect(loadButton.hasAttribute("disabled")).toBe(true);
		expect(saveButton.hasAttribute("disabled")).toBe(true);
	});
});
