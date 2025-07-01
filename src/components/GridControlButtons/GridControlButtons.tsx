// RowControlButton.tsx
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";
import React from "react";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";

interface RowControlButtonProps {
	rowIndex: number;
	activateRow: (rowIndex: number) => void;
	deActivateRow: (rowIndex: number) => void;
	hasModulesInGrid: boolean;
	isFirstInactiveRow: boolean;
	isLastActiveRow: boolean;
}

/**
 * A button component that allows the user to activate or deactivate a row in
 * the grid. The button is only rendered if the row is either the first inactive
 * row or the last active row. The button is also disabled if there are any
 * modules in the grid.
 *
 * @param {number} rowIndex - The index of the row containing the button.
 * @param {function} activateRow - A function to activate an entire row.
 * @param {function} deActivateRow - A function to deactivate an entire row.
 * @param {boolean} hasModulesInGrid - Whether there are any modules in the grid.
 * @param {boolean} isFirstInactiveRow - Whether the row is the first inactive row.
 * @param {boolean} isLastActiveRow - Whether the row is the last active row.
 */
const GridControlButtons: React.FC<RowControlButtonProps> = ({
	rowIndex,
	activateRow,
	deActivateRow,
	hasModulesInGrid,
	isFirstInactiveRow,
	isLastActiveRow,
}) => {
	const { t } = useTranslation();
	const isMediumOrLarger = useBreakpoint("640px"); // true if screen width >= 640px
	const iconButtonSize = isMediumOrLarger ? "2" : "1";

	return (
		<div
			className="flex items-center justify-center h-full" // Ensure full height and center content
			data-is-grid-control-column="true" // Added data attribute for selection
		>
			{isFirstInactiveRow && (
				<Tooltip content={t("gridControls.activateRow")}>
					<IconButton
						size={iconButtonSize}
						variant="surface"
						className={`shadow-sm ${!hasModulesInGrid ? "!cursor-pointer" : ""}`} // Centering handled by parent
						onClick={() => activateRow(rowIndex)}
						disabled={hasModulesInGrid}
						aria-label={t("gridControls.activateRow")}
					>
						<PlusIcon />
					</IconButton>
				</Tooltip>
			)}

			{isLastActiveRow && (
				<Tooltip content={t("gridControls.deactivateRow")}>
					<IconButton
						variant="surface"
						size={iconButtonSize}
						className={` ${!hasModulesInGrid ? "!cursor-pointer" : ""}`} // Centering handled by parent
						onClick={() => deActivateRow(rowIndex)}
						disabled={hasModulesInGrid}
						aria-label={t("gridControls.deactivateRow")}
					>
						<MinusIcon />
					</IconButton>
				</Tooltip>
			)}
		</div>
	);
};

export default GridControlButtons;
