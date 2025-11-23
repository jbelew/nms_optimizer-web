// src/components/app/MainAppContent.tsx
import React, { FC, lazy, Suspense, useCallback, useEffect } from "react";
import { CounterClockwiseClockIcon, EyeOpenIcon, PieChartIcon } from "@radix-ui/react-icons";
import { IconButton, Switch } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { DownloadIcon } from "@/components/Icons/DownloadIcon";
import { UploadIcon } from "@/components/Icons/UploadIcon";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useA11yStore } from "@/store/A11yStore";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useAppLayout } from "../../hooks/useAppLayout/useAppLayout";
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
import { NmsToast } from "../Toast/Toast";

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
export const MainAppContent: FC<MainAppContentProps> = ({ buildVersion, buildDate }) => {
	// Destructure buildDate
	const { t } = useTranslation();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();
	const { a11yMode, toggleA11yMode } = useA11yStore();
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

	const { toastConfig, isOpen: isToastOpen, closeToast, showSuccess, showError } = useToast();
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
			{/* Mobile fixed toolbar */}
			<nav
				ref={toolbarRef}
				className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 p-2 pr-4 transition-transform duration-300 ease-in-out sm:hidden"
				style={{
					backgroundColor: "#003848",
					WebkitUserSelect: "none",
					transform: isVisible ? "translateY(0)" : "translateY(calc(-100% - 8px))",
				}}
			>
				<div className="flex items-center gap-2 pl-2">
					{/* Load/Save buttons for mobile - far left */}
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.loadBuild") ?? ""}
						onClick={handleLoadBuild}
						disabled={solving}
					>
						<UploadIcon weight="light" size={20} />
					</IconButton>
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.saveBuild") ?? ""}
						onClick={handleSaveBuild}
						disabled={solving || !hasModulesInGrid}
					>
						<DownloadIcon weight="light" size={20} />
					</IconButton>
				</div>

				<div className="flex items-center gap-2">
					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.changelog") ?? ""}
						onClick={() => {
							sendEvent({
								category: "ui",
								action: "show_changelog",
								value: 1,
							});
							handleShowChangelog();
						}}
					>
						<CounterClockwiseClockIcon className="h-4 w-4" />
					</IconButton>

					<IconButton
						variant="soft"
						size="2"
						aria-label={t("buttons.userStats") ?? ""}
						onClick={() => {
							sendEvent({
								category: "ui",
								action: "show_user_stats",
								value: 1,
							});
							openDialog("userstats");
						}}
					>
						<PieChartIcon className="h-4 w-4" />
					</IconButton>

					<LanguageSelector />

					{/* A11y mode switch */}
					<div className="flex items-center gap-2">
						<EyeOpenIcon style={{ color: "var(--accent-a11)" }} className="h-4 w-4" />
						<Switch
							variant="soft"
							checked={a11yMode}
							onCheckedChange={toggleA11yMode}
							aria-label={t("buttons.accessibility") ?? ""}
						/>
					</div>
				</div>
			</nav>

			<main className="flex min-h-dvh flex-col items-center justify-start pt-12 sm:justify-center sm:pt-0">
				<div
					className="app rounded-none shadow-none backdrop-blur-3xl sm:w-fit lg:rounded-xl lg:shadow-xl"
					style={{ backgroundColor: "var(--accent-a2)" }}
				>
					<AppHeader onShowChangelog={handleShowChangelog} />

					<section
						className="gridContainer flex flex-col items-center px-3 py-2 sm:px-8 sm:py-4 lg:flex-row lg:items-start"
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
										gridContainerRef={gridContainerRef}
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
				{toastConfig && (
					<NmsToast
						open={isToastOpen}
						onOpenChange={closeToast}
						title={toastConfig.title}
						description={toastConfig.description}
						variant={toastConfig.variant}
						duration={toastConfig.duration}
					/>
				)}
			</main>
		</>
	);
};
