import React, { useCallback, useTransition } from "react";
import {
	InfoCircledIcon,
	QuestionMarkCircledIcon,
	ResetIcon,
	Share2Icon,
} from "@radix-ui/react-icons";
import { Button, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useUrlSync } from "../../hooks/useUrlSync/useUrlSync";
import { useGridStore } from "../../store/GridStore";

/**
 * GridTableButtons component provides a set of control buttons for the grid.
 * These include buttons for showing instructions, about page, sharing the grid, and resetting the grid.
 *
 * @returns {JSX.Element} The rendered GridTableButtons component.
 */
const GridTableButtons: React.FC = () => {
	const { solving, gridContainerRef } = useOptimize();
	const { updateUrlForShare, updateUrlForReset } = useUrlSync();
	const isSmallAndUp = useBreakpoint("140px"); // sm breakpoint
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();
	const [isResetPending, startResetTransition] = useTransition();
	const [isInfoPending, startInfoTransition] = useTransition();
	const [isSharePending, startShareTransition] = useTransition();

	const { openDialog, tutorialFinished, markTutorialFinished } = useDialog();
	const { setIsSharedGrid } = useGridStore(); // Removed initialGridDefinition
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

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

	return (
		<>
			<div role="gridcell" className="col-span-6 mt-3 gap-2">
				{/* This div will contain the left-aligned buttons */}
				{isSmallAndUp ? (
					<Button
						size="2"
						variant={!tutorialFinished ? "solid" : "soft"}
						className={`gridTable__button gridTable__button--instructions !mr-2 ${
							!tutorialFinished ? "button--glow" : ""
						}`}
						onClick={handleShowInstructions}
						aria-label={t("buttons.instructions")}
						disabled={isInfoPending}
					>
						<QuestionMarkCircledIcon />
						<span className="hidden sm:inline">{t("buttons.instructions")}</span>
					</Button>
				) : (
					<IconButton
						size="2"
						variant={!tutorialFinished ? "solid" : "soft"}
						className={`gridTable__button gridTable__button--instructions !mr-2 ${
							!tutorialFinished ? "button--glow" : ""
						}`}
						onClick={handleShowInstructions}
						aria-label={t("buttons.instructions")}
						disabled={isInfoPending}
					>
						<QuestionMarkCircledIcon />
					</IconButton>
				)}
				{isSmallAndUp ? (
					<Button
						size="2"
						variant="soft"
						className={`gridTable__button gridTable__button--about !mr-2`}
						onClick={handleShowAboutPage}
						aria-label={t("buttons.about")}
						disabled={isInfoPending}
					>
						<InfoCircledIcon />
						<span className="hidden sm:inline">{t("buttons.about")}</span>
					</Button>
				) : (
					<IconButton
						size="2"
						variant="soft"
						className={`gridTable__button gridTable__button--about !mr-2`}
						onClick={handleShowAboutPage}
						aria-label={t("buttons.about")}
						disabled={isInfoPending}
					>
						<InfoCircledIcon />
					</IconButton>
				)}
				{!isSharedGrid &&
					(isSmallAndUp ? (
						<Button
							size="2"
							variant="soft"
							className="gridTable__button gridTable__button--changelog"
							onClick={handleShareClick}
							disabled={solving || !hasModulesInGrid || isSharePending}
							aria-label={t("buttons.share")}
						>
							<Share2Icon />
							<span className="hidden sm:inline">{t("buttons.share")}</span>
						</Button>
					) : (
						<IconButton
							size="2"
							variant="soft"
							className="gridTable__button gridTable__button--changelog"
							onClick={handleShareClick}
							disabled={solving || !hasModulesInGrid || isSharePending}
							aria-label={t("buttons.share")}
						>
							<Share2Icon />
						</IconButton>
					))}
			</div>

			<div role="gridcell" className="col-span-5 mt-3 flex justify-end lg:col-span-4">
				<Button
					size="2"
					className={`gridTable__button gridTable__button--reset`}
					variant="solid"
					onClick={handleResetGrid}
					disabled={solving || isResetPending}
					aria-label={t("buttons.resetGrid")}
				>
					<ResetIcon />
					{t("buttons.resetGrid")}
				</Button>
			</div>
		</>
	);
};

export default GridTableButtons;
