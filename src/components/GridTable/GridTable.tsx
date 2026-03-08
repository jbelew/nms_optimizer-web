// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import React from "react";

import { useGridStore } from "../../store/GridStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";
import GridShake from "../GridShake/GridShake";
import GridTableButtons from "../GridTableButtons/GridTableButtons";

/**
 * @interface GridTableProps
 * @property {boolean} solving - Indicates if the optimization process is currently running.
 * @property {boolean} sharedGrid - Indicates if the grid is in a shared, read-only state.
 */
interface GridTableProps {
	solving: boolean;
	sharedGrid: boolean;
}

/**
 * GridTable component displays the main technology grid.
 * It renders individual `GridCell` components and `GridControlButtons` for managing rows.
 *
 * @param {GridTableProps} props - The props for the GridTable component.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the main grid table div.
 * @returns {JSX.Element} The rendered GridTable component.
 */
export const GridTable = React.forwardRef<HTMLDivElement, GridTableProps>(
	({ solving, sharedGrid }, ref) => {
		const gridHeight = useGridStore((state) => state.grid.height);
		const gridWidth = useGridStore((state) => state.grid.width);
		const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);

		if (!gridHeight || !gridWidth) {
			return <div ref={ref} className="gridTable-empty"></div>;
		}

		const totalAriaColumnCount = gridWidth + 1;

		return (
			<GridShake duration={500}>
				<div
					ref={ref}
					role="grid"
					aria-label="Technology Grid"
					aria-rowcount={gridHeight}
					aria-colcount={totalAriaColumnCount}
					className={`gridTable ${solving ? "opacity-25" : ""}`}
				>
					{Array.from({ length: gridHeight }).map((_, rowIndex) => (
						<React.Fragment key={rowIndex}>
							{/* Direct row-less rendering of cells for performance */}
							{Array.from({ length: gridWidth }).map((__, columnIndex) => (
								<GridCell
									key={`${rowIndex}-${columnIndex}`}
									rowIndex={rowIndex}
									columnIndex={columnIndex}
									isSharedGrid={sharedGrid}
								/>
							))}
							<div
								role="gridcell"
								className="w-6"
								aria-colindex={totalAriaColumnCount}
								aria-rowindex={rowIndex + 1}
							>
								<GridControlButtons
									rowIndex={rowIndex}
									isLoading={isTechTreeLoading}
								/>
							</div>
						</React.Fragment>
					))}
				</div>

				<GridTableButtons solving={solving} />
			</GridShake>
		);
	}
);
GridTable.displayName = "GridTable";

export default GridTable;
