// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import { lazy, Suspense, useEffect, useState } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import AppFooter from "@/components/AppFooter/AppFooter";
import AppHeader from "@/components/AppHeader/AppHeader";
import { GridTable } from "@/components/GridTable/GridTable";
import { MessageSpinner } from "@/components/MessageSpinner/messageSpinner";
import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";
import { ShipSelection } from "@/components/ShipSelection/shipSelection";
import TechTree, { TechTreeSkeleton } from "@/components/TechTree/TechTree";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { useTechTreeLoadingStore } from "@/store/tech/techTreeLoadingStore";

import { useMainAppLogic } from "./useMainAppLogic";

const BuildNameDialog = lazy(() => import("@/components/AppDialog/BuildName/BuildNameDialog"));
const OptimizationAlertDialog = lazy(
	() => import("@/components/AppDialog/OptimizationAlert/OptimizationAlertDialog")
);

const ErrorMessageRenderer = lazy(() =>
	import("@/components/ErrorMessageRenderer/ErrorMessageRenderer").then((m) => ({
		default: m.ErrorMessageRenderer,
	}))
);
const InstallPrompt = lazy(() =>
	import("@/components/InstallPrompt/InstallPrompt").then((m) => ({ default: m.InstallPrompt }))
);
const ToastRenderer = lazy(() =>
	import("@/components/Toast/ToastRenderer").then((m) => ({ default: m.ToastRenderer }))
);

/**
 * Inner component that triggers the ship types fetch via Suspense.
 *
 * @remarks
 * This allows the parent {@link MainAppContent} to render the header and other
 * static elements immediately, while only this part of the UI is suspended.
 * It ensures that platform data is available before rendering the main grid.
 *
 * This component is technically a "side-effect only" component as it returns null
 * but performs a fetch on mount via {@link useFetchShipTypesSuspense}.
 *
 * @returns {null} Always returns null.
 *
 * @see {@link useFetchShipTypesSuspense}
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipTypesLoader />
 * // returns null
 * ```
 */
const ShipTypesLoader = () => {
	useFetchShipTypesSuspense();

	return null;
};

/**
 * Props for the {@link SharedBuildCallout} component.
 *
 * @remarks
 * Defines the layout constraints for the shared build notification, ensuring
 * it matches the width of the grid table.
 *
 * @category Components
 */
interface SharedBuildCalloutProps {
	/** Total width of the grid table in pixels. */
	gridTableTotalWidth: number | undefined;
}

/**
 * A notification component that appears when the user is viewing a read-only shared layout.
 *
 * @remarks
 * Informs the user that the current view is a shared build and provides context
 * for the read-only state of the grid. It dynamically adjusts its width to
 * align with the {@link GridTable}.
 *
 * @param {SharedBuildCalloutProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered callout.
 *
 * @see {@link GridTable} for the target width source.
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <SharedBuildCallout gridTableTotalWidth={500} />
 * ```
 */
const SharedBuildCallout: React.FC<SharedBuildCalloutProps> = ({ gridTableTotalWidth }) => {
	return (
		<Box
			flexShrink="0"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
		>
			<Callout.Root mb="3" size="1" variant="surface">
				<Callout.Icon>
					<InfoCircledIcon />
				</Callout.Icon>
				<Callout.Text>
					<span className="text-sm sm:text-base" style={{ color: "var(--gray-12)" }}>
						<Trans i18nKey="mainApp.viewingSharedBuild" />
					</span>
				</Callout.Text>
			</Callout.Root>
		</Box>
	);
};

/**
 * Props for the {@link ShipSelectionHeading} component.
 *
 * @remarks
 * Encapsulates the state required to render the platform selection header,
 * including visibility flags and current selection data.
 *
 * @category Components
 */
