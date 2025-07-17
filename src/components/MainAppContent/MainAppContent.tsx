// src/components/app/MainAppContent.tsx
import { ScrollArea } from "@radix-ui/themes";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout";
import { useOptimize } from "../../hooks/useOptimize";
import { useFetchShipTypesSuspense } from "../../hooks/useShipTypes";
import { usePlatformStore } from "../../store/PlatformStore";
import { useUrlSync } from "../../hooks/useUrlSync";
import { useFetchTechTreeSuspense } from "../../hooks/useTechTree";
import { useGridStore } from "../../store/GridStore";
import AppDialog from "../AppDialog/AppDialog";
import MarkdownContentRenderer from "../AppDialog/MarkdownContentRenderer";
import OptimizationAlertDialog from "../AppDialog/OptimizationAlertDialog";
import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import ShipSelection from "../ShipSelection/ShipSelection";
import TechTreeComponent from "../TechTree/TechTree";
import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import React from "react";

/** Props for the MainAppContentInternal component. */
type MainAppContentInternalProps = {
	/** The build version of the application, to be displayed in the footer. */
	buildVersion: string;
};

/**
 * The core component that renders the main application content.
 * It orchestrates the layout, including the header, footer, grid table, and technology tree.
 * This component utilizes Suspense for asynchronous data fetching of ship types.
 * @param {MainAppContentInternalProps} props - The props for the component.
 */
