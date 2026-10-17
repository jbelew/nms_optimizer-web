import React, { lazy, Suspense } from "react";
import { Flex } from "@radix-ui/themes";

import AppFooter from "@/components/AppFooter/AppFooter";
import AppHeader from "@/components/AppHeader/AppHeader";
import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";
import { TechTree, TechTreeSkeleton } from "@/components/TechTree/TechTree";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useIdleMount } from "@/hooks/useIdleMount/useIdleMount";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { build, getBuildDate } from "@/routeConfig";
import { useGridStore } from "@/store/grid/gridStore";
import { useUiStore } from "@/store/ui/uiStore";
import { useDialog } from "@/utils/system/dialogUtils";
import { lazyNamed } from "@/utils/system/lazyNamed";

import { MainAppGridSection } from "./MainAppGridSection";

const OptimizationAlertDialog = lazy(
	() => import("@/components/AppDialog/OptimizationAlert/OptimizationAlertDialog")
);
const ErrorMessageRenderer = lazyNamed(
	() => import("@/components/ErrorMessageRenderer/ErrorMessageRenderer"),
	"ErrorMessageRenderer"
);
const InstallPrompt = lazyNamed(
	() => import("@/components/InstallPrompt/InstallPrompt"),
	"InstallPrompt"
);
const ToastRenderer = lazyNamed(() => import("@/components/Toast/ToastRenderer"), "ToastRenderer");

/**
 * Inner component that triggers the ship types fetch via Suspense.
 *
 * @returns {null} Renders nothing once ship types resolve.
 *
 * @see {@link useFetchShipTypesSuspense}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Suspense fallback={null}>
 *   <ShipTypesLoader />
 * </Suspense>
 * ```
 */
export const ShipTypesLoader = () => {
	useFetchShipTypesSuspense();

	return null;
};

/**
 * Props for {@link MainAppBackgroundServices}.
 */
interface MainAppBackgroundServicesProps {
	/** Clears the current Pattern No Fit technology warning. */
	clearPatternNoFitTech: () => void;
	/** Re-runs optimization with forced solving for the current PNF technology. */
	handleForceCurrentPnfOptimize: () => Promise<void>;
	/** Technology key that triggered a Pattern No Fit warning, or null. */
	patternNoFitTech: null | string;
}

/**
 * Component that manages deferred background utilities.
 *
 * @param {MainAppBackgroundServicesProps} props - Component properties.
 *
 * @returns {JSX.Element | null} Deferred background services or null before idle mount.
 */
const MainAppBackgroundServices: React.FC<MainAppBackgroundServicesProps> = ({
	clearPatternNoFitTech,
	handleForceCurrentPnfOptimize,
	patternNoFitTech,
}) => {
	const mount = useIdleMount();

	if (!mount) return null;

	return (
		<Suspense fallback={null}>
			<InstallPrompt />
			<OptimizationAlertDialog
				isOpen={!!patternNoFitTech}
				onClose={clearPatternNoFitTech}
				onForceOptimize={handleForceCurrentPnfOptimize}
				technologyName={patternNoFitTech}
			/>
			<ErrorMessageRenderer />
			<ToastRenderer />
		</Suspense>
	);
};

/**
 * Component that renders the mobile toolbar on small screens.
 *
 * @returns {JSX.Element | null} The mobile toolbar on viewports under 640px, or null.
 */
const MainAppMobileToolbar: React.FC = () => {
	const isSmallScreen = !useBreakpoint("640px");

	if (!isSmallScreen) return null;

	return <MobileToolbar />;
};

/**
 * Component that renders the application header.
 *
 * @returns {JSX.Element} The rendered application header.
 *
 * @see {@link AppHeader}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppHeader />
 * ```
 */
export const MainAppHeader: React.FC = () => {
	const { openDialog } = useDialog();

	return <AppHeader onShowChangelog={() => openDialog("changelog")} />;
};

