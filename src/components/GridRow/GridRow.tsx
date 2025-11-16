import React, { memo } from "react";

import { useGridStore } from "../../store/GridStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";

/**
 * @interface GridRowProps
 * @property {number} rowIndex - The row index of the current row.
 */
interface GridRowProps {
	rowIndex: number;
}

/**
 * GridRow component represents a single row in the technology grid.
 * It renders individual `GridCell` components and `GridControlButtons` for managing the row.
 * This component is memoized to prevent unnecessary re-renders when its props or relevant store state haven't changed.
 *
 * @param {GridRowProps} props - The props for the GridRow component.
 * @returns {JSX.Element} The rendered GridRow component.
 */
interface GridRowInternalProps extends GridRowProps {
	firstInactiveRowIndex: number;
	lastActiveRowIndex: number;
}

const GridRowInternal: React.FC<GridRowInternalProps> = memo(
	({ rowIndex, firstInactiveRowIndex, lastActiveRowIndex }) => {
		const row = useGridStore((state) => state.grid.cells[rowIndex]);
		const gridWidth = useGridStore((state) => state.grid.width);

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
					/>
				))}
				{/* Wrap GridControlButtons in a div with role="gridcell" */}
				<div role="gridcell" className="w-6" aria-colindex={totalAriaColumnCount}>
					<GridControlButtons
						rowIndex={rowIndex}
						isFirstInactiveRow={
							row.every((cell) => !cell.active) && rowIndex === firstInactiveRowIndex
						}
						isLastActiveRow={
							row.some((cell) => cell.active) &&
							rowIndex === lastActiveRowIndex &&
							rowIndex >= useGridStore.getState().grid.cells.length - 3 // Keep this specific condition if it's intended
						}
					/>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison to prevent re-renders when indices haven't changed
		return (
			prevProps.rowIndex === nextProps.rowIndex &&
			prevProps.firstInactiveRowIndex === nextProps.firstInactiveRowIndex &&
			prevProps.lastActiveRowIndex === nextProps.lastActiveRowIndex
		);
	}
);

GridRowInternal.displayName = "GridRow";

export default GridRowInternal;
