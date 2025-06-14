import {
	InfoCircledIcon,
	QuestionMarkCircledIcon,
	ResetIcon,
	Share2Icon,
} from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import React from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";

interface GridTableButtonsProps {
	onShowInstructions: () => void;
	onShowAbout: () => void; // Changed from onShowChangeLog, assuming this is for the "About" section
	onShare: () => void; // Added onShare to props interface
	onReset: () => void;
	isSharedGrid: boolean;
	hasModulesInGrid: boolean;
	solving: boolean;
	columnWidth: string;
	resetButtonPositionStyle: React.CSSProperties; // Add new prop for the style
	isFirstVisit: boolean; // Add prop for first visit
}

const GridTableButtons: React.FC<GridTableButtonsProps> = ({
	onShowInstructions,
	onShowAbout, // Use the new prop
	onShare, // Keep onShare
	onReset,
	isSharedGrid,
	hasModulesInGrid,
	solving,
	columnWidth,
	resetButtonPositionStyle, // Receive the style prop
	isFirstVisit,
}) => {
	const isSmallAndUp = useBreakpoint("640px"); // sm breakpoint
	const { t } = useTranslation();
	return (
		// Add 'relative' to establish a positioning context for the absolutely positioned reset button.
		<footer className="relative flex items-start pt-3 sm:pt-4 gridTable__footer">
			<div className="flex-1 flex-nowrap">
				{" "}
				{/* This div will contain the left-aligned buttons */}
				<Button
					size={isSmallAndUp ? "2" : "1"}
					variant={isFirstVisit ? "solid" : "soft"}
					className={`gridTable__button gridTable__button--instructions shadow-md !mr-2 p-0  ${
						isFirstVisit ? "button--glow" : ""
					}`}
					onClick={() => {
						ReactGA.event({
							category: "User Interactions",
							action: "showInstructions",
						});
						onShowInstructions();
					}}
				>
					<QuestionMarkCircledIcon />
					<span className="hidden sm:inline">{t("buttons.instructions")}</span>
				</Button>
				<Button
					size={isSmallAndUp ? "2" : "1"}
					variant="soft"
					className={`gridTable__button gridTable__button--about shadow-md !mr-2`}
					onClick={() => {
						ReactGA.event({
							category: "User Interactions",
							action: "showAbout",
						});
						onShowAbout();
					}}
				>
					<InfoCircledIcon />
					<span className="hidden sm:inline">{t("buttons.about")}</span>
				</Button>
				{!isSharedGrid && (
					<Button
						size={isSmallAndUp ? "2" : "1"}
						variant="soft"
						className="shadow-md gridTable__button gridTable__button--changelog"
						onClick={onShare}
						disabled={solving || !hasModulesInGrid}
					>
						<Share2Icon />
						<span className="hidden sm:inline">{t("buttons.share")}</span>
					</Button>
				)}
			</div>
			{/* This div will contain the Reset Grid button and be absolutely positioned. */}
			{/* Conditionally render the reset button container to avoid layout shift.
          Render if it's a shared grid (columnWidth will be "0px" correctly)
          OR if columnWidth is no longer its initial "0px" (meaning it's measured or a fallback for non-shared). */}
			{columnWidth !== "0px" && (
				<div
					className="absolute z-10" // Use 'absolute' positioning and a z-index if needed.
					style={resetButtonPositionStyle} // Apply the passed-in style object
				>
					<Button
						size={isSmallAndUp ? "2" : "1"}
						className={`gridTable__button gridTable__button--reset shadow-md`}
						variant="solid"
						onClick={onReset}
						disabled={solving}
					>
						<ResetIcon />
						<span className="font-bold">{t("buttons.resetGrid")}</span>
					</Button>
				</div>
			)}
		</footer>
	);
};

export default GridTableButtons;
