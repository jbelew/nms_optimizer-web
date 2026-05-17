// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import GridCell from "@/components/GridCell/GridCell";
import GridControlButtons from "@/components/GridControlButtons/GridControlButtons";
import GridShake from "@/components/GridShake/GridShake";
import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { useGridStore } from "@/store/grid/gridStore";

import { GridProvider } from "./GridContext";

/**
 * Properties for the {@link GridTable} component.
 */
interface GridTableProps {
	/** Whether the grid is currently in read-only shared mode. */
	sharedGrid: boolean;
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * Internal implementation of the GridTable component.
 */
function GridTable({
	ref,
	sharedGrid,
	solving,
}: GridTableProps & { ref?: React.Ref<HTMLDivElement> }) {
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
		<GridProvider gridRef={ref as React.RefObject<HTMLDivElement | null>}>
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

				<GridTableButtons solving={solving} />
			</GridShake>
		</GridProvider>
	);
}

GridTable.displayName = "GridTable";

export { GridTable };
