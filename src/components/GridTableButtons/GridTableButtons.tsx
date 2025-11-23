import React, { useCallback, useTransition } from "react";
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
import { useToast } from "../../hooks/useToast/useToast";
import { useUrlSync } from "../../hooks/useUrlSync/useUrlSync";
import { useGridStore } from "../../store/GridStore";
import BuildNameDialog from "../AppDialog/BuildNameDialog";
import { ConditionalTooltip } from "../ConditionalTooltip";
import { DownloadIcon } from "../Icons/DownloadIcon";
import { UploadIcon } from "../Icons/UploadIcon";
import { NmsToast } from "../Toast/Toast";

/**
 * GridTableButtons component provides a set of control buttons for the grid.
 * These include buttons for showing instructions, about page, sharing the grid, and resetting the grid.
 *
 * @returns {JSX.Element} The rendered GridTableButtons component.
 */
const GridTableButtons: React.FC = () => {
	const { solving, gridContainerRef } = useOptimize();
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
	const { toastConfig, isOpen: isToastOpen, closeToast, showSuccess, showError } = useToast();
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
	 * Resets the grid to its initial state, updates the URL, and scrolls to the top of the grid.
	 */
	const handleResetGrid = useCallback(() => {
		sendEvent({ category: "ui", action: "reset_grid", value: 1 });

		startResetTransition(() => {
			useGridStore.getState().resetGrid();
			updateUrlForReset();
			setIsSharedGrid(false);
		});

		if (gridContainerRef.current) {
			const element = gridContainerRef.current;
			const offset = 8; // Same offset as in useOptimize.tsx and useRecommendedBuild.tsx

			const scrollIntoView = () => {
				requestAnimationFrame(() => {
					const elementRect = element.getBoundingClientRect();
					const absoluteElementTop = elementRect.top + window.pageYOffset;
					const targetScrollPosition = absoluteElementTop - offset;

					window.scrollTo({
						top: targetScrollPosition,
						behavior: "smooth",
					});
				});
			};
			requestAnimationFrame(scrollIntoView);
		}
	}, [updateUrlForReset, setIsSharedGrid, sendEvent, gridContainerRef, startResetTransition]);

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
			<div role="gridcell" className="col-span-6 mt-3 flex gap-2">
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
				{isSmallAndUp && (
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

				{!isSharedGrid && (
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

			<div role="gridcell" className="col-span-5 mt-3 flex justify-end gap-2 lg:col-span-4">
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
		</>
	);
};

export default GridTableButtons;
