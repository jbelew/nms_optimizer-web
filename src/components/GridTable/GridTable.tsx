// src/components/GridTable/GridTable.tsx
import React from "react";

import GridShake from "@/components/GridShake/GridShake";
import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { useGridStore } from "@/store/grid/gridStore";

import { GridTableContent } from "./GridTableContent";
import { GridTableGrid } from "./GridTableGrid";

export { GridTableContent } from "./GridTableContent";

export { GridTableGrid } from "./GridTableGrid";

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
 *
 * @param {GridTableProps} props - Component properties.
 * @param {React.ForwardedRef<HTMLDivElement>} ref - Forwarded ref to the grid container.
 *
 * @returns {JSX.Element} The rendered grid table.
 *
 * @see {@link GridTableGrid}
 * @see {@link GridTableContent}
 * @see {@link ./GridTable.test.tsx Unit Tests}
 * @see {@link ./GridTable.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridTable solving={false} />
 * // renders technology grid table and action buttons
 * ```
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
		<GridShake duration={500}>
			<GridTableGrid gridHeight={deferredHeight} gridRef={ref} solving={solving}>
				<GridTableContent gridHeight={deferredHeight} />
			</GridTableGrid>
			<GridTableButtons solving={solving} />
		</GridShake>
	);
});

GridTable.displayName = "GridTable";
