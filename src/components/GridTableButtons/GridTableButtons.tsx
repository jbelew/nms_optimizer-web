import "./GridTableButtons.scss";

import React, { useCallback, useMemo, useTransition } from "react";
import {
	InfoCircledIcon,
	QuestionMarkCircledIcon,
	ResetIcon,
	Share1Icon,
} from "@radix-ui/react-icons";
import { Button, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useLoadBuild } from "../../hooks/useLoadBuild/useLoadBuild";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useSaveBuild } from "../../hooks/useSaveBuild/useSaveBuild";
import { useScrollGridIntoView } from "../../hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useToast } from "../../hooks/useToast/useToast";
import { useUrlSync } from "../../hooks/useUrlSync/useUrlSync";
import { useGridStore } from "../../store/GridStore";
import BuildNameDialog from "../AppDialog/BuildNameDialog";
import { ConditionalTooltip } from "../ConditionalTooltip";
import { DownloadIcon } from "../Icons/DownloadIcon";
import { UploadIcon } from "../Icons/UploadIcon";

/**
 * GridTableButtons component provides a set of control buttons for the grid.
 * These include buttons for showing instructions, about page, sharing the grid, and resetting the grid.
 *
 * @returns {JSX.Element} The rendered GridTableButtons component.
 */
const GridTableButtons: React.FC = () => {
	const { solving } = useOptimize();
	const { updateUrlForShare, updateUrlForReset } = useUrlSync();
	const isSmallAndUp = useBreakpoint("640px"); // sm breakpoint
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const [isResetPending, startResetTransition] = useTransition();
	const [isInfoPending, startInfoTransition] = useTransition();
	const [isSharePending, startShareTransition] = useTransition();

	const { openDialog, tutorialFinished, markTutorialFinished } = useDialog();
	const { setIsSharedGrid } = useGridStore();
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const { showSuccess, showError } = useToast();
	const {
		isSaveBuildDialogOpen,
		handleSaveBuild,
		handleBuildNameConfirm,
		handleBuildNameCancel,
		isSavePending,
	} = useSaveBuild();
	const { fileInputRef, handleLoadBuild, handleFileSelect, isLoadPending } = useLoadBuild({
		showSuccess,
		showError,
	});
	const isAbove1024 = useBreakpoint("1024px");
	const scrollOptions = useMemo(() => ({ skipOnLargeScreens: false }), []);
	const { scrollIntoView } = useScrollGridIntoView(scrollOptions);

	/**
	 * Handles the click event for the "Instructions" button.
	 * Opens the instructions dialog and marks the tutorial as finished if it wasn't already.
	 */
	const handleShowInstructions = useCallback(() => {
		startInfoTransition(() => {
			openDialog("instructions");

			if (!tutorialFinished) {
				markTutorialFinished();
			}
		});
		sendEvent({
			category: "ui",
			action: "show_instructions",
			value: 1,
		});
	}, [openDialog, tutorialFinished, markTutorialFinished, sendEvent, startInfoTransition]);

	/**
	 * Handles the click event for the "About" button.
	 * Opens the about dialog.
	 */
	const handleShowAboutPage = useCallback(() => {
		startInfoTransition(() => {
			openDialog("about");
		});
		sendEvent({
			category: "ui",
			action: "show_about",
			value: 1,
		});
	}, [openDialog, sendEvent, startInfoTransition]);

	/**
	 * Handles the click event for the "Share" button.
	 * Generates a shareable URL and opens the share link dialog.
	 */
	const handleShareClick = useCallback(() => {
		startShareTransition(() => {
			const shareUrl = updateUrlForShare();
			openDialog(null, { shareUrl });
		});
		sendEvent({ category: "ui", action: "share_link", value: 1 });
	}, [updateUrlForShare, openDialog, sendEvent, startShareTransition]);

	/**
	 * Handles the click event for the "Reset Grid" button.
	 * Scrolls first (on small screens only), then resets the grid to its initial state and updates the URL.
	 */
	const handleResetGrid = useCallback(() => {
		// Scroll immediately before computations on screens < 1024px
		if (!isAbove1024) {
			scrollIntoView();
		}

		sendEvent({ category: "ui", action: "reset_grid", value: 1 });

		startResetTransition(() => {
			useGridStore.getState().resetGrid();
			updateUrlForReset();
			setIsSharedGrid(false);
		});
	}, [
		updateUrlForReset,
		setIsSharedGrid,
		sendEvent,
		scrollIntoView,
		isAbove1024,
		startResetTransition,
	]);

	const instructionsVariant = !tutorialFinished ? "solid" : "soft";
	const instructionGlowClass = !tutorialFinished ? "button--glow" : "";

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
			<BuildNameDialog
				isOpen={isSaveBuildDialogOpen}
				onConfirm={handleBuildNameConfirm}
				onCancel={handleBuildNameCancel}
			/>
			<div className="gridTable-buttons__container">
				<div className="gridTable-buttons__left">
					{renderResponsiveButton(
						<InfoCircledIcon />,
						"buttons.instructions",
						handleShowInstructions,
						isInfoPending,
						`gridTable__button gridTable__button--instructions ${instructionGlowClass}`,
						instructionsVariant as "soft" | "solid"
					)}
					{renderResponsiveButton(
						<QuestionMarkCircledIcon />,
						"buttons.about",
						handleShowAboutPage,
						isInfoPending,
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
									<UploadIcon weight="light" size={20} />
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
									<DownloadIcon weight="light" size={20} />
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

export default GridTableButtons;
