// src/components/MainAppContent/MainAppContent.tsx
import "./MainAppContent.scss";

import { lazy, Suspense, useEffect, useState } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Box, Callout, Flex, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { MobileToolbar } from "@/components/MobileToolbar/MobileToolbar";

import { useFetchShipTypesSuspense } from "../../hooks/useShipTypes/useShipTypes";
import { useTechTreeLoadingStore } from "../../store/tech/techTreeLoadingStore";
import AppFooter from "../AppFooter/AppFooter";
import AppHeader from "../AppHeader/AppHeader";
import { GridTable } from "../GridTable/GridTable";
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import { ShipSelection } from "../ShipSelection/ShipSelection";
import TechTree, { TechTreeSkeleton } from "../TechTree/TechTree";
import { useMainAppLogic } from "./useMainAppLogic";

const BuildNameDialog = lazy(() => import("../AppDialog/BuildName/BuildNameDialog"));
const OptimizationAlertDialog = lazy(
	() => import("../AppDialog/OptimizationAlert/OptimizationAlertDialog")
);

const ErrorMessageRenderer = lazy(() =>
	import("../ErrorMessageRenderer/ErrorMessageRenderer").then((m) => ({
		default: m.ErrorMessageRenderer,
	}))
);
const InstallPrompt = lazy(() =>
	import("../InstallPrompt/InstallPrompt").then((m) => ({ default: m.InstallPrompt }))
);
const ToastRenderer = lazy(() =>
	import("../Toast/ToastRenderer").then((m) => ({ default: m.ToastRenderer }))
);

/**
 * Inner component that triggers the ship types fetch via Suspense.
 *
 * @remarks
 * This allows the parent {@link MainAppContent} to render the header and other
 * static elements immediately, while only this part of the UI is suspended.
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
 * @example Basic usage
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
 * Props for the `SharedBuildCallout` component.
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
 * @param {SharedBuildCalloutProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered callout.
 *
 * @example Shared build view
 * ```tsx
 * <SharedBuildCallout gridTableTotalWidth={500} />
 * // renders informational callout
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
			<Callout.Root mb="3" variant="surface" size="1">
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
 * Props for the `ShipSelectionHeading` component.
 *
 * @category Components
 */
interface ShipSelectionHeadingProps {
	/** Whether the grid is in read-only shared mode. */
	isSharedGrid: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
	/** The internal identifier of the currently selected ship type. */
	selectedShipType: string;
	/** Total width of the grid table in pixels. */
	gridTableTotalWidth: number | undefined;
}

/**
 * A layout component that displays the current equipment platform and its selection control.
 *
 * @param {ShipSelectionHeadingProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered heading section.
 *
 * @example Standard header
 * ```tsx
 * <ShipSelectionHeading
 *   isSharedGrid={false}
 *   solving={false}
 *   selectedShipType="standard"
 *   gridTableTotalWidth={500}
 * />
 * // renders platform selection UI
 * ```
 */
const ShipSelectionHeading: React.FC<ShipSelectionHeadingProps> = ({
	isSharedGrid,
	solving,
	selectedShipType,
	gridTableTotalWidth,
}) => {
	const { t } = useTranslation();

	return (
		<Flex
			align="center"
			wrap="wrap"
			gap="3"
			className="main-app__ship-selector heading-styled"
			style={{
				maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined,
			}}
		>
			{!isSharedGrid && (
				<span className="main-app__ship-selection">
					<ShipSelection solving={solving} />
				</span>
			)}

			<Text
				trim="end"
				className="main-app__ship-label"
				style={{ opacity: solving ? 0.365 : 1 }}
			>
				{t("platformLabel")}
			</Text>
			<Text
				trim="end"
				className="main-app__ship-name trim-text"
				style={{ opacity: solving ? 0.365 : 1 }}
			>
				{t(`platforms.${selectedShipType}`)}
			</Text>
		</Flex>
	);
};

/**
 * Props for the `MainAppUtilities` component.
 *
 * @category Components
 */
