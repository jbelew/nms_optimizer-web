// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import React from "react";

import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { useGridStore } from "@/store/grid/gridStore";

import { GridProvider } from "./GridContext";
import { GridTableContent } from "./GridTableContent";
import { GridTableGrid } from "./GridTableGrid";
import { GridTableRoot } from "./GridTableRoot";

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
 * Default composite component for GridTable.
 */
const GridTableComp = React.forwardRef<HTMLDivElement, GridTableProps>(
	({ sharedGrid, solving }, ref) => {
		const gridHeight = useGridStore((state) => state.grid.height);
		const deferredHeight = React.useDeferredValue(gridHeight);
		const gridWidth = useGridStore((state) => state.grid.width);
		const deferredWidth = React.useDeferredValue(gridWidth);

		if (!deferredHeight || !deferredWidth) {
			return <div className="gridTable-empty" ref={ref}></div>;
		}

		return (
			<GridProvider gridRef={ref as React.RefObject<HTMLDivElement | null>}>
				<GridTableRoot>
					<GridTableGrid gridHeight={deferredHeight} gridRef={ref} solving={solving}>
						<GridTableContent gridHeight={deferredHeight} sharedGrid={sharedGrid} />
					</GridTableGrid>
					<GridTableButtons solving={solving} />
				</GridTableRoot>
			</GridProvider>
		);
	}
);

GridTableComp.displayName = "GridTable";

/**
 * Compound component for GridTable.
 */
export const GridTable = Object.assign(GridTableComp, {
	Buttons: GridTableButtons,
	Content: GridTableContent,
	Grid: GridTableGrid,
	Provider: GridProvider,
	Root: GridTableRoot,
});
