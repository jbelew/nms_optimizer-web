// RowControlButton.tsx
import React from "react";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { getRowControlEligibility } from "@/store/grid/gridRules";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechTreeLoadingStore } from "@/store/ui/uiStore";

/**
 * Props for the {@link GridControlButtons} component.
 *
 * @remarks
 * Defines the required data for identifying the target row for control actions.
 *
 * @category Components
 */
interface RowControlButtonProps {
	/** The zero-based index of the row being controlled. **Must be a valid row index.** */
	rowIndex: number;
}

/**
 * A component that provides contextual row-level controls for the technology grid.
 *
 * @remarks
 * It renders a "Plus" button to activate the first inactive row, or a "Minus"
 * button to deactivate the last active row. These buttons allow users to quickly
 * expand or shrink their available grid space.
 *
 * The buttons are automatically disabled if:
 * - The grid contains technology modules.
 * - The layout is locked.
 * - Data is loading.
 *
 * @param props - Component properties.
 *
 * @returns The rendered row control buttons.
 *
 * @see {@link RowControlButtonProps}
 * @see {@link getRowControlEligibility}
 * @see {@link useGridStore}
 * @see {@link ./GridControlButtons.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridControlButtons rowIndex={5} />
 * ```
 */
const GridControlButtons: React.FC<RowControlButtonProps> = ({ rowIndex }) => {
	const { t } = useTranslation();
	const isMediumOrLarger = useBreakpoint("640px"); // true if screen width >= 640px
	const activateRow = useGridStore((state) => state.activateRow);
	const deActivateRow = useGridStore((state) => state.deActivateRow);
	const firstInactiveRowIndex = useGridStore((state) => state.firstInactiveRowIndex);
	const lastActiveRowIndex = useGridStore((state) => state.lastActiveRowIndex);
	const totalRows = useGridStore((state) => state.grid.cells.length);
	const hasModulesInGrid = useGridStore((state) => state.hasModulesInGrid);
	const gridFixed = useGridStore((state) => state.gridFixed);
	const isLoading = useTechTreeLoadingStore((state) => state.isLoading);

	const { canActivateRow, canDeactivateRow } = getRowControlEligibility({
		firstInactiveRowIndex,
		lastActiveRowIndex,
		rowIndex,
		totalRows,
	});
	const isControlDisabled = hasModulesInGrid || gridFixed || isLoading;

	return (
		<div
			className="flex h-full items-center justify-center" // Ensure full height and center content
			data-is-grid-control-column="true" // Added data attribute for selection
		>
			{canActivateRow && (
				<ConditionalTooltip label={t("gridControls.activateRow")}>
					<IconButton
						aria-label={t("gridControls.activateRow")}
						className={`${isControlDisabled ? "cursor-not-allowed!" : ""}`}
						color="green"
						disabled={isControlDisabled}
						onClick={() => activateRow(rowIndex)}
						radius="full"
						size="1"
						variant="ghost"
					>
						{isMediumOrLarger ?
							<PlusCircledIcon
								className="shrink-0"
								height="20"
								width="20"
							/>
						:	<PlusCircledIcon className="shrink-0" />}
					</IconButton>
				</ConditionalTooltip>
			)}

			{canDeactivateRow && (
				<ConditionalTooltip label={t("gridControls.deactivateRow")}>
					<IconButton
						aria-label={t("gridControls.deactivateRow")}
						className={`${!hasModulesInGrid && !isLoading ? "cursor-pointer!" : ""}`}
						color="red"
						disabled={isControlDisabled}
						onClick={() => deActivateRow(rowIndex)}
						radius="full"
						size="1"
						variant="ghost"
					>
						{isMediumOrLarger ?
							<MinusCircledIcon
								className="shrink-0"
								height="20"
								width="20"
							/>
						:	<MinusCircledIcon className="shrink-0" />}
					</IconButton>
				</ConditionalTooltip>
			)}
		</div>
	);
};

export default GridControlButtons;