interface ShipSelectionHeadingProps {
	/** Total width of the grid table in pixels. */
	gridTableTotalWidth: number | undefined;
	/** Whether the grid is in read-only shared mode. */
	isSharedGrid: boolean;
	/** The internal identifier of the currently selected ship type. */
	selectedShipType: string;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * A layout component that displays the current equipment platform and its selection control.
 *
 * @remarks
 * Provides the primary UI for switching between different technology platforms
 * (e.g., Starship, Exosuit, Multi-tool). It integrates {@link ShipSelection}
 * for interactive changes and displays the translated platform name.
 *
 * @param {ShipSelectionHeadingProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered heading section.
 *
 * @see {@link ShipSelection} for the interactive toggle.
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelectionHeading
 *   isSharedGrid={false}
 *   solving={false}
 *   selectedShipType="standard"
 *   gridTableTotalWidth={500}
 * />
 * ```
 */
const ShipSelectionHeading: React.FC<ShipSelectionHeadingProps> = ({
	gridTableTotalWidth,
	isSharedGrid,
	selectedShipType,
	solving,
}) => {
	const { t } = useTranslation();

	return (
		<Flex
			align="center"
			className="main-app__ship-selector heading-styled"
			gap="3"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
			wrap="wrap"
		>
			{!isSharedGrid && (
				<span className="main-app__ship-selection">
					<ShipSelection solving={solving} />
				</span>
			)}

			<Text
				className="main-app__ship-label"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t("platformLabel")}
			</Text>
			<Text
				className="main-app__ship-name trim-text"
				style={{ opacity: solving ? 0.365 : 1 }}
				trim="end"
			>
				{t(`platforms.${selectedShipType}`)}
			</Text>
		</Flex>
	);
};

/**
 * Props for the {@link MainAppUtilities} component.
 *
 * @remarks
 * Defines the callback functions and state flags required by the application's
 * background utility components and dialogs.
 *
 * @category Components
 */
interface MainAppUtilitiesProps {
	/** Callback to clear the optimization failure alert. */
	clearPatternNoFitTech: () => void;
	/** Ref to the hidden native file input used for build loading. */
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	/** Callback to dismiss the build naming modal. */
	handleBuildNameCancel: () => void;
	/** Callback function to save a build with the provided name. */
	handleBuildNameConfirm: (name: string) => void;
	/** Event handler for the system file picker's change event. */
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
	/** Asynchronous callback to re-trigger a solve for the failed technology. */
	handleForceCurrentPnfOptimize: () => Promise<void>;
	/** Whether the build name entry modal is visible. */
	isSaveBuildDialogOpen: boolean;
	/** Identifier of the technology that failed pattern matching. */
	patternNoFitTech: null | string;
}

/**
 * A container component for non-visual and global utility components.
 *
 * @remarks
 * Manages the mounting and orchestration of background services and global
 * dialogs, such as the install prompt, optimization alerts, and toast
 * notifications. It uses `requestIdleCallback` to defer mounting of non-critical
 * utilities, improving initial load performance.
 *
 * @param {MainAppUtilitiesProps} props - Component properties.
 *
 * @returns {JSX.Element} Fragment containing utility components.
 *
 * @see {@link InstallPrompt}
 * @see {@link OptimizationAlertDialog}
 * @see {@link BuildNameDialog}
 * @see {@link ErrorMessageRenderer}
 * @see {@link ToastRenderer}
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppUtilities {...props} />
 * ```
 */
const MainAppUtilities: React.FC<MainAppUtilitiesProps> = ({
	clearPatternNoFitTech,
	fileInputRef,
	handleBuildNameCancel,
	handleBuildNameConfirm,
	handleFileSelect,
	handleForceCurrentPnfOptimize,
	isSaveBuildDialogOpen,
	patternNoFitTech,
}) => {
	const { t } = useTranslation();
	const [mountUtilities, setMountUtilities] = useState(false);

	useEffect(() => {
		if ("requestIdleCallback" in window) {
			window.requestIdleCallback(() => setMountUtilities(true), { timeout: 2000 });
		} else {
			setTimeout(() => setMountUtilities(true), 1000);
		}
	}, []);

	return (
		<>
			{mountUtilities && (
				<Suspense fallback={null}>
					<InstallPrompt />

					<OptimizationAlertDialog
						isOpen={!!patternNoFitTech}
						onClose={clearPatternNoFitTech}
						onForceOptimize={handleForceCurrentPnfOptimize}
						technologyName={patternNoFitTech}
					/>

					<BuildNameDialog
						isOpen={isSaveBuildDialogOpen}
						onCancel={handleBuildNameCancel}
						onConfirm={handleBuildNameConfirm}
					/>

					<input
						accept=".nms"
						aria-label={t("buttons.loadBuild")}
						className="hidden"
						onChange={handleFileSelect}
						ref={fileInputRef}
						type="file"
					/>

					<ErrorMessageRenderer />
					<ToastRenderer />
				</Suspense>
			)}
		</>
	);
};

/**
 * The primary layout component for the application's main functional area.
 *
 * @remarks
 * This component orchestrates the core application flow, including:
 * - Rendering the {@link GridTable} and {@link TechTree}.
 * - Managing global headers and footers ({@link AppHeader}, {@link AppFooter}).
 * - Integrating the {@link MobileToolbar} for responsive controls.
 * - Handling various UI overlays like {@link MessageSpinner} and {@link SharedBuildCallout}.
 *
 * It utilizes {@link useMainAppLogic} to encapsulate business logic and state management,
 * keeping the UI structure clean and focused on layout.
 *
 * @returns {JSX.Element} The root application layout structure.
 *
 * @component
 *
 * @category Components
 *
 * @example Application root
 * ```tsx
 * <MainAppContent />
 * // mounts primary application UI
 * ```
 */
export const MainAppContent = () => {
	const { t } = useTranslation();
	const {
		appLayout,
		buildDate,
		buildVersion,
		handleShowChangelog,
		hasModulesInGrid,
		isLargeScreen,
		isSharedGrid,
		isSmallScreen,
		isVisible,
		loadBuild,
		optimize,
		saveBuild,
		selectedShipType,
		toolbarRef,
	} = useMainAppLogic();

	const {
		clearPatternNoFitTech,
		gridContainerRef,
		handleForceCurrentPnfOptimize,
		handleOptimize,
		patternNoFitTech,
		progressPercent,
		solving,
	} = optimize;

	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridTableTotalWidth,
	} = appLayout;

	const {
		handleBuildNameCancel,
		handleBuildNameConfirm,
		handleSaveBuild,
		isSaveBuildDialogOpen,
	} = saveBuild;

	const { fileInputRef, handleFileSelect, handleLoadBuild } = loadBuild;

	const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);

