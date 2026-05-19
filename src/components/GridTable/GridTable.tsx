// src/components/GridTable/GridTable.tsx
import React from "react";

import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { useGridStore } from "@/store/grid/gridStore";

import { GridProvider } from "./GridContext";
import { GridTableContent } from "./GridTableContent";
import { GridTableGrid } from "./GridTableGrid";
import { GridTableRoot } from "./GridTableRoot";

export { GridProvider } from "./GridContext";

export { GridTableContent } from "./GridTableContent";

export { GridTableGrid } from "./GridTableGrid";

export { GridTableRoot } from "./GridTableRoot";

export { GridTableButtons };

/**
 * Properties for the {@link GridTable} component.
 */
interface GridTableProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * GridTable component.
 */
export const GridTable = React.forwardRef<HTMLDivElement, GridTableProps>(({ solving }, ref) => {
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
					<GridTableContent gridHeight={deferredHeight} />
				</GridTableGrid>
				<GridTableButtons solving={solving} />
			</GridTableRoot>
		</GridProvider>
	);
});

GridTable.displayName = "GridTable";
