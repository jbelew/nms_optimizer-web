import React, { lazy, Suspense } from "react";
import { Flex } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import AppFooter from "@/components/AppFooter/AppFooter";
import AppHeader from "@/components/AppHeader/AppHeader";
import { LanguageSelector } from "@/components/LanguageSelector/languageSelector";
import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";
import {
	TechTreeList,
	TechTreeProvider,
	TechTreeRecommended,
	TechTreeRoot,
	TechTreeSkeleton,
} from "@/components/TechTree/TechTree";
import { useIdleMount } from "@/hooks/useIdleMount/useIdleMount";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { useGridStore } from "@/store/grid/gridStore";

import { MainAppGridSection } from "./MainAppGridSection";
import {
	useMainAppBuildManagement,
	useMainAppGlobal,
	useMainAppLayout,
	useMainAppOptimization,
} from "./useMainAppContext";

const BuildNameDialog = lazy(() => import("@/components/AppDialog/BuildName/BuildNameDialog"));
const OptimizationAlertDialog = lazy(
	() => import("@/components/AppDialog/OptimizationAlert/OptimizationAlertDialog")
);
const ErrorMessageRenderer = lazy(() =>
	import("@/components/ErrorMessageRenderer/ErrorMessageRenderer").then((m) => ({
		default: m.ErrorMessageRenderer,
	}))
);
const InstallPrompt = lazy(() =>
	import("@/components/InstallPrompt/InstallPrompt").then((m) => ({ default: m.InstallPrompt }))
);
const ToastRenderer = lazy(() =>
	import("@/components/Toast/ToastRenderer").then((m) => ({ default: m.ToastRenderer }))
);
const SharedModuleSelectionDialog = lazy(() =>
	import("@/components/ModuleSelectionDialog/SharedModuleSelectionDialog").then((m) => ({
		default: m.SharedModuleSelectionDialog,
	}))
);

/**
 * Inner component that triggers the ship types fetch via Suspense.
 */
export const ShipTypesLoader = () => {
	useFetchShipTypesSuspense();

	return null;
};

/**
 * Component that manages deferred background utilities.
 */
const MainAppBackgroundServices: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const mount = useIdleMount();

	if (!mount) return null;

	return <Suspense fallback={null}>{children}</Suspense>;
};

/**
 * Optimization alert utility.
 */
const OptimizationAlertUtility: React.FC = () => {
	const { clearPatternNoFitTech, handleForceCurrentPnfOptimize, patternNoFitTech } =
		useMainAppOptimization();

	return (
		<Suspense fallback={null}>
			<OptimizationAlertDialog
				isOpen={!!patternNoFitTech}
				onClose={clearPatternNoFitTech}
				onForceOptimize={handleForceCurrentPnfOptimize}
				technologyName={patternNoFitTech}
			/>
		</Suspense>
	);
};

/**
 * Build naming utility.
 */
const BuildNameUtility: React.FC = () => {
	const { saveBuild } = useMainAppBuildManagement();
	const { handleBuildNameCancel, handleBuildNameConfirm, isSaveBuildDialogOpen } = saveBuild;

	return (
		<Suspense fallback={null}>
			<BuildNameDialog
				isOpen={isSaveBuildDialogOpen}
				onCancel={handleBuildNameCancel}
				onConfirm={handleBuildNameConfirm}
			/>
		</Suspense>
	);
};

/**
 * File picker utility for loading builds.
 */
const FilePickerUtility: React.FC = () => {
	const { t } = useTranslation();
	const { loadBuild } = useMainAppBuildManagement();
	const { fileInputRef, handleFileSelect } = loadBuild;

	return (
		<input
			accept=".nms"
			aria-label={t("buttons.loadBuild")}
			className="hidden"
			onChange={handleFileSelect}
			ref={fileInputRef}
			type="file"
		/>
	);
};

/**
 * Component that renders the mobile toolbar.
 */
const MainAppMobileToolbar: React.FC = () => {
	const { containerRef } = useMainAppLayout();
	const { handleShowChangelog, hasModulesInGrid, isSmallScreen, isVisible, toolbarRef } =
		useMainAppGlobal();
	const { loadBuild, saveBuild } = useMainAppBuildManagement();
	const { solving } = useMainAppOptimization();

	if (!isSmallScreen) return null;

	return (
		<MobileToolbar
			gridRef={containerRef}
			hasModulesInGrid={hasModulesInGrid}
			isVisible={isVisible}
			onLoadBuild={loadBuild.handleLoadBuild}
			onSaveBuild={saveBuild.handleSaveBuild}
			onShowChangelog={handleShowChangelog}
			ref={toolbarRef as React.Ref<HTMLDivElement>}
			solving={solving}
		/>
	);
};

