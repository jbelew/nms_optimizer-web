// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import React, { lazy, Suspense } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";

import { useFetchShipTypesSuspense } from "../../hooks/useShipTypes/useShipTypes";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { retryImport } from "../../utils/dynamicImport";
import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import { TechTreeSkeleton } from "../TechTree/TechTreeSkeleton";
import { MainAppUtilities } from "./MainAppUtilities";
import { SharedBuildCallout } from "./SharedBuildCallout";
import { ShipSelectionHeading } from "./ShipSelectionHeading";
import { useMainAppLogic } from "./useMainAppLogic";

const TechTreeComponent = lazy(() => retryImport(() => import("../TechTree/TechTree")));

/**
 * Inner component that triggers the ship types fetch via Suspense.
 *
 * This allows the parent `MainAppContent` to render the header and other
 * static elements immediately, while only this part of the UI is suspended.
 *
 * @returns {null}
 */
const ShipTypesLoader = () => {
	useFetchShipTypesSuspense();

	return null;
};

/**
 * The primary layout component for the application's main functional area.
 *
 * It orchestrates the rendering of the technology grid, the technology tree,
 * global headers/footers, and various UI overlays (spinners, callouts, toolbars).
 * It uses a custom hook, `useMainAppLogic`, to encapsulate state management and
 * event handling.
 *
 * @returns {JSX.Element} The root application layout structure.
 *
 * @example
 * <MainAppContent />
 */
export const MainAppContent = () => {
	const { t } = useTranslation();
	const {
		buildVersion,
		buildDate,
		isSmallScreen,
		isLargeScreen,
		isSharedGrid,
		hasModulesInGrid,
		selectedShipType,
		isVisible,
		toolbarRef,
		optimize,
		appLayout,
		saveBuild,
		loadBuild,
		handleShowChangelog,
	} = useMainAppLogic();

	const {
		solving,
		progressPercent,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	} = optimize;

	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridTableTotalWidth,
	} = appLayout;

	const {
		isSaveBuildDialogOpen,
		handleSaveBuild,
		handleBuildNameConfirm,
		handleBuildNameCancel,
	} = saveBuild;

	const { fileInputRef, handleLoadBuild, handleFileSelect } = loadBuild;

	const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);

	return (
		<>
			{isSmallScreen && (
				<MobileToolbar
					ref={toolbarRef as React.Ref<HTMLDivElement>}
					isVisible={isVisible}
					solving={solving}
					hasModulesInGrid={hasModulesInGrid}
					onLoadBuild={handleLoadBuild}
					onSaveBuild={handleSaveBuild}
					onShowChangelog={handleShowChangelog}
				/>
			)}

			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-(--accent-9) focus:px-4 focus:py-2 focus:text-white"
			>
				Skip to main content
			</a>
			<main id="main-content" className="main-app__container">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<AppHeader onShowChangelog={handleShowChangelog} />

						<Suspense
							fallback={
								<Flex
									align="center"
									justify="center"
									className="main-app__content"
									style={{ minHeight: "400px", width: "100%" }}
								>
									<MessageSpinner
										isVisible={true}
										initialMessage={t("techTree.loading")}
									/>
								</Flex>
							}
						>
							<ShipTypesLoader />
							<Flex
								direction={{ initial: "column", md: "row" }}
								align={{ initial: "center", md: "start" }}
								className="main-app__content"
								ref={gridContainerRef}
							>
								{/* Grid section */}
								<Box
									flexShrink={{ initial: "1", md: "0" }}
									className="main-app__grid-section relative"
									ref={appLayoutContainerRef}
								>
									{isSharedGrid && (
										<SharedBuildCallout
											gridTableTotalWidth={gridTableTotalWidth}
										/>
									)}

									{!isSharedGrid && (
										<MessageSpinner
											// isVisible={solving || (!isLargeScreen && isTechTreeLoading)}
											isVisible={solving}
											showProgress={!isTechTreeLoading}
											initialMessage={
												isTechTreeLoading
													? t("techTree.loading")
													: t("gridTable.optimizing")
											}
											progressPercent={progressPercent}
										/>
									)}

									<ShipSelectionHeading
										isSharedGrid={isSharedGrid}
										solving={solving}
										selectedShipType={selectedShipType}
										gridTableTotalWidth={gridTableTotalWidth}
									/>

									<GridTable
										solving={solving}
										sharedGrid={isSharedGrid}
										ref={appLayoutGridTableRef}
									/>
								</Box>

								{/* Tech tree section */}
								{!isSharedGrid && (
									<Flex
										direction="column"
										width={
											!isLargeScreen && gridTableTotalWidth
												? `${gridTableTotalWidth}px`
												: "100%"
										}
										ml={{ md: "5" }}
										className="main-app__tech-tree-section"
									>
										<Suspense fallback={<TechTreeSkeleton />}>
											<TechTreeComponent
												handleOptimize={handleOptimize}
												solving={solving}
												gridTableTotalWidth={gridTableTotalWidth}
											/>
										</Suspense>
									</Flex>
								)}
							</Flex>
						</Suspense>
					</div>

					{!isLargeScreen && (
						<div className="main-app__footer-wrapper">
							<AppFooter buildVersion={buildVersion} buildDate={buildDate} />
						</div>
					)}
				</div>

				{isLargeScreen && <AppFooter buildVersion={buildVersion} buildDate={buildDate} />}

				<MainAppUtilities
					patternNoFitTech={patternNoFitTech}
					clearPatternNoFitTech={clearPatternNoFitTech}
					handleForceCurrentPnfOptimize={handleForceCurrentPnfOptimize}
					isSaveBuildDialogOpen={isSaveBuildDialogOpen}
					handleBuildNameConfirm={handleBuildNameConfirm}
					handleBuildNameCancel={handleBuildNameCancel}
					fileInputRef={fileInputRef}
					handleFileSelect={handleFileSelect}
				/>
			</main>
		</>
	);
};
