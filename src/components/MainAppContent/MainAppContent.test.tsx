import type { Mock } from "vitest";
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

vi.mock("@/hooks/useShipTypes/useShipTypes", () => ({
	useFetchShipTypesSuspense: vi.fn(() => ({})),
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
		})
	),
}));
vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: vi.fn((selector) => selector({ selectedPlatform: "standard" })),
}));

describe("MainAppContent", () => {
	let isSharedGridState = false;
	let selectedPlatformState = "standard";

	beforeEach(() => {
		vi.clearAllMocks();
		isSharedGridState = false;
		selectedPlatformState = "standard";

		(useGridStore as unknown as Mock).mockImplementation(
			(selector: (state: unknown) => unknown) =>
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
				})
		);

		(usePlatformStore as unknown as Mock).mockImplementation(
			(selector: (state: unknown) => unknown) =>
				selector({ selectedPlatform: selectedPlatformState })
		);
	});

	const renderWorkspace = () =>
		render(
			<MemoryRouter>
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppContent />
					</Theme>
				</I18nextProvider>
			</MemoryRouter>
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
			})
		);
	});
});
