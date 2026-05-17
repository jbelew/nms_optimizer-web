import React, { lazy, Suspense, useEffect, useState } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppFooter from "@/components/AppFooter/AppFooter";
import AppHeader from "@/components/AppHeader/AppHeader";
import { GridTable } from "@/components/GridTable/GridTable";
import { LanguageSelector } from "@/components/LanguageSelector/languageSelector";
import { MessageSpinner } from "@/components/MessageSpinner/messageSpinner";
import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";
import { ShipSelection } from "@/components/ShipSelection/shipSelection";
import { TechTree, TechTreeSkeleton } from "@/components/TechTree/TechTree";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechTreeLoadingStore } from "@/store/tech/techTreeLoadingStore";

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

/**
 * Inner component that triggers the ship types fetch via Suspense.
 */
export const ShipTypesLoader = () => {
	useFetchShipTypesSuspense();

	return null;
};

/**
 * A notification component that appears when the user is viewing a read-only shared layout.
 */
const SharedBuildCallout: React.FC = () => {
	const { gridTableTotalWidth } = useMainAppLayout();

	return (
		<Box
			flexShrink="0"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
		>
			<Callout.Root mb="3" size="1" variant="surface">
				<Callout.Icon>
					<InfoCircledIcon />
				</Callout.Icon>
				<Callout.Text>
					<span className="text-sm sm:text-base" style={{ color: "var(--gray-12)" }}>
						<Trans i18nKey="mainApp.viewingSharedBuild" />
					</span>
				</Callout.Text>
			</Callout.Root>
		</Box>
	);
};

/**
 * A layout component that displays the current equipment platform and its selection control.
 */
const ShipSelectionHeading: React.FC = () => {
	const { t } = useTranslation();
	const { gridTableTotalWidth } = useMainAppLayout();
	const { isSharedGrid, selectedShipType } = useMainAppGlobal();
	const { solving } = useMainAppOptimization();

	return (
		<Flex
			align="center"
			className="main-app__ship-selector heading-styled"
			gap="3"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
			wrap="wrap"
		>
			{!isSharedGrid && (
				<span className="main-app__ship-selection">
					<Suspense fallback={<ShipSelection.Skeleton />}>
						<ShipSelection.Provider solving={solving}>
							<ShipSelection.Root>
								<ShipSelection.Trigger />
								<ShipSelection.Content />
							</ShipSelection.Root>
						</ShipSelection.Provider>
					</Suspense>
				</span>
			)}

			<Text
				className="main-app__ship-label"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t("platformLabel")}
			</Text>
			<Text
				className="main-app__ship-name trim-text"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t(`platforms.${selectedShipType}`)}
			</Text>
		</Flex>
	);
};

/**
 * Component that manages deferred background utilities.
 */
const MainAppBackgroundServices: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [mount, setMount] = useState(false);

	useEffect(() => {
		let handle: number | undefined;

		if ("requestIdleCallback" in window) {
			handle = window.requestIdleCallback(() => setMount(true), { timeout: 2000 });
		} else {
			handle = setTimeout(() => setMount(true), 1000) as unknown as number;
		}

		return () => {
			if (handle !== undefined) {
				if ("cancelIdleCallback" in window) {
					window.cancelIdleCallback(handle);
				} else {
					clearTimeout(handle);
				}
			}
		};
	}, []);

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
 * Component that renders the grid section.
 */
const MainAppGridSection: React.FC = () => {
	const { t } = useTranslation();
	const { containerRef, gridTableRef } = useMainAppLayout();
	const { isSharedGrid } = useMainAppGlobal();
	const { progressPercent, solving } = useMainAppOptimization();
	const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);
	const gridHeight = useGridStore((state) => state.grid.height);

	return (
		<Box
			className="main-app__grid-section relative"
			flexShrink={{ initial: "1", md: "0" }}
			ref={containerRef}
		>
			{isSharedGrid && <SharedBuildCallout />}

			{!isSharedGrid && (
				<MessageSpinner
					initialMessage={
						isTechTreeLoading ? t("techTree.loading") : t("gridTable.optimizing")
					}
					isVisible={solving}
					progressPercent={progressPercent}
					showProgress={!isTechTreeLoading}
				/>
			)}

			<ShipSelectionHeading />

			<GridTable.Provider gridRef={gridTableRef as React.RefObject<HTMLDivElement | null>}>
				<GridTable.Root>
					<GridTable.Grid
						gridHeight={gridHeight}
						gridRef={gridTableRef}
						solving={solving}
					>
						<GridTable.Content gridHeight={gridHeight} sharedGrid={isSharedGrid} />
					</GridTable.Grid>
					<GridTable.Buttons solving={solving} />
				</GridTable.Root>
			</GridTable.Provider>
		</Box>
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
		<TechTree.Provider
			handleOptimize={handleOptimize}
			isGridFull={isGridFull}
			solving={solving}
		>
			{isLargeScreen ? (
				<>
					<TechTree.Root hasRecommendedBuilds={hasRecommendedBuilds}>
						<TechTree.List techTree={techTree} />
					</TechTree.Root>
					<TechTree.Recommended techTree={techTree} />
				</>
			) : (
				<>
					<TechTree.Recommended techTree={techTree} />
					<TechTree.Root hasRecommendedBuilds={hasRecommendedBuilds}>
						<TechTree.List techTree={techTree} />
					</TechTree.Root>
				</>
			)}
		</TechTree.Provider>
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
