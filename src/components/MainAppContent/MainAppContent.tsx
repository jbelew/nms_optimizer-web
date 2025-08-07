// src/components/app/MainAppContent.tsx
import type { FC } from "react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout.tsx";
import { useOptimize } from "../../hooks/useOptimize";
import { useUrlSync } from "../../hooks/useUrlSync";
import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import AppDialog from "../AppDialog/AppDialog";
import MarkdownContentRenderer from "../AppDialog/MarkdownContentRenderer";
import OptimizationAlertDialog from "../AppDialog/OptimizationAlertDialog";
import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import { ShipSelection } from "../ShipSelection/ShipSelection";
import TechTreeComponent from "../TechTree/TechTree";

/** Props for the MainAppContentInternal component. */
type MainAppContentInternalProps = {
	/** The build version of the application, to be displayed in the footer. */
	buildVersion: string;
	onOpenUserStats: () => void;
};

/**
 * The core component that renders the main application content.
 * It orchestrates the layout, including the header, footer, grid table, and technology tree.
 * This component utilizes Suspense for asynchronous data fetching of ship types.
 * @param {MainAppContentInternalProps} props - The props for the component.
 */
const MainAppContentInternal: FC<MainAppContentInternalProps> = ({
	buildVersion,
	onOpenUserStats,
}) => {
	const { t } = useTranslation();
	const { grid, activateRow, deActivateRow, isSharedGrid } = useGridStore();
	const { activeDialog, openDialog, closeDialog, sectionToScrollTo } = useDialog();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const {
		solving,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	} = useOptimize();
	const { updateUrlForShare, updateUrlForReset } = useUrlSync(); // Destructure functions
	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridTableTotalWidth,
	} = useAppLayout();

	useEffect(() => {
		hideSplashScreen();
	}, []);

	// --- Dialog Handlers ---
	const handleShowChangelog = useCallback(() => {
		openDialog("changelog");
	}, [openDialog]);

	const handleOpenUserStats = useCallback(() => {
		onOpenUserStats();
	}, [onOpenUserStats]);

	// Memoize content elements for dialogs
	const aboutDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="about" />,
		[]
	);
	const instructionsDialogContent = useMemo(
		() => (
			<MarkdownContentRenderer
				markdownFileName="instructions"
				targetSectionId={sectionToScrollTo}
			/>
		),
		[sectionToScrollTo]
	);
	const changelogDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="changelog" />,
		[]
	);
	const translationRequestDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="translation-request" />,
		[]
	);
	const userStatsDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="user-stats" />,
		[]
	);

	return (
		<main className="flex min-h-[100dvh] flex-col items-center justify-center lg:min-h-screen">
			<div
				className="app rounded-none shadow-none backdrop-blur-2xl sm:w-fit lg:rounded-xl lg:shadow-xl"
				style={{ backgroundColor: "var(--color-panel-translucent)" }}
			>
				<AppHeader onShowChangelog={handleShowChangelog} onOpenUserStats={handleOpenUserStats} />
				<section
					className="gridContainer flex flex-col items-center p-4 pt-2 sm:p-8 sm:pt-4 lg:flex-row lg:items-start"
					ref={gridContainerRef}
				>
					<article
						className="gridContainer__container w-full lg:w-auto lg:flex-shrink-0"
						ref={appLayoutContainerRef}
					>
						<header
							className="heading-styled mb-3 flex flex-wrap items-center gap-2 text-xl sm:mb-4 sm:text-2xl"
							style={{ maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined }}
						>
							{!isSharedGrid && (
								<span className="flex-shrink-0 self-start">
									<ShipSelection solving={solving} />
								</span>
							)}
							<span className="hidden self-start sm:inline" style={{ color: "var(--accent-11)" }}>
								{t("platformLabel")}
							</span>
							<span
								className="mt-[7px] min-w-0 flex-1 self-start sm:mt-[0px]"
								style={{
									textWrap: "balance",
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
							gridContainerRef={gridContainerRef}
						/>
					</article>

					{!isSharedGrid && (
						<aside className="flex w-full flex-col lg:ml-4">
							<TechTreeComponent
								handleOptimize={handleOptimize}
								solving={solving}
								gridContainerRef={gridContainerRef}
								gridTableTotalWidth={gridTableTotalWidth}
							/>
						</aside>
					)}
				</section>
			</div>

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
			{/* Dialog for "User Stats" information */}
			<AppDialog
				isOpen={activeDialog === "user-stats"}
				onClose={closeDialog}
				titleKey="dialogs.titles.userStats"
				title={t("dialogs.titles.userStats")}
				content={userStatsDialogContent}
			/>
		</main>
	);
};

/**
 * A memoized version of `MainAppContentInternal` to prevent unnecessary re-renders.
 * This is the component that should be used throughout the application.
 */
export const MainAppContent = React.memo(MainAppContentInternal);