const MainAppContentInternal: FC<MainAppContentInternalProps> = ({ buildVersion }) => {
	const { t } = useTranslation();


	const { grid, activateRow, deActivateRow, isSharedGrid } = useGridStore();
	const { activeDialog, openDialog, closeDialog } = useDialog();

	const [, setRecommendedBuildHeight] = useState(0);

	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	// Call useFetchShipTypesSuspense to ensure data is fetched/cached and to trigger Suspense.
	// The actual shipTypes data is typically consumed by child components (e.g., ShipSelection)
	// which also call this hook and benefit from the cache, or potentially via a store if it were populated there.
	useFetchShipTypesSuspense();
	const {
		solving,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	} = useOptimize();
	const { updateUrlForShare, updateUrlForReset } = useUrlSync(); // Destructure functions
	const techTree = useFetchTechTreeSuspense(selectedShipType);
	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridTableTotalWidth, // Destructure the new total width
		isLarge,
	} = useAppLayout();

	useEffect(() => {
		hideSplashScreen();
	}, []);

	// --- Dialog Handlers ---
	const handleShowChangelog = useCallback(() => {
		openDialog("changelog");
	}, [openDialog]);

	// Memoize content elements for dialogs
	const aboutDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="about" />,
		[]
	);
	const instructionsDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="instructions" />,
		[]
	);
	const changelogDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="changelog" />,
		[]
	);
	const translationRequestDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="translation-request" />,
		[]
	);

	return (
		<main className="flex flex-col items-center justify-center lg:min-h-screen">
			<section className="relative mx-auto border rounded-none app lg:rounded-xl bg-white/5 backdrop-blur-xl">
				<AppHeader onShowChangelog={handleShowChangelog} />
				<section
					className="flex flex-col items-start p-4 pt-2 gridContainer sm:pt-4 sm:p-8 lg:flex-row"
					ref={gridContainerRef}
				>
					<div
						className="flex-grow w-auto gridContainer__container lg:flex-shrink-0"
						ref={appLayoutContainerRef}
					>
						<header
							className="flex flex-wrap items-center gap-2 mb-3 text-xl sm:mb-4 sm:text-2xl heading-styled"
							style={{ maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined }}
						>
							{!isSharedGrid && (
								<span className="self-start flex-shrink-0 shadow-sm">
									<ShipSelection solving={solving} />
								</span>
							)}
							<span className="self-start hidden sm:inline" style={{ color: "var(--accent-11)" }}>
								{t("platformLabel")}
							</span>
							<span
								className="self-start flex-1 min-w-0 mt-[6] sm:mt-0"
								style={{
									textWrap: "balance",
									visibility: gridTableTotalWidth ? "visible" : "hidden",
								}}
							>
								{t(`platforms.${selectedShipType}`)}
							</span>
						</header>
						<GridTable
							grid={grid}
							solving={solving}
							shared={isSharedGrid}
							activateRow={activateRow}
							deActivateRow={deActivateRow}
							ref={appLayoutGridTableRef}
							updateUrlForShare={updateUrlForShare}
							updateUrlForReset={updateUrlForReset}
							techTreeGridDefinition={techTree.grid_definition} // Pass the techTree.grid_definition
						/>
					</div>
					{!isSharedGrid && (
						<div className="flex flex-col w-full lg:ml-4">
							{isLarge ? (
								<>
									<ScrollArea
										className="p-4 mb-1 rounded-md shadow-md gridContainer__sidebar backdrop-blur-xl"
										style={{
											height:
												techTree.recommended_builds && techTree.recommended_builds.length > 0
													? "473px" // shorter if RecommendedBuild is shown
													: "522px", // full height otherwise
										}}
									>
										<TechTreeComponent handleOptimize={handleOptimize} solving={solving} />
									</ScrollArea>
									{techTree.recommended_builds && techTree.recommended_builds.length > 0 && (
										<RecommendedBuild
											techTree={techTree}
											gridContainerRef={gridContainerRef}
											isLarge={isLarge}
											onHeightChange={setRecommendedBuildHeight}
										/>
									)}
								</>
							) : (
								<aside
									className={`flex-grow w-full ${techTree.recommended_builds && techTree.recommended_builds.length > 0 ? "pt-4" : "pt-8"}`}
									style={{ minHeight: "550px" }}
								>
									{techTree.recommended_builds && techTree.recommended_builds.length > 0 && (
										<RecommendedBuild
											techTree={techTree}
											gridContainerRef={gridContainerRef}
											isLarge={isLarge}
											onHeightChange={setRecommendedBuildHeight}
										/>
									)}
									<TechTreeComponent handleOptimize={handleOptimize} solving={solving} />
								</aside>
							)}
						</div>
					)}
				</section>
			</section>

			<AppFooter buildVersion={buildVersion} />

			{/* Dialogs related to MainAppContent's state */}
			<OptimizationAlertDialog
				isOpen={!!patternNoFitTech}
				technologyName={patternNoFitTech}
				onClose={clearPatternNoFitTech}
				onForceOptimize={handleForceCurrentPnfOptimize}
			/>
			{/* Dialog for "About" information */}
			<AppDialog
				isOpen={activeDialog === "about"}
				onClose={closeDialog}
				titleKey="dialogs.titles.about"
				title={t("dialogs.titles.about")}
				content={aboutDialogContent}
			/>
			{/* Dialog for "Instructions" information */}
			<AppDialog
				isOpen={activeDialog === "instructions"}
				onClose={closeDialog}
				titleKey="dialogs.titles.instructions"
				title={t("dialogs.titles.instructions")}
				content={instructionsDialogContent}
			/>
			{/* Dialog for "Changelog" information */}
			<AppDialog
				isOpen={activeDialog === "changelog"}
				onClose={closeDialog}
				titleKey="dialogs.titles.changelog"
				title={t("dialogs.titles.changelog")}
				content={changelogDialogContent}
			/>
			{/* Dialog for "Translation Request" information */}
			<AppDialog
				isOpen={activeDialog === "translation"}
				onClose={closeDialog}
				titleKey="dialogs.titles.translationRequest" // You'll need to add this key to your i18n files
				title={t("dialogs.titles.translationRequest")}
				content={translationRequestDialogContent}
			/>
		</main>
	);
};

/**
 * A memoized version of `MainAppContentInternal` to prevent unnecessary re-renders.
 * This is the component that should be used throughout the application.
 */
export const MainAppContent = React.memo(MainAppContentInternal);
