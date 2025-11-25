// src/components/app/MainAppContent.tsx
import React, { lazy, Suspense, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout/useAppLayout";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useLoadBuild } from "../../hooks/useLoadBuild/useLoadBuild";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useSaveBuild } from "../../hooks/useSaveBuild/useSaveBuild";
import { useScrollHide } from "../../hooks/useScrollHide/useScrollHide";
import { useToast } from "../../hooks/useToast/useToast";
import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import BuildNameDialog from "../AppDialog/BuildNameDialog";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import { TechTreeSkeleton } from "../TechTree/TechTreeSkeleton";
import { ToastRenderer } from "../Toast/ToastRenderer";

const AppFooter = lazy(() => import("../AppFooter/AppFooter"));
const ShipSelection = lazy(() =>
	import("../ShipSelection/ShipSelection").then((m) => ({ default: m.ShipSelection }))
);
const TechTreeComponent = lazy(() => import("../TechTree/TechTree"));
const OptimizationAlertDialog = lazy(() => import("../AppDialog/OptimizationAlertDialog"));

/**
 * @property {string} buildVersion - The build version of the application, to be displayed in the footer.
 * @property {string} [buildDate] - The build date of the application, to be displayed in the footer for devmode.
 */
type MainAppContentProps = {
	buildVersion: string;
	buildDate?: string; // Added optional buildDate prop
};

/**
 * The core component that renders the main application content.
 * It orchestrates the layout, including the header, footer, grid table, and technology tree.
 * This component utilizes Suspense for asynchronous data fetching of ship types.
 */
export const MainAppContent = ({ buildVersion, buildDate }: MainAppContentProps) => {
	const { t } = useTranslation();
	const isSmallScreen = !useBreakpoint("640px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const { openDialog } = useDialog();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { isVisible, toolbarRef } = useScrollHide(80);
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

	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridTableTotalWidth,
	} = useAppLayout();

	const { showSuccess, showError } = useToast();
	const {
		isSaveBuildDialogOpen,
		handleSaveBuild,
		handleBuildNameConfirm,
		handleBuildNameCancel,
	} = useSaveBuild();
	const { fileInputRef, handleLoadBuild, handleFileSelect } = useLoadBuild({
		showSuccess,
		showError,
	});

	useEffect(() => {
		if (isSharedGrid) {
			// If it's a shared grid, the tech tree is not actively loading,
			// so ensure the loading spinner is hidden.
			useTechTreeLoadingStore.getState().setLoading(false);
			hideSplashScreenAndShowBackground();
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

			<main className="flex min-h-dvh flex-col items-center justify-start pt-12 sm:justify-center sm:pt-0">
				<div
					className="app rounded-none shadow-none backdrop-blur-3xl sm:w-fit lg:rounded-xl lg:shadow-xl"
					style={{ backgroundColor: "var(--accent-a2)" }}
				>
					<AppHeader onShowChangelog={handleShowChangelog} />

					<section
						className="gridContainer flex flex-col items-center px-4 py-2 sm:px-8 sm:pt-4 sm:pb-4 lg:flex-row lg:items-start"
						ref={gridContainerRef}
					>
						<article
							className="gridContainer__container w-full p-1 lg:w-auto lg:shrink-0"
							ref={appLayoutContainerRef}
						>
							<header
								className="heading-styled mb-3 flex flex-wrap items-center gap-3 text-xl sm:mb-4 sm:text-2xl"
								style={{
									maxWidth: gridTableTotalWidth
										? `${gridTableTotalWidth}px`
										: undefined,
								}}
							>
								{!isSharedGrid && (
									<span className="shrink-0 self-start">
										<ShipSelection solving={solving} />
									</span>
								)}
								<span
									className="mt-px hidden self-start sm:inline"
									style={{ color: "var(--accent-11)" }}
								>
									{t("platformLabel")}
								</span>
								<span
									className="mt-[3px] min-w-0 flex-1 self-start sm:mt-px"
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
								ref={appLayoutGridTableRef}
							/>
						</article>

						{!isSharedGrid && (
							<aside className="flex w-full flex-col p-1 lg:ml-4 lg:p-0">
								<Suspense fallback={<TechTreeSkeleton />}>
									<TechTreeComponent
										handleOptimize={handleOptimize}
										solving={solving}
										gridTableTotalWidth={gridTableTotalWidth}
									/>
								</Suspense>
							</aside>
						)}
					</section>
				</div>

				<AppFooter buildVersion={buildVersion} buildDate={buildDate} />

				{/* Dialogs related to MainAppContent's state */}
				<Suspense fallback={null}>
					<OptimizationAlertDialog
						isOpen={!!patternNoFitTech}
						technologyName={patternNoFitTech}
						onClose={clearPatternNoFitTech}
						onForceOptimize={handleForceCurrentPnfOptimize}
					/>
				</Suspense>

				{/* Build file management (only on mobile) */}
				<BuildNameDialog
					isOpen={isSaveBuildDialogOpen}
					onConfirm={handleBuildNameConfirm}
					onCancel={handleBuildNameCancel}
				/>
				<input
					ref={fileInputRef}
					type="file"
					accept=".nms"
					onChange={handleFileSelect}
					className="hidden"
					aria-label={t("buttons.loadBuild")}
				/>
				<ToastRenderer />
			</main>
		</>
	);
};
