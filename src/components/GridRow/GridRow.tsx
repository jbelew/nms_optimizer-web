import React, { memo } from "react";

import { useGridStore } from "../../store/GridStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";

/**
 * @interface GridRowProps
 * @property {number} rowIndex - The row index of the current row.
 * @property {boolean} isSharedGrid - Indicates if the grid is in a shared (read-only) state.
 * @property {(rowIndex: number) => void} activateRow - Function to activate a specific row in the grid.
 * @property {(rowIndex: number) => void} deActivateRow - Function to deactivate a specific row in the grid.
 * @property {boolean} hasModulesInGrid - Indicates if there are any modules currently placed in the grid.
 * @property {boolean} gridFixed - Indicates if the grid's dimensions (active/inactive cells) are fixed.
 */
interface GridRowProps {
	rowIndex: number;
	isSharedGrid: boolean;
	hasModulesInGrid: boolean;
	gridFixed: boolean;
}

/**
 * GridRow component represents a single row in the technology grid.
 * It renders individual `GridCell` components and `GridControlButtons` for managing the row.
 * This component is memoized to prevent unnecessary re-renders when its props or relevant store state haven't changed.
 *
 * @param {GridRowProps} props - The props for the GridRow component.
 * @returns {JSX.Element} The rendered GridRow component.
 */
const GridRow: React.FC<GridRowProps> = memo(
	({ rowIndex, isSharedGrid, hasModulesInGrid, gridFixed }) => {
		const row = useGridStore((state) => state.grid.cells[rowIndex]);
		const gridWidth = useGridStore((state) => state.grid.width);
		const firstInactiveRowIndex = useGridStore((state) => state.selectFirstInactiveRowIndex());
		const lastActiveRowIndex = useGridStore((state) => state.selectLastActiveRowIndex());
		const activateRow = useGridStore((state) => state.activateRow);
		const deActivateRow = useGridStore((state) => state.deActivateRow);

		// Determine column count for ARIA properties.
		// Add 1 for the GridControlButtons column.
		const totalAriaColumnCount = gridWidth + 1;

		if (!row) {
			return null; // Should not happen if gridHeight is correct, but good for safety
		}

		return (
			<div role="row" key={rowIndex} aria-rowindex={rowIndex + 1}>
				{Array.from({ length: gridWidth }).map((_, columnIndex) => (
					<GridCell
						key={`${rowIndex}-${columnIndex}`}
						rowIndex={rowIndex}
						columnIndex={columnIndex}
						isSharedGrid={isSharedGrid}
					/>
				))}
				{/* Wrap GridControlButtons in a div with role="gridcell" */}
				<div role="gridcell" className="w-[24px]" aria-colindex={totalAriaColumnCount}>
					<GridControlButtons
						rowIndex={rowIndex}
						activateRow={activateRow}
						deActivateRow={deActivateRow}
						hasModulesInGrid={hasModulesInGrid}
						isFirstInactiveRow={
							row.every((cell) => !cell.active) && rowIndex === firstInactiveRowIndex
						}
						isLastActiveRow={
							row.some((cell) => cell.active) &&
							rowIndex === lastActiveRowIndex &&
							rowIndex >= useGridStore.getState().grid.cells.length - 3 // Keep this specific condition if it's intended
						}
						gridFixed={gridFixed}
					/>
				</div>
			</div>
		);
	}
);

GridRow.displayName = "GridRow";

export default GridRow;