interface MainAppUtilitiesProps {
	/** Identifier of the technology that failed pattern matching. */
	patternNoFitTech: string | null;
	/** Callback to clear the optimization failure alert. */
	clearPatternNoFitTech: () => void;
	/** Asynchronous callback to re-trigger a solve for the failed technology. */
	handleForceCurrentPnfOptimize: () => Promise<void>;
	/** Whether the build name entry modal is visible. */
	isSaveBuildDialogOpen: boolean;
	/** Callback function to save a build with the provided name. */
	handleBuildNameConfirm: (name: string) => void;
	/** Callback to dismiss the build naming modal. */
	handleBuildNameCancel: () => void;
	/** Ref to the hidden native file input used for build loading. */
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	/** Event handler for the system file picker's change event. */
	handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A container component for non-visual and global utility components.
 *
 * @param {MainAppUtilitiesProps} props - Component properties.
 *
 * @returns {JSX.Element} Fragment containing utility components.
 *
 * @example Background utilities
 * ```tsx
 * <MainAppUtilities {...props} />
 * // mounts background state managers
 * ```
 */
const MainAppUtilities: React.FC<MainAppUtilitiesProps> = ({
	patternNoFitTech,
	clearPatternNoFitTech,
	handleForceCurrentPnfOptimize,
	isSaveBuildDialogOpen,
	handleBuildNameConfirm,
	handleBuildNameCancel,
	fileInputRef,
	handleFileSelect,
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
						technologyName={patternNoFitTech}
						onClose={clearPatternNoFitTech}
						onForceOptimize={handleForceCurrentPnfOptimize}
					/>

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
		buildVersion,
		buildDate,
		isSmallScreen,
		isLargeScreen,
		isSharedGrid,
		hasModulesInGrid,
		selectedShipType,
		isVisible,
		toolbarRef,
		optimize,
		appLayout,
		saveBuild,
		loadBuild,
		handleShowChangelog,
	} = useMainAppLogic();

	const {
		solving,
		progressPercent,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	} = optimize;

	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridTableTotalWidth,
	} = appLayout;

	const {
		isSaveBuildDialogOpen,
		handleSaveBuild,
		handleBuildNameConfirm,
		handleBuildNameCancel,
	} = saveBuild;

	const { fileInputRef, handleLoadBuild, handleFileSelect } = loadBuild;

	const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);

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
					gridRef={appLayoutContainerRef}
				/>
			)}

			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded focus:bg-(--accent-9) focus:px-4 focus:py-2 focus:text-white"
			>
				Skip to main content
			</a>
			<main id="main-content" className="main-app__container">
				<div className="main-app__card lg:shadow-lg">
					<div className="main-app__background-wrapper">
						<AppHeader onShowChangelog={handleShowChangelog} />

						<Suspense
							fallback={
								<Flex
									align="center"
									justify="center"
									className="main-app__content"
									style={{ minHeight: "400px", width: "100%" }}
								>
									<MessageSpinner
										isVisible={true}
										initialMessage={t("techTree.loading")}
									/>
								</Flex>
							}
						>
							<ShipTypesLoader />
							<Flex
								direction={{ initial: "column", md: "row" }}
								align={{ initial: "center", md: "start" }}
								className="main-app__content"
								ref={gridContainerRef}
							>
								{/* Grid section */}
								<Box
									flexShrink={{ initial: "1", md: "0" }}
									className="main-app__grid-section relative"
									ref={appLayoutContainerRef}
								>
									{isSharedGrid && (
										<SharedBuildCallout
											gridTableTotalWidth={gridTableTotalWidth}
										/>
									)}

									{!isSharedGrid && (
										<MessageSpinner
											isVisible={solving}
											showProgress={!isTechTreeLoading}
											initialMessage={
												isTechTreeLoading
													? t("techTree.loading")
													: t("gridTable.optimizing")
											}
											progressPercent={progressPercent}
										/>
									)}

									<ShipSelectionHeading
										isSharedGrid={isSharedGrid}
										solving={solving}
										selectedShipType={selectedShipType}
										gridTableTotalWidth={gridTableTotalWidth}
									/>

									<GridTable
										solving={solving}
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
											<TechTree
												handleOptimize={handleOptimize}
												solving={solving}
												gridTableTotalWidth={gridTableTotalWidth}
											/>
										</Suspense>
									</Flex>
								)}
							</Flex>
						</Suspense>
					</div>

					{!isLargeScreen && (
						<div className="main-app__footer-wrapper">
							<AppFooter buildVersion={buildVersion} buildDate={buildDate} />
						</div>
					)}
				</div>

				{isLargeScreen && <AppFooter buildVersion={buildVersion} buildDate={buildDate} />}

				<MainAppUtilities
					patternNoFitTech={patternNoFitTech}
					clearPatternNoFitTech={clearPatternNoFitTech}
					handleForceCurrentPnfOptimize={handleForceCurrentPnfOptimize}
					isSaveBuildDialogOpen={isSaveBuildDialogOpen}
					handleBuildNameConfirm={handleBuildNameConfirm}
					handleBuildNameCancel={handleBuildNameCancel}
					fileInputRef={fileInputRef}
					handleFileSelect={handleFileSelect}
				/>
			</main>
		</>
	);
};
