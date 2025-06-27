// src/components/GridTable/GridTable.tsx
import "./GridTable.css";

import React, { useMemo } from "react"; // Removed useCallback
import { useTranslation } from "react-i18next";
// import ReactGA from "react-ga4"; // No longer used directly here

import { type Grid, selectHasModulesInGrid, useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";
import ShakingWrapper from "../GridShake/GridShake";
import MessageSpinner from "../MessageSpinner/MessageSpinner";

import GridTableButtons from "../GridTableButtons/GridTableButtons";
interface GridTableProps {
	grid: Grid | null | undefined;
	resetGridAction: () => void;
	activateRow: (rowIndex: number) => void;
	deActivateRow: (rowIndex: number) => void;
	solving: boolean;
	shared: boolean; // This is isSharedGridProp, used for GridCell
	updateUrlForShare: () => string;
	updateUrlForReset: () => void;
}

/**
 * A table component that displays a grid of cells, where each cell can be in
 * one of three states: normal, active, or supercharged. The component also
 * renders control buttons for rows.
 *
 * @param {GridTableProps} props - The props for the component.
 * @param {Grid | null | undefined} props.grid - The grid data to display.
 * @param {(rowIndex: number) => void} props.activateRow - Function to activate an entire row.
 * @param {(rowIndex: number) => void} props.deActivateRow - Function to deactivate an entire row.
 * @param {boolean} props.solving - Indicates if an optimization calculation is in progress.
 * @param {boolean} props.shared - Indicates if the grid is in a shared/read-only state.
 */
const GridTableInternal = React.forwardRef<HTMLDivElement, GridTableProps>(
	(
		{
			grid,
			activateRow,
			deActivateRow,
			solving,
			shared: isSharedGridProp,
			resetGridAction,
			updateUrlForShare,
			updateUrlForReset,
		},
		ref
	) => {
		const { shaking } = useShakeStore();
		const { t } = useTranslation();
		const hasModulesInGrid = useGridStore(selectHasModulesInGrid);

		// Calculate derived values from the grid.
		const { firstInactiveRowIndex, lastActiveRowIndex } = useMemo(
			() => {
				if (!grid || !grid.cells) {
					// Return default values if grid is not available
					return { firstInactiveRowIndex: -1, lastActiveRowIndex: -1 };
				}
				return {
					firstInactiveRowIndex: grid.cells.findIndex((r) => r.every((cell) => !cell.active)),
					lastActiveRowIndex: grid.cells
						.map((r) => r.some((cell) => cell.active))
						.lastIndexOf(true),
				};
			},
			[grid] // Depend on the whole grid object for safety
		);

		// Early return if grid is not available. This is now safe as hooks are called above.
		if (!grid || !grid.cells) {
			// Render a minimal div if ref is strictly needed for layout, or a loading message.
			return <div ref={ref} className="gridTable-empty"></div>;
		}

		// Determine column count for ARIA properties.
		// This assumes all data rows have the same number of cells.
		// Add 1 for the GridControlButtons column.
		const dataCellColumnCount = grid.cells[0]?.length ?? 0;
		const totalAriaColumnCount = dataCellColumnCount + 1;

		return (
			<ShakingWrapper shaking={shaking} duration={500}>
				<MessageSpinner
					isVisible={solving}
					showRandomMessages={true}
					initialMessage={t("gridTable.optimizing")}
				/>
				<div
					ref={ref}
					role="grid"
					aria-label="Technology Grid"
					aria-rowcount={grid.cells.length}
					aria-colcount={totalAriaColumnCount}
					className={`gridTable ${solving ? "opacity-50" : ""}`}
				>
					{grid.cells.map((row, rowIndex) => (
						<div role="row" key={rowIndex} aria-rowindex={rowIndex + 1}>
							{row.map((_, columnIndex) => (
								<GridCell
									key={`${rowIndex}-${columnIndex}`}
									rowIndex={rowIndex}
									columnIndex={columnIndex} // Use the renamed prop
									isSharedGrid={isSharedGridProp}
								/>
							))}
							{/* Wrap GridControlButtons in a div with role="gridcell" */}
							<div role="gridcell" aria-colindex={totalAriaColumnCount}>
								<GridControlButtons
									rowIndex={rowIndex}
									activateRow={activateRow}
									deActivateRow={deActivateRow}
									hasModulesInGrid={hasModulesInGrid}
									// Use pre-calculated indices for these checks
									isFirstInactiveRow={
										row.every((cell) => !cell.active) && rowIndex === firstInactiveRowIndex
									}
									isLastActiveRow={
										row.some((cell) => cell.active) &&
										rowIndex === lastActiveRowIndex &&
										rowIndex >= grid.cells.length - 3 // Keep this specific condition if it's intended
									}
								/>
							</div>
						</div>
					))}
					<div role="row">
						<GridTableButtons
							solving={solving}
							resetGridAction={resetGridAction}
							updateUrlForShare={updateUrlForShare}
							updateUrlForReset={updateUrlForReset}
						/>
					</div>
				</div>
			</ShakingWrapper>
		);
	}
);
GridTableInternal.displayName = "GridTable";

export const GridTable = React.memo(GridTableInternal);
