// RowControlButton.tsx
import type { GridStore } from "@/store/grid/gridStore";
import React from "react";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechTreeLoadingStore } from "@/store/tech/techTreeLoadingStore";

import { useGridRowState } from "./useGridRowState";

/**
 * Selector function to check if the grid contains any active (highlighted) cells.
 *
 * @remarks
 * Used to determine if the expansion controls should be enabled.
 *
 * @category Selectors
 *
 * @example
 * ```ts
 * const hasAnyActiveCells = selectHasAnyActiveCells(store.getState());
 * ```
 */
const selectHasAnyActiveCells = (state: GridStore) =>
	state.grid.cells.some((row) => row.some((cell) => cell.active));

/**
 * Props for the {@link GridControlButtons} component.
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
 * @param {RowControlButtonProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered row control buttons.
 *
 * @see {@link RowControlButtonProps}
 * @see {@link useGridRowState}
 * @see {@link useGridStore}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridControlButtons rowIndex={5} isLoading={false} />
 * ```
 */
const GridControlButtons: React.FC<RowControlButtonProps> = ({ rowIndex }) => {
	const { isFirstInactiveRow, isLastActiveRow } = useGridRowState(rowIndex);
	const { t } = useTranslation();
	const isMediumOrLarger = useBreakpoint("640px"); // true if screen width >= 640px
	const activateRow = useGridStore((state) => state.activateRow);
	const deActivateRow = useGridStore((state) => state.deActivateRow);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const gridFixed = useGridStore((state) => state.gridFixed);
	const hasAnyActiveCells = useGridStore(selectHasAnyActiveCells);
	const isLoading = useTechTreeLoadingStore((state) => state.isLoading);

	return (
		<div
			className="flex h-full items-center justify-center" // Ensure full height and center content
			data-is-grid-control-column="true" // Added data attribute for selection
		>
			{isFirstInactiveRow && hasAnyActiveCells && (
				<ConditionalTooltip label={t("gridControls.activateRow")}>
					<IconButton
						size="1"
						radius="full"
						variant="ghost"
						color="green"
						className={`${hasModulesInGrid || gridFixed || isLoading || !hasAnyActiveCells ? "cursor-not-allowed!" : ""}`}
						onClick={() => activateRow(rowIndex)}
						disabled={hasModulesInGrid || gridFixed || isLoading || !hasAnyActiveCells}
						aria-label={t("gridControls.activateRow")}
					>
						{isMediumOrLarger ? (
							<PlusCircledIcon width="20" height="20" className="shrink-0" />
						) : (
							<PlusCircledIcon className="shrink-0" />
						)}
					</IconButton>
				</ConditionalTooltip>
			)}

			{isLastActiveRow && hasAnyActiveCells && (
				<ConditionalTooltip label={t("gridControls.deactivateRow")}>
					<IconButton
						variant="ghost"
						radius="full"
						size="1"
						color="red"
						className={`${!hasModulesInGrid && !isLoading ? "cursor-pointer!" : ""}`}
						onClick={() => deActivateRow(rowIndex)}
						disabled={hasModulesInGrid || gridFixed || isLoading}
						aria-label={t("gridControls.deactivateRow")}
					>
						{isMediumOrLarger ? (
							<MinusCircledIcon width="20" height="20" className="shrink-0" />
						) : (
							<MinusCircledIcon className="shrink-0" />
						)}
					</IconButton>
				</ConditionalTooltip>
			)}
		</div>
	);
};

export default GridControlButtons;
