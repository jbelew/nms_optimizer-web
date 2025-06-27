import {
	InfoCircledIcon,
	QuestionMarkCircledIcon,
	ResetIcon,
	Share2Icon,
} from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import React, { useCallback } from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useDialog } from "../../context/dialog-utils";
import { useGridStore, selectHasModulesInGrid } from "../../store/GridStore";

interface GridTableButtonsProps {
	solving: boolean;
	resetGridAction: () => void;
	updateUrlForShare: () => string;
	updateUrlForReset: () => void;
}

const GridTableButtons: React.FC<GridTableButtonsProps> = ({
	solving,
	resetGridAction,
	updateUrlForShare,
	updateUrlForReset,
}) => {
	const isSmallAndUp = useBreakpoint("640px"); // sm breakpoint
	const { t } = useTranslation();

	const { openDialog, isFirstVisit, onFirstVisitInstructionsDialogOpened } = useDialog();
	const { setIsSharedGrid } = useGridStore();
	const hasModulesInGrid = useGridStore(selectHasModulesInGrid);
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

	const handleShowInstructions = useCallback(() => {
		openDialog("instructions");
		if (isFirstVisit) {
			onFirstVisitInstructionsDialogOpened();
		}
		ReactGA.event({
			category: "User Interactions",
			action: "showInstructions",
		});
	}, [openDialog, isFirstVisit, onFirstVisitInstructionsDialogOpened]);

	const handleShowAboutPage = useCallback(() => {
		openDialog("about");
		ReactGA.event({
			category: "User Interactions",
			action: "showAbout",
		});
	}, [openDialog]);

	const handleShareClick = useCallback(() => {
		const shareUrl = updateUrlForShare();
		const newWindow = window.open(shareUrl, "_blank", "noopener,noreferrer");
		ReactGA.event({ category: "User Interactions", action: "shareLink" });
		if (newWindow) newWindow.focus();
	}, [updateUrlForShare]);

	const handleResetGrid = useCallback(() => {
		ReactGA.event({ category: "User Interactions", action: "resetGrid" });
		resetGridAction();
		updateUrlForReset();
		setIsSharedGrid(false);
	}, [resetGridAction, setIsSharedGrid, updateUrlForReset]);

	return (
		<>
			<div role="gridcell" className="col-span-7 mt-2 sm:mt-3">
				{/* This div will contain the left-aligned buttons */}
				<Button
					size={isSmallAndUp ? "2" : "1"}
					variant={isFirstVisit ? "solid" : "soft"}
					className={`gridTable__button gridTable__button--instructions shadow-md !mr-2 p-0  ${
						isFirstVisit ? "button--glow" : ""
					}`}
					onClick={handleShowInstructions}
					aria-label={t("buttons.instructions")}
				>
					<QuestionMarkCircledIcon />
					<span className="hidden sm:inline">{t("buttons.instructions")}</span>
				</Button>
				<Button
					size={isSmallAndUp ? "2" : "1"}
					variant="soft"
					className={`gridTable__button gridTable__button--about shadow-md !mr-2`}
					onClick={handleShowAboutPage}
					aria-label={t("buttons.about")}
				>
					<InfoCircledIcon />
					<span className="hidden sm:inline">{t("buttons.about")}</span>
				</Button>
				{!isSharedGrid && (
					<Button
						size={isSmallAndUp ? "2" : "1"}
						variant="soft"
						className="shadow-md gridTable__button gridTable__button--changelog"
						onClick={handleShareClick}
						disabled={solving || !hasModulesInGrid}
						aria-label={t("buttons.share")}
					>
						<Share2Icon />
						<span className="hidden sm:inline">{t("buttons.share")}</span>
					</Button>
				)}
			</div>

			<div role="gridcell" className="flex justify-end col-span-3 mt-2 sm:mt-3">
				<Button
					size={isSmallAndUp ? "2" : "1"}
					className={`gridTable__button gridTable__button--reset shadow-md`}
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
