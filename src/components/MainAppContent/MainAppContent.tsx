// src/components/app/MainAppContent.tsx
import React, { FC, Suspense, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout/useAppLayout";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useUrlSync } from "../../hooks/useUrlSync/useUrlSync";
import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import OptimizationAlertDialog from "../AppDialog/OptimizationAlertDialog";
import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import { ShipSelection } from "../ShipSelection/ShipSelection";
import TechTreeComponent from "../TechTree/TechTree";
import { TechTreeSkeleton } from "../TechTree/TechTreeSkeleton";

/**
 * @property {string} buildVersion - The build version of the application, to be displayed in the footer.
 */
type MainAppContentProps = {
	buildVersion: string;
	language: string;
};

/**
 * The core component that renders the main application content.
 * It orchestrates the layout, including the header, footer, grid table, and technology tree.
 * This component utilizes Suspense for asynchronous data fetching of ship types.
 */
export const MainAppContent: FC<MainAppContentProps> = ({ buildVersion, language }) => {
	const { t } = useTranslation();
	const { activateRow, deActivateRow, isSharedGrid } = useGridStore();
	const { openDialog } = useDialog();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const {
		solving,
		progressPercent,
		status,
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
		if (isSharedGrid) {
			// If it's a shared grid, the tech tree is not actively loading,
			// so ensure the loading spinner is hidden.
			useTechTreeLoadingStore.getState().setLoading(false);
			hideSplashScreen();
		}
	}, [isSharedGrid]);

	/**
	 * Handles the action to show the changelog dialog by opening the 'changelog' dialog.
	 * @returns {void}
	 */
	const handleShowChangelog = useCallback(() => {
		openDialog("changelog");
	}, [openDialog]);

	return (
		<main className="flex min-h-[100dvh] flex-col items-center justify-center lg:min-h-screen">
			<div
				className="app rounded-none shadow-none backdrop-blur-3xl sm:w-fit lg:rounded-xl lg:shadow-xl"
				style={{ backgroundColor: "var(--accent-a2)" }}
			>
				<AppHeader onShowChangelog={handleShowChangelog} language={language} />
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
							style={{
								maxWidth: gridTableTotalWidth
									? `${gridTableTotalWidth}px`
									: undefined,
							}}
						>
							{!isSharedGrid && (
								<span className="flex-shrink-0 self-start">
									<ShipSelection solving={solving} />
								</span>
							)}
							<span
								className="hidden self-start sm:inline"
								style={{ color: "var(--accent-11)" }}
							>
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
							solving={solving}
							progressPercent={progressPercent}
							status={status}
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
							<Suspense fallback={<TechTreeSkeleton />}>
								<TechTreeComponent
									handleOptimize={handleOptimize}
									solving={solving}
									gridContainerRef={gridContainerRef}
									gridTableTotalWidth={gridTableTotalWidth}
								/>
							</Suspense>
						</aside>
					)}
				</section>
			</div>

			<AppFooter buildVersion={buildVersion} language={language} />

			{/* Dialogs related to MainAppContent's state */}
			<OptimizationAlertDialog
				isOpen={!!patternNoFitTech}
				technologyName={patternNoFitTech}
				onClose={clearPatternNoFitTech}
				onForceOptimize={handleForceCurrentPnfOptimize}
			/>
		</main>
	);
};
