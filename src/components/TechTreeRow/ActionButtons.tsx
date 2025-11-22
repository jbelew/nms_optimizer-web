import type { TechTreeRowProps } from "./TechTreeRow";
import React, { useMemo } from "react";
// Minor change to force re-transpilation
import { MagicWandIcon, ResetIcon, UpdateIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip";

import { useTechTreeRow } from "./useTechTreeRow";

interface ActionButtonsProps extends TechTreeRowProps {
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * Renders the action buttons for a tech tree row (optimize/update and reset).
 * Receives hook data from parent to avoid redundant hook calls.
 *
 * @param {ActionButtonsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered action buttons.
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

	const { tooltipLabel, OptimizeIconComponent, isOptimizeButtonDisabled } = useMemo(() => {
		let label: string;
		if (isGridFull && !hasTechInGrid) {
			label = t("techTree.tooltips.gridFull");
		} else {
			label = hasTechInGrid ? t("techTree.tooltips.update") : t("techTree.tooltips.solve");
		}
		const IconComponent = hasTechInGrid ? UpdateIcon : MagicWandIcon;
		const disabled =
			(isGridFull && !hasTechInGrid) || solving || currentCheckedModules.length === 0;

		return {
			tooltipLabel: label,
			OptimizeIconComponent: IconComponent,
			isOptimizeButtonDisabled: disabled,
		};
	}, [isGridFull, hasTechInGrid, solving, currentCheckedModules.length, t]);

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