/**
 * Component that renders the application header.
 */
export const MainAppHeader: React.FC = () => {
	const { handleShowChangelog, isLargeScreen, isSharedGrid, isSmallScreen } = useMainAppGlobal();

	return (
		<AppHeader.Provider onShowChangelog={handleShowChangelog}>
			<AppHeader.Root>
				{!isSharedGrid && !isLargeScreen && !isSmallScreen && (
					<AppHeader.LeftControls>
						<AppHeader.AccessibilityToggle />
					</AppHeader.LeftControls>
				)}

				{!isSharedGrid && !isSmallScreen && (
					<AppHeader.RightControls>
						<AppHeader.ChangelogButton />
						<AppHeader.UserStatsButton />
						<AppHeader.PerformanceButton />
						{isLargeScreen && <AppHeader.AccessibilityToggle />}
						<LanguageSelector />
					</AppHeader.RightControls>
				)}

				<AppHeader.LogoText />
				<AppHeader.Logo />
				<AppHeader.Subtitle />
			</AppHeader.Root>
		</AppHeader.Provider>
	);
};

/**
 * Component that renders the application footer.
 */
const MainAppFooter: React.FC<{ position: "bottom-desktop" | "bottom-mobile" }> = ({
	position,
}) => {
	const { buildDate, buildVersion, isLargeScreen } = useMainAppGlobal();

	if (position === "bottom-mobile" && isLargeScreen) return null;
	if (position === "bottom-desktop" && !isLargeScreen) return null;

	return (
		<div className={position === "bottom-mobile" ? "main-app__footer-wrapper" : ""}>
			<AppFooter.Provider buildDate={buildDate} buildVersion={buildVersion}>
				<AppFooter.Root>
					<AppFooter.Content />
					<AppFooter.Support />
				</AppFooter.Root>
			</AppFooter.Provider>
		</div>
	);
};

/**
 * Inner component that renders the tech tree list/recommended builds.
 */
const MainAppSidebarContent: React.FC = () => {
	const { isLargeScreen, selectedShipType } = useMainAppGlobal();
	const { handleOptimize, solving } = useMainAppOptimization();
	const techTree = useFetchTechTreeSuspense(selectedShipType);
	const isGridFull = useGridStore((state) => state._isGridFull);

	const hasRecommendedBuilds =
		!!techTree?.recommended_builds && techTree.recommended_builds.length > 0;

	return (
		<TechTreeProvider handleOptimize={handleOptimize} isGridFull={isGridFull} solving={solving}>
			{isLargeScreen ? (
				<>
					<TechTreeRoot hasRecommendedBuilds={hasRecommendedBuilds}>
						<TechTreeList techTree={techTree} />
					</TechTreeRoot>
					<TechTreeRecommended techTree={techTree} />
				</>
			) : (
				<>
					<TechTreeRecommended techTree={techTree} />
					<TechTreeRoot hasRecommendedBuilds={hasRecommendedBuilds}>
						<TechTreeList techTree={techTree} />
					</TechTreeRoot>
				</>
			)}
			<Suspense fallback={null}>
				<SharedModuleSelectionDialog />
			</Suspense>
		</TechTreeProvider>
	);
};

/**
 * Component that renders the technology tree section.
 */
export const MainAppSidebarSection: React.FC = () => {
	const { gridTableTotalWidth } = useMainAppLayout();
	const { isLargeScreen, isSharedGrid } = useMainAppGlobal();

	if (isSharedGrid) return null;

	return (
		<Flex
			className="main-app__tech-tree-section"
			direction="column"
			ml={{ md: "5" }}
			mt={{ initial: "4", md: "0" }}
			width={!isLargeScreen && gridTableTotalWidth ? `${gridTableTotalWidth}px` : "100%"}
		>
			<Suspense fallback={<TechTreeSkeleton />}>
				<MainAppSidebarContent />
			</Suspense>
		</Flex>
	);
};

/**
 * Component that renders the application layout structure.
 */
export const MainAppLayoutContent = () => {
	const { gridContainerRef } = useMainAppOptimization();

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
							<MainAppSidebarSection />
						</Flex>
					</div>

					<MainAppFooter position="bottom-mobile" />
				</div>

				<MainAppFooter position="bottom-desktop" />

				<MainAppBackgroundServices>
					<InstallPrompt />
					<OptimizationAlertUtility />
					<BuildNameUtility />
					<FilePickerUtility />
					<ErrorMessageRenderer />
					<ToastRenderer />
				</MainAppBackgroundServices>
			</main>
		</>
	);
};