	return (
		<>
			{isSmallScreen && (
				<MobileToolbar
					gridRef={appLayoutContainerRef}
					hasModulesInGrid={hasModulesInGrid}
					isVisible={isVisible}
					onLoadBuild={handleLoadBuild}
					onSaveBuild={handleSaveBuild}
					onShowChangelog={handleShowChangelog}
					ref={toolbarRef as React.Ref<HTMLDivElement>}
					solving={solving}
				/>
			)}

			<a
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-(--accent-9) focus:px-4 focus:py-2 focus:text-white"
				href="#main-content"
			>
				Skip to main content
			</a>
			<main className="main-app__container" id="main-content">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<AppHeader onShowChangelog={handleShowChangelog} />

						<Suspense
							fallback={
								<Flex
									align="center"
									className="main-app__content"
									justify="center"
									style={{ minHeight: "400px", width: "100%" }}
								>
									<MessageSpinner
										initialMessage={t("techTree.loading")}
										isVisible={true}
									/>
								</Flex>
							}
						>
							<ShipTypesLoader />
							<Flex
								align={{ initial: "center", md: "start" }}
								className="main-app__content"
								direction={{ initial: "column", md: "row" }}
								ref={gridContainerRef}
							>
								{/* Grid section */}
								<Box
									className="main-app__grid-section relative"
									flexShrink={{ initial: "1", md: "0" }}
									ref={appLayoutContainerRef}
								>
									{isSharedGrid && (
										<SharedBuildCallout
											gridTableTotalWidth={gridTableTotalWidth}
										/>
									)}

									{!isSharedGrid && (
										<MessageSpinner
											initialMessage={
												isTechTreeLoading
													? t("techTree.loading")
													: t("gridTable.optimizing")
											}
											isVisible={solving}
											progressPercent={progressPercent}
											showProgress={!isTechTreeLoading}
										/>
									)}

									<ShipSelectionHeading
										gridTableTotalWidth={gridTableTotalWidth}
										isSharedGrid={isSharedGrid}
										selectedShipType={selectedShipType}
										solving={solving}
									/>

									<GridTable
										ref={appLayoutGridTableRef}
										sharedGrid={isSharedGrid}
										solving={solving}
									/>
								</Box>

								{/* Tech tree section */}
								{!isSharedGrid && (
									<Flex
										className="main-app__tech-tree-section"
										direction="column"
										ml={{ md: "5" }}
										width={
											!isLargeScreen && gridTableTotalWidth
												? `${gridTableTotalWidth}px`
												: "100%"
										}
									>
										<Suspense fallback={<TechTreeSkeleton />}>
											<TechTree
												gridTableTotalWidth={gridTableTotalWidth}
												handleOptimize={handleOptimize}
												solving={solving}
											/>
										</Suspense>
									</Flex>
								)}
							</Flex>
						</Suspense>
					</div>

					{!isLargeScreen && (
						<div className="main-app__footer-wrapper">
							<AppFooter buildDate={buildDate} buildVersion={buildVersion} />
						</div>
					)}
				</div>

				{isLargeScreen && <AppFooter buildDate={buildDate} buildVersion={buildVersion} />}

				<MainAppUtilities
					clearPatternNoFitTech={clearPatternNoFitTech}
					fileInputRef={fileInputRef}
					handleBuildNameCancel={handleBuildNameCancel}
					handleBuildNameConfirm={handleBuildNameConfirm}
					handleFileSelect={handleFileSelect}
					handleForceCurrentPnfOptimize={handleForceCurrentPnfOptimize}
					isSaveBuildDialogOpen={isSaveBuildDialogOpen}
					patternNoFitTech={patternNoFitTech}
				/>
			</main>
		</>
	);
};
