// RowControlButton.tsx
import React from "react";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

interface RowControlButtonProps {
	rowIndex: number;
	activateRow: (rowIndex: number) => void;
	deActivateRow: (rowIndex: number) => void;
	hasModulesInGrid: boolean;
	isFirstInactiveRow: boolean;
	isLastActiveRow: boolean;
	gridFixed: boolean;
}

/**
 * GridControlButtons component provides buttons to activate or deactivate a row in the grid.
 * The buttons are conditionally rendered based on whether the row is the first inactive row or the last active row.
 * They are disabled if there are any modules in the grid or if the grid is fixed.
 *
 * @param {RowControlButtonProps} props - The props for the GridControlButtons component.
 * @returns {JSX.Element} The rendered GridControlButtons component.
 */
const GridControlButtons: React.FC<RowControlButtonProps> = ({
	rowIndex,
	activateRow,
	deActivateRow,
	hasModulesInGrid,
	isFirstInactiveRow,
	isLastActiveRow,
	gridFixed,
}) => {
	const { t } = useTranslation();
	const isMediumOrLarger = useBreakpoint("640px"); // true if screen width >= 640px
	const iconButtonSize = isMediumOrLarger ? "2" : "1";

	return (
		<div
			className="flex h-full items-center justify-center" // Ensure full height and center content
			data-is-grid-control-column="true" // Added data attribute for selection
		>
			{isFirstInactiveRow && (
				<ConditionalTooltip label={t("gridControls.activateRow")}>
					<IconButton
						size={iconButtonSize}
						radius="full"
						variant="ghost"
						className={`${!hasModulesInGrid ? "!cursor-pointer" : ""}`} // Centering handled by parent
						onClick={() => activateRow(rowIndex)}
						disabled={hasModulesInGrid || gridFixed}
						aria-label={t("gridControls.activateRow")}
					>
						<PlusIcon />
					</IconButton>
				</ConditionalTooltip>
			)}

			{isLastActiveRow && (
				<ConditionalTooltip label={t("gridControls.deactivateRow")}>
					<IconButton
						variant="ghost"
						radius="full"
						size={iconButtonSize}
						className={`${!hasModulesInGrid ? "!cursor-pointer" : ""}`} // Centering handled by parent
						onClick={() => deActivateRow(rowIndex)}
						disabled={hasModulesInGrid || gridFixed}
						aria-label={t("gridControls.deactivateRow")}
					>
						<MinusIcon />
					</IconButton>
				</ConditionalTooltip>
			)}
		</div>
	);
};

export default GridControlButtons;
