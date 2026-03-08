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
 * Props for the `GridTable` component.
 */
interface GridTableProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
	/** Whether the grid is being viewed in read-only shared mode. */
	sharedGrid: boolean;
}

/**
 * A layout component that renders the interactive technology grid and its controls.
 *
 * This component orchestrates the rendering of a 2D array of `GridCell` components,
 * row-level controls for bulk activation, and a set of table-wide action buttons.
 * It is wrapped in a `GridShake` component to provide visual feedback for invalid actions.
 *
 * @param {GridTableProps} props - Component properties.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref for the main grid container.
 * @returns {JSX.Element} The rendered grid table structure.
 *
 * @example
 * <GridTable ref={gridRef} solving={false} sharedGrid={false} />
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
						<div
							key={rowIndex}
							role="row"
							aria-rowindex={rowIndex + 1}
							className="gridTable__row"
						>
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
							>
								<GridControlButtons
									rowIndex={rowIndex}
									isLoading={isTechTreeLoading}
								/>
							</div>
						</div>
					))}
				</div>

				<GridTableButtons solving={solving} />
			</GridShake>
		);
	}
);
GridTable.displayName = "GridTable";

export default GridTable;
