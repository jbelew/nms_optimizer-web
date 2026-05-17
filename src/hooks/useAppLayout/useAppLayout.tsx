// src/hooks/useAppLayout.tsx
import { useEffect, useRef, useState } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "@/store/grid/gridStore";

/**
 * Interface representing the dimensions and refs for the application layout.
 *
 * @category Hooks
 */
interface AppLayout {
	/** Ref to the main content container. */
	containerRef: React.RefObject<HTMLDivElement | null>;
	/** Calculated height of the grid. `null` if the grid is not in side-by-side mode. */
	gridHeight: null | number;
	/** Ref to the grid table container. */
	gridTableRef: React.RefObject<HTMLDivElement | null>;
	/** Calculated total width of the grid table, including adjustments. */
	gridTableTotalWidth: number | undefined;
	/** Whether the viewport matches the 'large' breakpoint (1024px). */
	isLarge: boolean;
}

const GRID_TABLE_WIDTH_ADJUSTMENT = 0;

/**
 * Custom hook for managing dynamic application layout and responsiveness.
 *
 * @remarks
 * It uses `ResizeObserver` to track the dimensions of the main container and grid table.
 * On large screens, it synchronizes the grid height with the container height to enable
 * side-by-side scrolling.
 *
 * @returns {AppLayout} Layout state including refs and calculated dimensions.
 *
 * @see {@link useGridStore} for shared grid state.
 * @see {@link useBreakpoint} for responsive logic.
 * @see {@link ../../store/grid/gridStore.ts GridStore Source}
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { containerRef, gridTableRef, gridHeight, isLarge } = useAppLayout();
 *
 * return (
 *   <div ref={containerRef} style={{ height: isLarge ? gridHeight : 'auto' }}>
 *     <div ref={gridTableRef}>Grid Content</div>
 *   </div>
 * );
 * ```
 */
export const useAppLayout = (): AppLayout => {
	const containerRef = useRef<HTMLDivElement>(null);
	const gridTableRef = useRef<HTMLDivElement>(null);
	const [gridHeight, setGridHeight] = useState<null | number>(null);
	const [gridTableTotalWidth, setGridTableTotalWidth] = useState<number | undefined>(undefined);
	const isLarge = useBreakpoint("1024px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);

	useEffect(() => {
		const containerElement = containerRef.current;
		const gridTableElement = gridTableRef.current;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === containerElement) {
					if (isLarge && !isSharedGrid) {
						setGridHeight(Math.round(entry.contentRect.height));
					} else {
						setGridHeight(null);
					}
				} else if (entry.target === gridTableElement) {
					setGridTableTotalWidth(
						Math.round(entry.contentRect.width + GRID_TABLE_WIDTH_ADJUSTMENT)
					);
				}
			}
		});

		if (containerElement) {
			observer.observe(containerElement);
		}

		if (gridTableElement) {
			observer.observe(gridTableElement);
		}

		return () => {
			observer.disconnect();
		};
	}, [isLarge, isSharedGrid]);

	return {
		containerRef,
		gridHeight,
		gridTableRef,
		gridTableTotalWidth,
		isLarge,
	};
};
