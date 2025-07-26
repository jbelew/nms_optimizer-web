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
		gridTableTotalWidth, // Destructure the new total width
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
		() => <MarkdownContentRenderer markdownFileName="instructions" targetSectionId={sectionToScrollTo} />,
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

	return (
		<main className="flex flex-col items-center justify-center min-h-[100dvh] lg:min-h-screen">
			<div className="w-auto rounded-none shadow-none app backdrop-blur-xl lg:shadow-xl lg:rounded-xl" style={{ backgroundColor: "var(--color-panel-translucent)" }}>
				<AppHeader onShowChangelog={handleShowChangelog} />
				<section
					className="flex flex-col items-center p-4 pt-2 gridContainer sm:p-8 sm:pt-4 lg:flex-row lg:items-start"
					ref={gridContainerRef}
				>
					<article
						className="w-full lg:w-auto lg:flex-shrink-0 gridContainer__container"
						ref={appLayoutContainerRef}
					>
						<header className="flex flex-wrap items-center gap-2 mb-3 text-xl heading-styled sm:mb-4 sm:text-2xl"
							style={{ maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined }}>
							{!isSharedGrid && (
								<span className="self-start flex-shrink-0">
									<ShipSelection solving={solving} />
								</span>
							)}
							<span className="self-start hidden sm:inline" style={{ color: "var(--accent-11)" }}>
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
						<aside className="flex flex-col w-full lg:ml-4">
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
		</main >

	);
};

/**
 * A memoized version of `MainAppContentInternal` to prevent unnecessary re-renders.
 * This is the component that should be used throughout the application.
 */
export const MainAppContent = React.memo(MainAppContentInternal);