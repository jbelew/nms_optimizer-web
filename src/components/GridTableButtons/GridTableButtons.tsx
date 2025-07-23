import React, { useCallback } from "react";
import {
	InfoCircledIcon,
	QuestionMarkCircledIcon,
	ResetIcon,
	Share2Icon,
} from "@radix-ui/react-icons";
import { Button, IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useGridStore } from "../../store/GridStore";

interface GridTableButtonsProps {
	solving: boolean;
	updateUrlForShare: () => string;
	updateUrlForReset: () => void;
}

const GridTableButtons: React.FC<GridTableButtonsProps> = ({
	solving,
	updateUrlForShare,
	updateUrlForReset,
}) => {
	const isSmallAndUp = useBreakpoint("640px"); // sm breakpoint
	const { t } = useTranslation();
	const { sendEvent } = useAnalytics();

	const { openDialog, isFirstVisit, onFirstVisitInstructionsDialogOpened } = useDialog();
	const { setIsSharedGrid } = useGridStore(); // Removed initialGridDefinition
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

	const handleShowInstructions = useCallback(() => {
		openDialog("instructions");
		if (isFirstVisit) {
			onFirstVisitInstructionsDialogOpened();
		}
		sendEvent({
			category: "User Interactions",
			action: "showInstructions",
		});
	}, [openDialog, isFirstVisit, onFirstVisitInstructionsDialogOpened, sendEvent]);

	const handleShowAboutPage = useCallback(() => {
		openDialog("about");
		sendEvent({
			category: "User Interactions",
			action: "showAbout",
		});
	}, [openDialog, sendEvent]);

	const handleShareClick = useCallback(() => {
		const shareUrl = updateUrlForShare();
		openDialog(null, { shareUrl });
		sendEvent({ category: "User Interactions", action: "shareLink" });
	}, [updateUrlForShare, openDialog, sendEvent]);

	const handleResetGrid = useCallback(() => {
		sendEvent({ category: "User Interactions", action: "resetGrid" });
		useGridStore.getState().resetGrid();
		updateUrlForReset();
		setIsSharedGrid(false);
	}, [updateUrlForReset, setIsSharedGrid, sendEvent]);

	return (
		<>
			<div role="gridcell" className="col-span-6 gap-2 mt-3">
				{/* This div will contain the left-aligned buttons */}
				{isSmallAndUp ? (
					<Button
						size="2"
						variant={isFirstVisit ? "solid" : "soft"}
						className={`gridTable__button gridTable__button--instructions !mr-2 ${
							isFirstVisit ? "button--glow" : ""
						}`}
						onClick={handleShowInstructions}
						aria-label={t("buttons.instructions")}
					>
						<QuestionMarkCircledIcon />
						<span className="hidden sm:inline">{t("buttons.instructions")}</span>
					</Button>
				) : (
					<IconButton
						size="2"
						variant={isFirstVisit ? "solid" : "soft"}
						className={`gridTable__button gridTable__button--instructions !mr-2 ${
							isFirstVisit ? "button--glow" : ""
						}`}
						onClick={handleShowInstructions}
						aria-label={t("buttons.instructions")}
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
							disabled={solving || !hasModulesInGrid}
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
							disabled={solving || !hasModulesInGrid}
							aria-label={t("buttons.share")}
						>
							<Share2Icon />
						</IconButton>
					))}
			</div>

			<div role="gridcell" className="flex justify-end col-span-5 mt-3 lg:col-span-4">
				<Button
					size="2"
					className={`gridTable__button gridTable__button--reset`}
					variant="solid"
					onClick={handleResetGrid}
					disabled={solving}
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
