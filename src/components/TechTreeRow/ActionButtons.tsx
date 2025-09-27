import React from "react";
// Minor change to force re-transpilation
import { DoubleArrowLeftIcon, ResetIcon, UpdateIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip";

interface ActionButtonsProps {
	tech: string;
	hasTechInGrid: boolean;
	isGridFull: boolean;
	solving: boolean;
	translatedTechName: string;
	handleOptimizeClick: () => void;
	handleReset: () => void;
	currentCheckedModules: string[];
}

/**
 * Renders the action buttons for a tech tree row (optimize/update and reset).
 *
 * @param {ActionButtonsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered action buttons.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
	tech,
	hasTechInGrid,
	isGridFull,
	solving,
	translatedTechName,
	handleOptimizeClick,
	handleReset,
	currentCheckedModules,
}) => {
	const { t } = useTranslation();

	let tooltipLabel: string;
	if (isGridFull && !hasTechInGrid) {
		tooltipLabel = t("techTree.tooltips.gridFull");
	} else {
		tooltipLabel = hasTechInGrid ? t("techTree.tooltips.update") : t("techTree.tooltips.solve");
	}
	const OptimizeIconComponent = hasTechInGrid ? UpdateIcon : DoubleArrowLeftIcon;
	const isOptimizeButtonDisabled =
		(isGridFull && !hasTechInGrid) || solving || currentCheckedModules.length === 0;

	return (
		<>
			{/* Optimize Button */}
			<ConditionalTooltip label={tooltipLabel}>
				<IconButton
					onClick={handleOptimizeClick}
					disabled={isOptimizeButtonDisabled}
					aria-label={`${tooltipLabel} ${translatedTechName}`}
					id={tech}
					className={`techRow__resetButton ${!isOptimizeButtonDisabled ? "!cursor-pointer" : ""}`.trim()}
				>
					<OptimizeIconComponent />
				</IconButton>
			</ConditionalTooltip>

			{/* Reset Button */}
			<ConditionalTooltip label={t("techTree.tooltips.reset")}>
				<IconButton
					onClick={handleReset}
					disabled={!hasTechInGrid || solving}
					aria-label={`${t("techTree.tooltips.reset")} ${translatedTechName}`}
					className={`techRow__resetButton ${hasTechInGrid && !solving ? "!cursor-pointer" : ""}`.trim()}
				>
					<ResetIcon />
				</IconButton>
			</ConditionalTooltip>
		</>
	);
};
