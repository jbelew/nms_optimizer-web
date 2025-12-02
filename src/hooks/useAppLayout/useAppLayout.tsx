// src/hooks/useAppLayout.tsx
import { useEffect, useRef, useState } from "react";

import { useGridStore } from "../../store/GridStore";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";

/**
 * @interface AppLayout
 * @property {React.RefObject<HTMLDivElement|null>} containerRef - A ref for the main container element.
 * @property {React.RefObject<HTMLDivElement|null>} gridTableRef - A ref for the grid table element.
 * @property {number|null} gridHeight - The height of the grid.
 * @property {number|undefined} gridTableTotalWidth - The total width of the grid table.
 * @property {boolean} isLarge - Whether the screen is large.
 */
interface AppLayout {
	containerRef: React.RefObject<HTMLDivElement | null>;
	gridTableRef: React.RefObject<HTMLDivElement | null>;
	gridHeight: number | null;
	gridTableTotalWidth: number | undefined;
	isLarge: boolean;
}

const GRID_TABLE_WIDTH_ADJUSTMENT = 0;

/**
 * Custom hook for managing application layout, specifically grid dimensions and responsiveness.
 * It observes the size of the main container and grid table to dynamically adjust layout.
 *
 * @returns {AppLayout} An object containing refs for the container and grid table,
 *                      and state for grid height, grid table total width, and large screen status.
 */
export const useAppLayout = (): AppLayout => {
	const containerRef = useRef<HTMLDivElement>(null);
	const gridTableRef = useRef<HTMLDivElement>(null);
	const [gridHeight, setGridHeight] = useState<number | null>(null);
	const [gridTableTotalWidth, setGridTableTotalWidth] = useState<number | undefined>(undefined);
	const isLarge = useBreakpoint("1024px");
	const { isSharedGrid } = useGridStore();

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
		gridTableRef,
		gridHeight,
		gridTableTotalWidth,
		isLarge,
	};
};
