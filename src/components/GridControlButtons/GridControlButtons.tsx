// RowControlButton.tsx
import React from "react";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "@/store/GridStore";

/**
 * @interface RowControlButtonProps
 * @property {number} rowIndex - The index of the row these buttons control.
 * @property {boolean} isFirstInactiveRow - True if this row is the first one that is completely inactive.
 * @property {boolean} isLastActiveRow - True if this row is the last one that has at least one active cell.
 */
interface RowControlButtonProps {
	rowIndex: number;
	isFirstInactiveRow: boolean;
	isLastActiveRow: boolean;
	isLoading?: boolean;
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
	isFirstInactiveRow,
	isLastActiveRow,
	isLoading,
}) => {
	const { t } = useTranslation();
	const isMediumOrLarger = useBreakpoint("640px"); // true if screen width >= 640px
	const iconButtonSize = isMediumOrLarger ? "2" : "1";
	const activateRow = useGridStore((state) => state.activateRow);
	const deActivateRow = useGridStore((state) => state.deActivateRow);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const gridFixed = useGridStore((state) => state.gridFixed);
	const hasAnyActiveCells = useGridStore((state) =>
		state.grid.cells.some((row) => row.some((cell) => cell.active))
	);

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
						className={`${hasModulesInGrid || gridFixed || isLoading || !hasAnyActiveCells ? "cursor-not-allowed!" : ""}`}
						onClick={() => activateRow(rowIndex)}
						disabled={hasModulesInGrid || gridFixed || isLoading || !hasAnyActiveCells}
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
						className={`${!hasModulesInGrid && !isLoading ? "cursor-pointer!" : ""}`}
						onClick={() => deActivateRow(rowIndex)}
						disabled={hasModulesInGrid || gridFixed || isLoading}
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
