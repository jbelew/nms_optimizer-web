import React, { Suspense } from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/test/i18n";

import { MainAppHeader, MainAppSidebarSection } from "./MainAppLayout";
import * as useMainAppContext from "./useMainAppContext";

// Mock the contexts
vi.mock("./useMainAppContext", () => ({
	useMainAppGlobal: vi.fn(),
	useMainAppLayout: vi.fn(),
	useMainAppOptimization: vi.fn(),
}));

// Mock the breakpoint hook
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
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
	useFetchTechTreeSuspense: vi.fn(() => ({})),
}));
vi.mock("@/store/grid/gridStore", () => ({
	useGridStore: vi.fn((selector) => selector({ _isGridFull: false, grid: { height: 10 } })),
}));

describe("MainAppLayout Visibility Logic", () => {
	const mockGlobalContext = {
		handleShowChangelog: vi.fn(),
		isLargeScreen: false,
		isSharedGrid: false,
		isSmallScreen: false,
		selectedShipType: "standard",
	};

	const mockLayoutContext = {
		gridTableTotalWidth: 800,
	};

	const mockOptimizationContext = {
		handleOptimize: vi.fn(),
		solving: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue(
			mockGlobalContext as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>
		);
		vi.mocked(useMainAppContext.useMainAppLayout).mockReturnValue(
			mockLayoutContext as unknown as ReturnType<typeof useMainAppContext.useMainAppLayout>
		);
		vi.mocked(useMainAppContext.useMainAppOptimization).mockReturnValue(
			mockOptimizationContext as unknown as ReturnType<
				typeof useMainAppContext.useMainAppOptimization
			>
		);
	});

	describe("MainAppHeader", () => {
		it("should render both left and right controls on Tablet (not small, not large)", () => {
			vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue({
				...mockGlobalContext,
				isLargeScreen: false,
				isSmallScreen: false,
			} as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>);

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
			vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue({
				...mockGlobalContext,
				isLargeScreen: true,
				isSmallScreen: false,
			} as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>);

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
			vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue({
				...mockGlobalContext,
				isLargeScreen: false,
				isSmallScreen: true,
			} as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>);

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
			vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue({
				...mockGlobalContext,
				isSharedGrid: false,
			} as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>);

			const { container } = render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<Suspense fallback={<div>Loading...</div>}>
							<MainAppSidebarSection />
						</Suspense>
					</Theme>
				</I18nextProvider>
			);

			expect(container.querySelector(".main-app__tech-tree-section")).not.toBeNull();
		});

		it("should hide the sidebar section on shared grids", () => {
			vi.mocked(useMainAppContext.useMainAppGlobal).mockReturnValue({
				...mockGlobalContext,
				isSharedGrid: true,
			} as unknown as ReturnType<typeof useMainAppContext.useMainAppGlobal>);

			const { container } = render(
				<I18nextProvider i18n={i18n}>
					<Theme>
						<MainAppSidebarSection />
					</Theme>
				</I18nextProvider>
			);

			expect(container.querySelector(".main-app__tech-tree-section")).toBeNull();
		});
	});
});
