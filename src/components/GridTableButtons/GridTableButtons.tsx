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

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useLoadBuild } from "../../hooks/useLoadBuild/useLoadBuild";
import { useSaveBuild } from "../../hooks/useSaveBuild/useSaveBuild";
import { useScreenshot } from "../../hooks/useScreenshot/useScreenshot";
import { useScrollGridIntoView } from "../../hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useUrlSync } from "../../hooks/useUrlSync/useUrlSync";
import { useGridStore } from "../../store/grid/gridStore";
import { useDialog } from "../../utils/system/dialogUtils";
import { ConditionalTooltip } from "../ConditionalTooltip/ConditionalTooltip";

const BuildNameDialog = React.lazy(() => import("../AppDialog/BuildName/BuildNameDialog"));

/**
 * Props for the `GridTableButtons` component.
 */
interface GridTableButtonsProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
	/** Ref to the grid DOM element, used for screenshot capture. */
	gridRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * A container component for the various action buttons located below the technology grid.
 *
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
 * @example
 * <GridTableButtons solving={false} />
 */
const GridTableButtons: React.FC<GridTableButtonsProps> = ({ solving, gridRef }) => {
	const { updateUrlForShare, updateUrlForReset } = useUrlSync();
	const isSmallAndUp = useBreakpoint("640px"); // sm breakpoint
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const [isResetPending, startResetTransition] = useTransition();
	const [isInfoPending, startInfoTransition] = useTransition();
	const [isSharePending, startShareTransition] = useTransition();

	const { openDialog, tutorialFinished, markTutorialFinished } = useDialog();
	const setIsSharedGrid = useGridStore((state) => state.setIsSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const {
		isSaveBuildDialogOpen,
		handleSaveBuild,
		handleBuildNameConfirm,
		handleBuildNameCancel,
		isSavePending,
	} = useSaveBuild();
	const { fileInputRef, handleLoadBuild, handleFileSelect, isLoadPending } = useLoadBuild();
	const { handleScreenshot, isCapturing } = useScreenshot();
	const isAbove1024 = useBreakpoint("1024px");
	const scrollOptions = { skipOnLargeScreens: false };
	const { scrollIntoView } = useScrollGridIntoView(scrollOptions);

	const handleScreenshotClick = () => {
		const section = gridRef.current?.closest<HTMLElement>(".main-app__grid-section");

		if (section) {
			handleScreenshot(section);
		}
	};

	/**
	 * Navigates to the instructions dialog and updates completion state.
	 *
	 * @example
	 * handleShowInstructions();
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
	 * @example
	 * handleShowAboutPage();
	 */
	const handleShowAboutPage = () => {
		startInfoTransition(() => {
			openDialog("about");
		});
	};

	/**
	 * Creates a shareable link and opens the share dialog.
	 *
	 * @example
	 * handleShareClick();
	 */
	const handleShareClick = () => {
		startShareTransition(() => {
			const shareUrl = updateUrlForShare();
			openDialog(null, { shareUrl });
		});
		sendEvent({
			category: "ui",
			action: "share",
			method: "url",
			value: 1,
			nonInteraction: false,
		});
	};

	/**
	 * Purges the current grid state and resets the URL.
	 *
	 * @example
	 * handleResetGrid();
	 */
	const handleResetGrid = () => {
		// Scroll immediately before computations on screens < 1024px
		if (!isAbove1024) {
			scrollIntoView();
		}

		sendEvent({ category: "ui", action: "reset_grid", value: 1, nonInteraction: false });

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
	 * @example
	 * renderResponsiveButton(<Icon />, "buttons.label", onClick, false, "className");
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
				size="2"
				variant={variant}
				className={className}
				onClick={onClick}
				aria-label={translatedLabel}
				disabled={disabled}
			>
				{icon}
				<span className="hidden sm:inline">{translatedLabel}</span>
			</Button>
		) : (
			<IconButton
				size="2"
				variant={variant}
				className={className}
				onClick={onClick}
				aria-label={translatedLabel}
				disabled={disabled}
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
					onConfirm={handleBuildNameConfirm}
					onCancel={handleBuildNameCancel}
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
									size="2"
									variant="soft"
									className="gridTable__button gridTable__button--load"
									onClick={handleLoadBuild}
									disabled={solving || isLoadPending}
									aria-label={t("buttons.loadBuild")}
								>
									<FileIcon />
								</IconButton>
							</ConditionalTooltip>

							<ConditionalTooltip label={t("buttons.saveBuild") ?? ""}>
								<IconButton
									size="2"
									variant="soft"
									className="gridTable__button gridTable__button--save"
									onClick={handleSaveBuild}
									disabled={solving || !hasModulesInGrid || isSavePending}
									aria-label={t("buttons.saveBuild")}
								>
									<DownloadIcon />
								</IconButton>
							</ConditionalTooltip>
						</>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept=".nms"
						onChange={handleFileSelect}
						className="hidden"
						aria-label={t("buttons.loadBuild")}
					/>

					{/* Share button - hidden on mobile, shown on sm and up */}
					{isSmallAndUp && !isSharedGrid && (
						<ConditionalTooltip label={t("buttons.share") ?? ""}>
							<IconButton
								size="2"
								variant="soft"
								className="gridTable__button gridTable__button--share"
								onClick={handleShareClick}
								disabled={solving || !hasModulesInGrid || isSharePending}
								aria-label={t("buttons.share")}
							>
								<Share1Icon />
							</IconButton>
						</ConditionalTooltip>
					)}

					{/* Screenshot button - hidden on mobile, shown on sm and up */}
					{isSmallAndUp && (
						<ConditionalTooltip label={t("buttons.screenshot") ?? ""}>
							<IconButton
								size="2"
								variant="soft"
								className="gridTable__button gridTable__button--screenshot"
								onClick={handleScreenshotClick}
								disabled={solving || !hasModulesInGrid || isCapturing}
								aria-label={t("buttons.screenshot")}
							>
								<CameraIcon />
							</IconButton>
						</ConditionalTooltip>
					)}
				</div>

				<div className="gridTable-buttons__right">
					<Button
						size="2"
						className="gridTable__button gridTable__button--reset"
						variant="solid"
						onClick={handleResetGrid}
						disabled={solving || isResetPending}
						aria-label={t("buttons.resetGrid")}
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
