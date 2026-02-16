// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import React, { lazy, Suspense } from "react";
import { Box, Flex } from "@radix-ui/themes";

import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";

import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import { TechTreeSkeleton } from "../TechTree/TechTreeSkeleton";
import { MainAppUtilities } from "./MainAppUtilities";
import { SharedBuildCallout } from "./SharedBuildCallout";
import { ShipSelectionHeading } from "./ShipSelectionHeading";
import { useMainAppLogic } from "./useMainAppLogic";

const TechTreeComponent = lazy(() => import("../TechTree/TechTree"));

/**
 * The core component that renders the main application content.
 * It orchestrates the layout, including the header, footer, grid table, and technology tree.
 * This component utilizes Suspense for asynchronous data fetching of ship types.
 */
export const MainAppContent = () => {
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
		status,
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

			<main className="main-app__container">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<AppHeader onShowChangelog={handleShowChangelog} />

						<Flex
							direction={{ initial: "column", md: "row" }}
							align={{ initial: "center", md: "start" }}
							className="main-app__content"
							ref={gridContainerRef}
						>
							{/* Grid section */}
							<Box
								flexShrink={{ initial: "1", md: "0" }}
								className="main-app__grid-section"
								ref={appLayoutContainerRef}
							>
								{isSharedGrid && (
									<SharedBuildCallout gridTableTotalWidth={gridTableTotalWidth} />
								)}

								<ShipSelectionHeading
									isSharedGrid={isSharedGrid}
									solving={solving}
									selectedShipType={selectedShipType}
									gridTableTotalWidth={gridTableTotalWidth}
								/>

								<GridTable
									solving={solving}
									progressPercent={progressPercent}
									status={status}
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
