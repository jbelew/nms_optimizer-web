// src/components/app/MainAppContent.tsx
import React, { FC, lazy, Suspense, useCallback, useEffect } from "react";
import { CounterClockwiseClockIcon, EyeOpenIcon, PieChartIcon } from "@radix-ui/react-icons";
import { IconButton, Separator, Switch } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import LanguageSelector from "@/components/LanguageSelector/LanguageSelector";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useA11yStore } from "@/store/A11yStore";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout/useAppLayout";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import { TechTreeSkeleton } from "../TechTree/TechTreeSkeleton";

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
	const { openDialog } = useDialog();
	const { sendEvent } = useAnalytics();
	const isLg = useBreakpoint("1024px");
	const { a11yMode, toggleA11yMode } = useA11yStore();
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
				className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-2 p-2 pr-4 sm:hidden"
				style={{
					backgroundColor: "#003848",
					WebkitUserSelect: "none",
				}}
			>
				<ConditionalTooltip label={t("buttons.accessibility") ?? ""}>
					<div className="flex items-center gap-2 pl-2">
						<EyeOpenIcon style={{ color: "var(--accent-a11)" }} className="h-4 w-4" />
						<Switch
							variant="soft"
							checked={a11yMode}
							onCheckedChange={toggleA11yMode}
							aria-label={t("buttons.accessibility") ?? ""}
						/>
					</div>
				</ConditionalTooltip>

				<div className="flex items-center gap-2">
					<ConditionalTooltip label={t("buttons.changelog") ?? ""}>
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
					</ConditionalTooltip>

					<ConditionalTooltip label={t("buttons.userStats") ?? ""}>
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
					</ConditionalTooltip>

					<LanguageSelector />
				</div>
			</nav>

			<main className="flex min-h-dvh flex-col items-center justify-center pt-12 sm:pt-0 lg:min-h-screen">
				<div
					className="app rounded-none shadow-none backdrop-blur-3xl sm:w-fit lg:rounded-xl lg:shadow-xl"
					style={{ backgroundColor: "var(--accent-a2)" }}
				>
					<AppHeader onShowChangelog={handleShowChangelog} />

					<section
						className="gridContainer flex flex-col items-center p-3 pt-2 sm:p-8 sm:pt-4 lg:flex-row lg:items-start"
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

						{!isLg && (
							<>
								<Separator
									color="cyan"
									size="4"
									mt="4"
									mb="4"
									orientation="horizontal"
								/>
								<AppFooter buildVersion={buildVersion} buildDate={buildDate} />
							</>
						)}
					</section>
				</div>

				{isLg && <AppFooter buildVersion={buildVersion} buildDate={buildDate} />}

				{/* Dialogs related to MainAppContent's state */}
				<Suspense fallback={null}>
					<OptimizationAlertDialog
						isOpen={!!patternNoFitTech}
						technologyName={patternNoFitTech}
						onClose={clearPatternNoFitTech}
						onForceOptimize={handleForceCurrentPnfOptimize}
					/>
				</Suspense>
			</main>
		</>
	);
};
