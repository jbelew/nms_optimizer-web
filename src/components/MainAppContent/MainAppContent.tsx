// src/components/app/MainAppContent.tsx
import "./MainAppContent.scss";

import React, { lazy, Suspense, useCallback, useEffect } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout, Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";

import { InstallPrompt } from "../../components/InstallPrompt/InstallPrompt";
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
	const isLargeScreen = useBreakpoint("1024px");
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

			<InstallPrompt />

			<main className="main-app__container">
				<div className="main-app__card lg:shadow-lg">
					<AppHeader onShowChangelog={handleShowChangelog} />

					<Flex
						direction={{ initial: "column", md: "row" }}
						align={{ initial: "center", md: "start" }}
						className="main-app__content"
						ref={gridContainerRef}
					>
						{/* Grid section */}
						<Box
							// width={{ initial: "100%", md: "auto" }}
							flexShrink={{ initial: "1", md: "0" }}
							className="main-app__grid-section"
							ref={appLayoutContainerRef}
						>
							{isSharedGrid && (
								<Box
									flexShrink="0"
									style={{
										maxWidth: gridTableTotalWidth
											? `${gridTableTotalWidth}px`
											: undefined,
									}}
								>
									<Callout.Root mb="3" color="gray" variant="surface" size="1">
										<Callout.Icon>
											<InfoCircledIcon />
										</Callout.Icon>
										<Callout.Text>
											<span className="text-sm sm:text-base">
												You are viewing a <strong>Shared Build</strong>.
												This layout is read-only. To create your own layout,
												click the <strong>Reset Grid</strong> button.
											</span>
										</Callout.Text>
									</Callout.Root>
								</Box>
							)}

							<Flex
								align="center"
								wrap="wrap"
								gap="3"
								className="main-app__ship-selector"
								style={{
									maxWidth: gridTableTotalWidth
										? `${gridTableTotalWidth}px`
										: undefined,
								}}
							>
								{!isSharedGrid && (
									<span className="main-app__ship-selection">
										<ShipSelection solving={solving} />
									</span>
								)}
								<Text trim="end" className="main-app__ship-label">
									{t("platformLabel")}
								</Text>
								<Text trim="end" className="main-app__ship-name trim-text">
									{t(`platforms.${selectedShipType}`)}
								</Text>
							</Flex>

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

					{!isLargeScreen && (
						<div className="main-app__footer-wrapper">
							<AppFooter buildVersion={buildVersion} buildDate={buildDate} />
						</div>
					)}
				</div>

				{isLargeScreen && <AppFooter buildVersion={buildVersion} buildDate={buildDate} />}

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
