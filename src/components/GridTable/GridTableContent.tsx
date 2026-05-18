import React from "react";

import GridCell from "@/components/GridCell/GridCell";
import GridControlButtons from "@/components/GridControlButtons/GridControlButtons";
import { useGridStore } from "@/store/grid/gridStore";

/**
 * Component that renders the grid cells and rows.
 */
export const GridTableContent: React.FC<{
	gridHeight: number;
}> = ({ gridHeight }) => {
	const gridWidth = useGridStore((state) => state.grid.width);
	const deferredWidth = React.useDeferredValue(gridWidth);
	const totalAriaColumnCount = deferredWidth + 1;

	return React.useMemo(
		() =>
			Array.from({ length: gridHeight }).map((_, rowIndex) => (
				<div
					aria-rowindex={rowIndex + 1}
					className="gridTable__row"
					key={rowIndex}
					role="row"
				>
					{Array.from({ length: deferredWidth }).map((__, columnIndex) => (
						<GridCell
							columnIndex={columnIndex}
							key={`${rowIndex}-${columnIndex}`}
							rowIndex={rowIndex}
						/>
					))}
					<div aria-colindex={totalAriaColumnCount} className="w-6" role="gridcell">
						<GridControlButtons rowIndex={rowIndex} />
					</div>
				</div>
			)),
		[gridHeight, deferredWidth, totalAriaColumnCount]
	);
};
