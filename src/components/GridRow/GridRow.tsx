import React, { memo } from "react";

import { useGridStore } from "../../store/GridStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";

/**
 * @interface GridRowProps
 * @property {number} rowIndex - The row index of the current row.
 * @property {boolean} isLoading - Indicates if the tech tree is currently loading.
 */
interface GridRowProps {
	rowIndex: number;
	isLoading: boolean;
}

/**
 * GridRow component represents a single row in the technology grid.
 * It renders individual `GridCell` components and `GridControlButtons` for managing the row.
 * Uses the colocated hook pattern: GridControlButtons calls `useGridRowState` directly
 * rather than receiving calculated state via props.
 * This component is memoized to prevent unnecessary re-renders when its props haven't changed.
 *
 * @param {GridRowProps} props - The props for the GridRow component.
 * @returns {JSX.Element} The rendered GridRow component.
 */
const GridRowInternal: React.FC<GridRowProps> = memo(
	({ rowIndex, isLoading }) => {
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
					<GridControlButtons rowIndex={rowIndex} isLoading={isLoading} />
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison to prevent re-renders when props haven't changed
		return (
			prevProps.rowIndex === nextProps.rowIndex && prevProps.isLoading === nextProps.isLoading
		);
	}
);

GridRowInternal.displayName = "GridRow";

export default GridRowInternal;