/**
 * Component that renders the application footer.
 *
 * @param {{ position: "bottom-desktop" | "bottom-mobile" }} props - Footer placement variant.
 *
 * @returns {JSX.Element | null} The rendered footer for the active breakpoint, or null.
 */
const MainAppFooter: React.FC<{ position: "bottom-desktop" | "bottom-mobile" }> = ({
	position,
}) => {
	const isLargeScreen = useBreakpoint("1024px");

	if (position === "bottom-mobile" && isLargeScreen) return null;
	if (position === "bottom-desktop" && !isLargeScreen) return null;

	return (
		<div className={position === "bottom-mobile" ? "main-app__footer-wrapper" : ""}>
			<AppFooter.Provider buildDate={getBuildDate()} buildVersion={build}>
				<AppFooter.Root>
					<AppFooter.Content />
					<AppFooter.Support />
				</AppFooter.Root>
			</AppFooter.Provider>
		</div>
	);
};

/**
 * Props for {@link MainAppSidebarSection}.
 */
interface MainAppSidebarSectionProps {
	/** Callback to trigger optimization for a technology key. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Flag indicating whether an optimization solve is in progress. */
	solving: boolean;
}

/**
 * Component that renders the technology tree section.
 *
 * @param {MainAppSidebarSectionProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The technology tree sidebar section, or null when viewing a shared grid.
 *
 * @see {@link TechTree}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppSidebarSection handleOptimize={handleOptimize} solving={false} />
 * ```
 */
export const MainAppSidebarSection: React.FC<MainAppSidebarSectionProps> = ({
	handleOptimize,
	solving,
}) => {
	const gridHeight = useUiStore((state) => state.gridSectionHeight);
	const gridTableTotalWidth = useUiStore((state) => state.gridTableWidth);
	const isLargeScreen = useBreakpoint("1024px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

	if (isSharedGrid) return null;

	return (
		<Flex
			className="main-app__tech-tree-section"
			direction="column"
			minHeight="0"
			ml={{ md: "5" }}
			mt="0"
			style={{
				height: isLargeScreen && gridHeight ? `${gridHeight}px` : undefined,
			}}
			width={!isLargeScreen && gridTableTotalWidth ? `${gridTableTotalWidth}px` : "100%"}
		>
			<Suspense fallback={<TechTreeSkeleton height={gridHeight} />}>
				<Flex direction="column" height="100%" minHeight="0">
					<TechTree handleOptimize={handleOptimize} solving={solving} />
				</Flex>
			</Suspense>
		</Flex>
	);
};

/**
 * Component that renders the application layout structure.
 *
 * @returns {JSX.Element} The rendered workspace layout.
 *
 * @see {@link MainAppGridSection}
 * @see {@link MainAppSidebarSection}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppLayoutContent />
 * ```
 */
export const MainAppLayoutContent = () => {
	const {
		clearPatternNoFitTech,
		gridContainerRef,
		handleForceCurrentPnfOptimize,
		handleOptimize,
		patternNoFitTech,
		solving,
	} = useOptimize();

	return (
		<>
			<MainAppMobileToolbar />

			<a
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-(--accent-9) focus:px-4 focus:py-2 focus:text-white"
				href="#main-content"
			>
				Skip to main content
			</a>
			<main className="main-app__container" id="main-content">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<MainAppHeader />

						<Flex
							align={{ initial: "center", md: "start" }}
							className="main-app__content"
							direction={{ initial: "column", md: "row" }}
							ref={gridContainerRef}
						>
							<MainAppGridSection />
							<MainAppSidebarSection
								handleOptimize={handleOptimize}
								solving={solving}
							/>
						</Flex>
					</div>

					<MainAppFooter position="bottom-mobile" />
				</div>

				<MainAppFooter position="bottom-desktop" />

				<MainAppBackgroundServices
					clearPatternNoFitTech={clearPatternNoFitTech}
					handleForceCurrentPnfOptimize={handleForceCurrentPnfOptimize}
					patternNoFitTech={patternNoFitTech}
				/>
			</main>
		</>
	);
};
