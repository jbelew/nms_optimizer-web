import type { TechTreeRowProps } from "./TechTreeRow";
import React from "react";
import { MagicWandIcon, ResetIcon, UpdateIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";

import { TechTreeRow } from "./TechTreeRow";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the `ActionButtons` component.
 *
 * @category Components
 */
interface ActionButtonsProps extends TechTreeRowProps {
	/**
	 * Consolidated state and handlers from the `useTechTreeRow` hook.
	 *
	 * Includes flags for loading states, tech presence, and event handlers
	 * for optimization and reset actions.
	 */
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * Primary interaction buttons for a technology row.
 *
 * @remarks
 * This component provides two main action buttons for managing a specific technology:
 * 1. **Optimize/Update**: Triggers the solver to find the best placement or update existing modules.
 * 2. **Reset**: Removes all instances of the technology from the grid.
 *
 * It intelligently calculates disabled states and dynamic tooltips using
 * {@link ConditionalTooltip} based on the current grid capacity and technology presence.
 *
 * @param {ActionButtonsProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered action buttons container.
 *
 * @see {@link TechTreeRow} for the parent row component.
 * @see {@link useTechTreeRow} for the underlying logic.
 * @see {@link ./TechTreeRow.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * // Inside a TechTreeRow
 * <ActionButtons
 *   tech="solar"
 *   isGridFull={false}
 *   hookData={hookData}
 * />
 * ```
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
