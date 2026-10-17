import type { Mock } from "vitest";
import React, { Suspense } from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useSessionStore } from "@/store/ui/uiStore";
import i18n from "@/test/i18n";

import { MainAppContent } from "./MainAppContent";
import { MainAppHeader, MainAppSidebarSection } from "./MainAppLayout";

const { mockResetSession, mockShowInfo } = vi.hoisted(() => ({
	mockResetSession: vi.fn(),
	mockShowInfo: vi.fn(),
}));

// Mock the breakpoint hook
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

vi.mock("@/hooks/useErrorDispatcher", () => ({
	useErrorDispatcher: vi.fn(),
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

// Mock useDialog since AppHeaderProvider uses it
vi.mock("@/utils/system/dialogUtils", () => ({
	DialogContext: React.createContext(undefined),
	useDialog: () => ({
		closeDialog: vi.fn(),
		markTutorialFinished: vi.fn(),
		openDialog: vi.fn(),
		tutorialFinished: true,
	}),
}));

// Mock components that might suspend or are not relevant to visibility logic
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

describe("MainAppLayout Visibility & Lifecycle Logic", () => {
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

		useSessionStore.setState({ resetSession: mockResetSession });
	});

	describe("MainAppHeader", () => {
		it("should render both left and right controls on Tablet (not small, not large)", () => {
			vi.mocked(useBreakpoint).mockImplementation((bp: string) => bp === "640px");

			render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppHeader />
					</Theme>
				</I18nextProvider>
			);

			// Radix Switch has role="switch" for accessibility toggle
			expect(screen.getByRole("switch")).toBeDefined();
			// Changelog button by aria-label
			expect(screen.getByLabelText(/changelog/i)).toBeDefined();
		});

		it("should hide left controls and keep right controls on Desktop (large screen)", () => {
			vi.mocked(useBreakpoint).mockImplementation(
				(bp: string) => bp === "640px" || bp === "1024px"
			);

			render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppHeader />
					</Theme>
				</I18nextProvider>
			);

			// Right controls (Accessibility Toggle moves to right side on LG)
			expect(screen.getByRole("switch")).toBeDefined();
			expect(screen.getByLabelText(/changelog/i)).toBeDefined();
		});

		it("should hide both control sections on Mobile (small screen)", () => {
			vi.mocked(useBreakpoint).mockReturnValue(false);

			render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppHeader />
					</Theme>
				</I18nextProvider>
			);

			// Both left and right controls should be absent
			expect(screen.queryByRole("switch")).toBeNull();
			expect(screen.queryByLabelText(/changelog/i)).toBeNull();
		});
	});

	describe("MainAppSidebarSection", () => {
		it("should render the sidebar section on non-shared grids", () => {
			isSharedGridState = false;
			vi.mocked(useBreakpoint).mockReturnValue(true);

			const { container } = render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<Suspense fallback={<div>Loading...</div>}>
							<MainAppSidebarSection handleOptimize={vi.fn()} solving={false} />
						</Suspense>
					</Theme>
				</I18nextProvider>
			);

			expect(container.querySelector(".main-app__tech-tree-section")).not.toBeNull();
		});

		it("should hide the sidebar section on shared grids", () => {
			isSharedGridState = true;
			vi.mocked(useBreakpoint).mockReturnValue(true);

			const { container } = render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppSidebarSection handleOptimize={vi.fn()} solving={false} />
					</Theme>
				</I18nextProvider>
			);

			expect(container.querySelector(".main-app__tech-tree-section")).toBeNull();
		});
	});

	describe("MainAppContent Lifecycle", () => {
		it("should reset session when platform changes", () => {
			vi.mocked(useBreakpoint).mockReturnValue(true);

			const { rerender } = render(
				<MemoryRouter>
					<I18nextProvider i18n={i18n}>
						<Theme>
							<MainAppContent />
						</Theme>
					</I18nextProvider>
				</MemoryRouter>
			);

			expect(mockResetSession).toHaveBeenCalledTimes(1);

			selectedPlatformState = "corvette";
			rerender(
				<MemoryRouter>
					<I18nextProvider i18n={i18n}>
						<Theme>
							<MainAppContent />
						</Theme>
					</I18nextProvider>
				</MemoryRouter>
			);

			expect(mockResetSession).toHaveBeenCalledTimes(2);
		});

		it("should show info toast when viewing a shared grid", () => {
			isSharedGridState = true;
			vi.mocked(useBreakpoint).mockReturnValue(true);

			render(
				<MemoryRouter>
					<I18nextProvider i18n={i18n}>
						<Theme>
							<MainAppContent />
						</Theme>
					</I18nextProvider>
				</MemoryRouter>
			);

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
});
