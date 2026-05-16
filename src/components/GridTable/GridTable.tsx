// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import type { GridStore } from "@/store/grid/gridStore";
import React from "react";
import { useTranslation } from "react-i18next";

import GridCell from "@/components/GridCell/GridCell";
import GridControlButtons from "@/components/GridControlButtons/GridControlButtons";
import GridShake from "@/components/GridShake/GridShake";
import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { useGridStore } from "@/store/grid/gridStore";

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
	/** Whether the grid is being viewed in read-only shared mode. */
	sharedGrid: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
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
	{ sharedGrid, solving }: GridTableProps,
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
					aria-rowindex={rowIndex + 1}
					className="gridTable__row"
					key={rowIndex}
					role="row"
				>
					{/* Direct row-less rendering of cells for performance */}
					{Array.from({ length: deferredWidth }).map((__, columnIndex) => (
						<GridCell
							columnIndex={columnIndex}
							isSharedGrid={sharedGrid}
							key={`${rowIndex}-${columnIndex}`}
							rowIndex={rowIndex}
						/>
					))}
					<div aria-colindex={totalAriaColumnCount} className="w-6" role="gridcell">
						<GridControlButtons rowIndex={rowIndex} />
					</div>
				</div>
			)),
		[deferredHeight, deferredWidth, sharedGrid, totalAriaColumnCount]
	);

	if (!deferredHeight || !deferredWidth) {
		return <div className="gridTable-empty" ref={ref}></div>;
	}

	return (
		<GridShake duration={500}>
			<div
				aria-colcount={totalAriaColumnCount}
				aria-label={t("gridTable.ariaLabel") ?? ""}
				aria-rowcount={deferredHeight}
				className={`gridTable ${solving ? "opacity-25" : ""}`}
				ref={ref}
				role="grid"
			>
				{gridContent}
			</div>

			<GridTableButtons
				gridRef={ref as React.RefObject<HTMLDivElement | null>}
				solving={solving}
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
