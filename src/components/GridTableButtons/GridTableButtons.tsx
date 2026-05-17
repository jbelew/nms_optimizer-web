import "./GridTableButtons.scss";

import React, { useTransition } from "react";
import {
	CameraIcon,
	DownloadIcon,
	FileIcon,
	InfoCircledIcon,
	QuestionMarkCircledIcon,
	ResetIcon,
	Share1Icon,
} from "@radix-ui/react-icons";
import { Button, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useLoadBuild } from "@/hooks/useLoadBuild/useLoadBuild";
import { useSaveBuild } from "@/hooks/useSaveBuild/useSaveBuild";
import { useScreenshot } from "@/hooks/useScreenshot/useScreenshot";
import { useScrollGridIntoView } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useUrlSync } from "@/hooks/useUrlSync/useUrlSync";
import { useGridStore } from "@/store/grid/gridStore";
import { useDialog } from "@/utils/system/dialogUtils";

const BuildNameDialog = React.lazy(
	() => import("@/components/AppDialog/BuildName/BuildNameDialog")
);

/**
 * Props for the `GridTableButtons` component.
 *
 * @remarks
 * Defines the required data and state for managing global grid actions.
 *
 * @category Components
 */
interface GridTableButtonsProps {
	/** Ref to the grid DOM element, used for screenshot capture. */
	gridRef: React.RefObject<HTMLDivElement | null>;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * A container component for the various action buttons located below the technology grid.
 *
 * @remarks
 * It provides buttons for global grid actions, including:
 * - Opening Instructions and About dialogs.
 * - Loading and Saving `.nms` build files.
 * - Generating and opening the Share Link dialog.
 * - Resetting the entire grid to its initial state.
 *
 * The component adapts its layout for mobile and desktop, using `IconButton` on
 * small screens and full `Button` with text on larger viewports.
 *
 * @param {GridTableButtonsProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered control button area.
 *
 * @see {@link useUrlSync} for URL management.
 * @see {@link useSaveBuild} for build persistence.
 * @see {@link useLoadBuild} for build retrieval.
 * @see {@link useScreenshot} for image capture.
 * @see {@link ./GridTableButtons.test.tsx Unit Tests}
 * @see {@link ./GridTableButtons.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridTableButtons gridRef={myGridRef} solving={false} />
 * ```
 */
const GridTableButtons: React.FC<GridTableButtonsProps> = ({ gridRef, solving }) => {
	const { updateUrlForReset, updateUrlForShare } = useUrlSync();
	const isSmallAndUp = useBreakpoint("640px"); // sm breakpoint
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const [isResetPending, startResetTransition] = useTransition();
	const [isInfoPending, startInfoTransition] = useTransition();
	const [isSharePending, startShareTransition] = useTransition();

	const { markTutorialFinished, openDialog, tutorialFinished } = useDialog();
	const setIsSharedGrid = useGridStore((state) => state.setIsSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const {
		handleBuildNameCancel,
		handleBuildNameConfirm,
		handleSaveBuild,
		isSaveBuildDialogOpen,
		isSavePending,
	} = useSaveBuild();
	const { fileInputRef, handleFileSelect, handleLoadBuild, isLoadPending } = useLoadBuild();
	const { handleScreenshot, isCapturing } = useScreenshot();
	const isAbove1024 = useBreakpoint("1024px");
	const scrollOptions = { skipOnLargeScreens: false };
	const { scrollIntoView } = useScrollGridIntoView(scrollOptions);

	/**
	 * Handles the screenshot capture of the grid section.
	 *
	 * @remarks
	 * Locates the nearest grid section container and triggers the capture process.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleScreenshotClick();
	 * ```
	 */
	const handleScreenshotClick = () => {
		const section = gridRef.current?.closest<HTMLElement>(".main-app__grid-section");

		if (section) {
			handleScreenshot(section);
		}
	};

	/**
	 * Navigates to the instructions dialog and updates completion state.
	 *
	 * @remarks
	 * If the tutorial hasn't been finished, it marks it as such.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleShowInstructions();
	 * ```
	 */
	const handleShowInstructions = () => {
		startInfoTransition(() => {
			openDialog("instructions");

			if (!tutorialFinished) {
				markTutorialFinished();
			}
		});
	};

	/**
	 * Navigates to the about dialog.
	 *
	 * @remarks
	 * Triggers a transition to the "about" view.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleShowAboutPage();
	 * ```
	 */
	const handleShowAboutPage = () => {
		startInfoTransition(() => {
			openDialog("about");
		});
	};

	/**
	 * Creates a shareable link and opens the share dialog.
	 *
	 * @remarks
	 * Synchronizes the current state to the URL before opening the dialog.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleShareClick();
	 * ```
	 */
	const handleShareClick = () => {
		startShareTransition(() => {
			const shareUrl = updateUrlForShare();
			openDialog(null, { shareUrl });
		});
		sendEvent({
			action: "share",
			category: "ui",
			method: "url",
			nonInteraction: false,
			value: 1,
		});
	};

	/**
	 * Purges the current grid state and resets the URL.
	 *
	 * @remarks
	 * Also resets the "shared grid" status and scrolls the grid into view on mobile.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * handleResetGrid();
	 * ```
	 */
	const handleResetGrid = () => {
		// Scroll immediately before computations on screens < 1024px
		if (!isAbove1024) {
			scrollIntoView();
		}

		sendEvent({ action: "reset_grid", category: "ui", nonInteraction: false, value: 1 });

		startResetTransition(() => {
			useGridStore.getState().resetGrid();
			updateUrlForReset();
			setIsSharedGrid(false);
		});
	};

	const instructionsVariant = !tutorialFinished ? "solid" : "soft";
	const instructionGlowClass = !tutorialFinished ? "button--glow" : "";

	/**
	 * Internal helper to render a button that collapses to an icon on mobile.
	 *
	 * @param {React.ReactNode} icon - The icon element to display.
	 * @param {string} labelKey - i18n key for the button label.
	 * @param {() => void} onClick - Click handler.
	 * @param {boolean} disabled - Whether the button is interactive.
	 * @param {string} className - Additional CSS classes.
	 * @param {"soft" | "solid"} [variant="soft"] - Visual style variant.
	 *
	 * @returns {JSX.Element} The responsive button component.
	 *
	 * @example
	 * ```tsx
	 * renderResponsiveButton(<Icon />, "buttons.label", onClick, false, "className");
	 * ```
	 */
	const renderResponsiveButton = (
		icon: React.ReactNode,
		labelKey: string,
		onClick: () => void,
		disabled: boolean,
		className: string,
		variant: "soft" | "solid" = "soft"
	) => {
		const translatedLabel = t(labelKey);

		return isSmallAndUp ? (
			<Button
				aria-label={translatedLabel}
				className={className}
				disabled={disabled}
				onClick={onClick}
				size="2"
				variant={variant}
			>
				{icon}
				<span className="hidden sm:inline">{translatedLabel}</span>
			</Button>
		) : (
			<IconButton
				aria-label={translatedLabel}
				className={className}
				disabled={disabled}
				onClick={onClick}
				size="2"
				variant={variant}
			>
				{icon}
			</IconButton>
		);
	};

	return (
		<>
			<React.Suspense fallback={null}>
				<BuildNameDialog
					isOpen={isSaveBuildDialogOpen}
					onCancel={handleBuildNameCancel}
					onConfirm={handleBuildNameConfirm}
				/>
			</React.Suspense>
			<div className="gridTable-buttons__container" data-screenshot-exclude="true">
				<div className="gridTable-buttons__left">
					{renderResponsiveButton(
						<InfoCircledIcon />,
						"buttons.instructions",
						handleShowInstructions,
						solving || isInfoPending,
						`gridTable__button gridTable__button--instructions ${instructionGlowClass}`,
						instructionsVariant as "soft" | "solid"
					)}
					{renderResponsiveButton(
						<QuestionMarkCircledIcon />,
						"buttons.about",
						handleShowAboutPage,
						solving || isInfoPending,
						"gridTable__button gridTable__button--about"
					)}

					{/* Load/Save buttons - hidden on mobile, shown on sm and up */}
					{isSmallAndUp && !isSharedGrid && (
						<>
							<ConditionalTooltip label={t("buttons.loadBuild") ?? ""}>
								<IconButton
									aria-label={t("buttons.loadBuild")}
									className="gridTable__button gridTable__button--load"
									disabled={solving || isLoadPending}
									onClick={handleLoadBuild}
									size="2"
									variant="soft"
								>
									<FileIcon />
								</IconButton>
							</ConditionalTooltip>

							<ConditionalTooltip label={t("buttons.saveBuild") ?? ""}>
								<IconButton
									aria-label={t("buttons.saveBuild")}
									className="gridTable__button gridTable__button--save"
									disabled={solving || !hasModulesInGrid || isSavePending}
									onClick={handleSaveBuild}
									size="2"
									variant="soft"
								>
									<DownloadIcon />
								</IconButton>
							</ConditionalTooltip>
						</>
					)}

					<input
						accept=".nms"
						aria-label={t("buttons.loadBuild")}
						className="hidden"
						onChange={handleFileSelect}
						ref={fileInputRef}
						type="file"
					/>

					{/* Share button - hidden on mobile, shown on sm and up */}
					{isSmallAndUp && !isSharedGrid && (
						<ConditionalTooltip label={t("buttons.share") ?? ""}>
							<IconButton
								aria-label={t("buttons.share")}
								className="gridTable__button gridTable__button--share"
								disabled={solving || !hasModulesInGrid || isSharePending}
								onClick={handleShareClick}
								size="2"
								variant="soft"
							>
								<Share1Icon />
							</IconButton>
						</ConditionalTooltip>
					)}

					{/* Screenshot button - hidden on mobile, shown on sm and up */}
					{isSmallAndUp && (
						<ConditionalTooltip label={t("buttons.screenshot") ?? ""}>
							<IconButton
								aria-label={t("buttons.screenshot")}
								className="gridTable__button gridTable__button--screenshot"
								disabled={solving || !hasModulesInGrid || isCapturing}
								onClick={handleScreenshotClick}
								size="2"
								variant="soft"
							>
								<CameraIcon />
							</IconButton>
						</ConditionalTooltip>
					)}
				</div>

				<div className="gridTable-buttons__right">
					<Button
						aria-label={t("buttons.resetGrid")}
						className="gridTable__button gridTable__button--reset"
						disabled={solving || isResetPending}
						onClick={handleResetGrid}
						size="2"
						variant="solid"
					>
						<ResetIcon />
						{t("buttons.resetGrid")}
					</Button>
				</div>
			</div>
		</>
	);
};

GridTableButtons.displayName = "GridTableButtons";

export default GridTableButtons;
