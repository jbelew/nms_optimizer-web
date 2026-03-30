import type { TechTreeRowProps } from "./TechTreeRow";
import React from "react";
import { MagicWandIcon, ResetIcon, UpdateIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";

import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the `ActionButtons` component.
 */
interface ActionButtonsProps extends TechTreeRowProps {
	/** Consolidated state and handlers from the `useTechTreeRow` hook. */
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * A component that renders the primary interaction buttons for a technology row.
 *
 * It provides two buttons:
 * 1. **Optimize/Update**: Triggers the solver or updates the existing layout.
 * 2. **Reset**: Removes all instances of the technology from the grid.
 *
 * It intelligently calculates its own disabled states and tooltip messages
 * based on whether the grid is full or if the tech is already present.
 *
 * @param {ActionButtonsProps} props - Component properties.
 * @returns {JSX.Element} The rendered optimize and reset buttons.
 *
 * @example
 * <ActionButtons {...props} hookData={hookData} />
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({ hookData, isGridFull, tech }) => {
	const { t } = useTranslation();
	const {
		hasTechInGrid,
		solving,
		translatedTechName,
		handleOptimizeClick,
		handleReset,
		currentCheckedModules,
		isResetting,
	} = hookData;

	let tooltipLabel: string;

	if (isGridFull && !hasTechInGrid) {
		tooltipLabel = t("techTree.tooltips.gridFull");
	} else {
		tooltipLabel = hasTechInGrid ? t("techTree.tooltips.update") : t("techTree.tooltips.solve");
	}

	const OptimizeIconComponent = hasTechInGrid ? UpdateIcon : MagicWandIcon;
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
					className={`techRow__resetButton ${!isOptimizeButtonDisabled ? "cursor-pointer!" : ""}`.trim()}
				>
					<OptimizeIconComponent />
				</IconButton>
			</ConditionalTooltip>

			{/* Reset Button */}
			<ConditionalTooltip label={t("techTree.tooltips.reset")}>
				<IconButton
					onClick={handleReset}
					disabled={!hasTechInGrid || solving || isResetting}
					aria-label={`${t("techTree.tooltips.reset")} ${translatedTechName}`}
					className={`techRow__resetButton ${hasTechInGrid && !solving ? "cursor-pointer!" : ""}`.trim()}
				>
					<ResetIcon />
				</IconButton>
			</ConditionalTooltip>
		</>
	);
};
