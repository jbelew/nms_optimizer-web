import React from "react";
import { Theme } from "@radix-ui/themes";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import i18n from "@/test/i18n";

import { MainAppContent } from "./MainAppContent";

const { mockShowInfo } = vi.hoisted(() => ({
	mockShowInfo: vi.fn(),
}));

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

vi.mock("@/hooks/useToast/useToast", () => ({
	useToast: () => ({
		showError: vi.fn(),
		showInfo: mockShowInfo,
		showSuccess: vi.fn(),
	}),
}));

vi.mock("@/hooks/useUrlSync/useUrlSync", () => ({
	useUrlSync: () => ({
		updateUrlForReset: vi.fn(),
		updateUrlForShare: vi.fn(() => "http://test-share-url"),
	}),
}));

vi.mock("@/utils/system/dialogUtils", () => ({
	DialogContext: React.createContext(undefined),
	useDialog: () => ({
		closeDialog: vi.fn(),
		markTutorialFinished: vi.fn(),
		openDialog: vi.fn(),
		tutorialFinished: true,
	}),
}));

vi.mock("@/components/LanguageSelector/LanguageSelector", () => ({
	LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));
vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	useFetchTechTreeSuspense: vi.fn(() => ({ Weaponry: [] })),
}));
vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: vi.fn((selector) =>
		selector({
			_isGridFull: false,
			firstInactiveRowIndex: 0,
			grid: { cells: [], height: 0, width: 0 },
			hasModulesInGrid: false,
			isDefaultGrid: true,
			isGridFull: () => false,
			isSharedGrid: false,
			lastActiveRowIndex: -1,
			superchargedFixed: false,
		}),
	),
}));
vi.mock("@/store/app/platformStore", () => ({
	usePlatformsSuspense: vi.fn(() => ({})),
	usePlatformStore: vi.fn((selector) => selector({ selectedPlatform: "standard" })),
}));

describe("MainAppContent", () => {
	let isSharedGridState = false;
	let selectedPlatformState = "standard";

	beforeEach(() => {
		vi.clearAllMocks();
		isSharedGridState = false;
		selectedPlatformState = "standard";

		vi.mocked(useGridStore).mockImplementation(((selector: (state: unknown) => unknown) =>
			selector({
				_isGridFull: false,
				firstInactiveRowIndex: 0,
				grid: { cells: [], height: 0, width: 0 },
				hasModulesInGrid: false,
				isDefaultGrid: true,
				isGridFull: () => false,
				isSharedGrid: isSharedGridState,
				lastActiveRowIndex: -1,
				superchargedFixed: false,
			})) as typeof useGridStore);

		vi.mocked(usePlatformStore).mockImplementation(((selector: (state: unknown) => unknown) =>
			selector({ selectedPlatform: selectedPlatformState })) as typeof usePlatformStore);
	});

	const renderWorkspace = () =>
		render(
			<MemoryRouter>
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppContent />
					</Theme>
				</I18nextProvider>
			</MemoryRouter>,
		);

	it("renders the technology tree sidebar section on editable grids", () => {
		isSharedGridState = false;
		vi.mocked(useBreakpoint).mockReturnValue(true);

		const { container } = renderWorkspace();

		expect(container.querySelector(".main-app__tech-tree-section")).not.toBeNull();
		expect(mockShowInfo).not.toHaveBeenCalled();
	});

	it("hides the technology tree sidebar and displays an info toast when viewing a Shared Grid", () => {
		isSharedGridState = true;
		vi.mocked(useBreakpoint).mockReturnValue(true);

		const { container } = renderWorkspace();

		expect(container.querySelector(".main-app__tech-tree-section")).toBeNull();
		expect(mockShowInfo).toHaveBeenCalledWith(
			"Information",
			expect.objectContaining({
				props: expect.objectContaining({
					i18nKey: "mainApp.viewingSharedBuild",
				}),
			}),
		);
	});

	it("synchronously applies grid section height and table width on initial desktop mount to prevent CLS", () => {
		isSharedGridState = false;
		vi.mocked(useBreakpoint).mockReturnValue(true);

		const rectSpy = vi
			.spyOn(HTMLElement.prototype, "getBoundingClientRect")
			.mockImplementation(function (this: HTMLElement) {
				if (this.classList.contains("main-app__grid-section")) {
					return {
						bottom: 520,
						height: 520,
						left: 0,
						right: 744,
						toJSON: () => ({}),
						top: 0,
						width: 744,
						x: 0,
						y: 0,
					};
				}

				if (
					this.classList.contains("gridTable")
					|| this.classList.contains("gridTable-empty")
				) {
					return {
						bottom: 424,
						height: 424,
						left: 0,
						right: 744,
						toJSON: () => ({}),
						top: 0,
						width: 744,
						x: 0,
						y: 0,
					};
				}

				return {
					bottom: 0,
					height: 0,
					left: 0,
					right: 0,
					toJSON: () => ({}),
					top: 0,
					width: 0,
					x: 0,
					y: 0,
				};
			});

		try {
			const { container } = renderWorkspace();

			const techTreeSection = container.querySelector<HTMLElement>(
				".main-app__tech-tree-section",
			);
			const shipSelector = container.querySelector<HTMLElement>(".main-app__ship-selector");

			expect(techTreeSection?.style.height).toBe("520px");
			expect(shipSelector?.style.maxWidth).toBe("744px");
		} finally {
			rectSpy.mockRestore();
		}
	});
});
