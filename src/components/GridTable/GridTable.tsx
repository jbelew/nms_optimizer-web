// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import type { GridStore } from "../../store/grid/gridStore";
import React from "react";
import { useTranslation } from "react-i18next";

import { useGridStore } from "../../store/grid/gridStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";
import GridShake from "../GridShake/GridShake";
import GridTableButtons from "../GridTableButtons/GridTableButtons";

/**
 * Props for the {@link GridTable} component.
 *
 * @remarks
 * Defines the operational mode of the grid, including whether it's interactive
 * or a static shared view.
 *
 * @see {@link GridTable}
 *
 * @category Components
 */
interface GridTableProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
	/** Whether the grid is being viewed in read-only shared mode. */
	sharedGrid: boolean;
}

/**
 * Internal implementation of the GridTable component.
 *
 * @remarks
 * This function handles the core rendering of the 2D grid structure, iterating
 * over rows and columns to render {@link GridCell} components. It also
 * integrates row-level controls via {@link GridControlButtons}.
 *
 * @param {GridTableProps} props - Component properties.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref for the main grid container.
 *
 * @returns {JSX.Element} The rendered grid table structure.
 *
 * @example
 * ```tsx
 * <GridTableComponent solving={false} sharedGrid={false} />
 * ```
 */
function GridTableComponent(
	{ solving, sharedGrid }: GridTableProps,
	ref: React.Ref<HTMLDivElement>
) {
	const { t } = useTranslation();
	const gridHeight = useGridStore((state) => state.grid.height);
	const gridWidth = useGridStore((state) => state.grid.width);
	const deferredHeight = React.useDeferredValue(gridHeight);
	const deferredWidth = React.useDeferredValue(gridWidth);

	const totalAriaColumnCount = deferredWidth + 1;

	const gridContent = React.useMemo(
		() =>
			Array.from({ length: deferredHeight }).map((_, rowIndex) => (
				<div
					key={rowIndex}
					role="row"
					aria-rowindex={rowIndex + 1}
					className="gridTable__row"
				>
					{/* Direct row-less rendering of cells for performance */}
					{Array.from({ length: deferredWidth }).map((__, columnIndex) => (
						<GridCell
							key={`${rowIndex}-${columnIndex}`}
							rowIndex={rowIndex}
							columnIndex={columnIndex}
							isSharedGrid={sharedGrid}
						/>
					))}
					<div role="gridcell" className="w-6" aria-colindex={totalAriaColumnCount}>
						<GridControlButtons rowIndex={rowIndex} />
					</div>
				</div>
			)),
		[deferredHeight, deferredWidth, sharedGrid, totalAriaColumnCount]
	);

	if (!deferredHeight || !deferredWidth) {
		return <div ref={ref} className="gridTable-empty"></div>;
	}

	return (
		<GridShake duration={500}>
			<div
				ref={ref}
				role="grid"
				aria-label={t("gridTable.ariaLabel") ?? ""}
				aria-rowcount={deferredHeight}
				aria-colcount={totalAriaColumnCount}
				className={`gridTable ${solving ? "opacity-25" : ""}`}
			>
				{gridContent}
			</div>

			<GridTableButtons
				solving={solving}
				gridRef={ref as React.RefObject<HTMLDivElement | null>}
			/>
		</GridShake>
	);
}

/**
 * A layout component that renders the interactive technology grid and its controls.
 *
 * @remarks
 * This component orchestrates the rendering of a 2D array of {@link GridCell} components,
 * row-level controls for bulk activation, and a set of table-wide action buttons.
 * It is wrapped in a {@link GridShake} component to provide visual feedback for invalid actions.
 *
 * Performance optimization:
 * - Direct mapping of grid rows and columns minimizes overhead.
 * - Selective rendering of {@link GridControlButtons} for each row.
 * - Integration with {@link GridTableButtons} for grid-wide actions.
 *
 * @see {@link GridTableProps}
 * @see {@link GridCell}
 * @see {@link GridShake}
 * @see {@link GridStore}
 * @see {@link GridControlButtons}
 * @see {@link GridTableButtons}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * const gridRef = useRef<HTMLDivElement>(null);
 * <GridTable ref={gridRef} solving={false} sharedGrid={false} />
 * ```
 */
const GridTable = React.forwardRef<HTMLDivElement, GridTableProps>(GridTableComponent);
GridTable.displayName = "GridTable";

export { GridTable };

export default GridTable;
