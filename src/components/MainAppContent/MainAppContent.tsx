// src/components/app/MainAppContent.tsx
import React, { FC, lazy, Suspense, useCallback, useEffect } from "react";
import { Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout/useAppLayout";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
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
	const isLg = useBreakpoint("1024px");
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
		<main className="flex min-h-dvh flex-col items-center justify-center lg:min-h-screen">
			<div
				className="app rounded-none shadow-none backdrop-blur-3xl sm:w-fit lg:rounded-xl lg:shadow-xl"
				style={{ backgroundColor: "var(--accent-a2)" }}
			>
				<AppHeader onShowChangelog={handleShowChangelog} />
				<section
					className="gridContainer flex flex-col items-center p-4 pt-2 sm:p-8 sm:pt-4 lg:flex-row lg:items-start"
					ref={gridContainerRef}
				>
					<article
						className="gridContainer__container w-full lg:w-auto lg:shrink-0"
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
								<span className="shrink-0 self-start">
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
								className="mt-[7px] min-w-0 flex-1 self-start sm:mt-0"
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
	);
};
