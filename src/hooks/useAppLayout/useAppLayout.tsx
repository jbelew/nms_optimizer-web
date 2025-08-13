// src/hooks/useAppLayout.tsx
import { useEffect, useRef, useState } from "react";

import { useGridStore } from "../../store/GridStore";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";

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
		const elementToObserveHeight = containerRef.current;
		const elementToObserveWidth = gridTableRef.current;

		/**
		 * Updates the measurements (height and width) of the observed elements.
		 * This function is called by the ResizeObserver.
		 *
		 * @param {ResizeObserverEntry[]} [entries] - Optional array of ResizeObserverEntry objects.
		 */
		const updateMeasurements = (entries?: ResizeObserverEntry[]) => {
			let newGridHeight: number | null = null;
			let newGridTableTotalWidth: number | undefined = undefined;

			// Prioritize ResizeObserver entries if available
			if (entries) {
				for (const entry of entries) {
					if (entry.target === elementToObserveHeight) {
						if (isLarge && !isSharedGrid) {
							newGridHeight = Math.round(entry.contentRect.height);
						}
					} else if (entry.target === elementToObserveWidth) {
						newGridTableTotalWidth = Math.round(
							entry.contentRect.width + GRID_TABLE_WIDTH_ADJUSTMENT
						);
					}
				}
			}

			setGridHeight((prevHeight) =>
				prevHeight !== newGridHeight ? newGridHeight : prevHeight
			);
			setGridTableTotalWidth((prevWidth) =>
				prevWidth !== newGridTableTotalWidth ? newGridTableTotalWidth : prevWidth
			);
		};

		const observer = new ResizeObserver((entries) => {
			// Pass entries to the updateMeasurements function
			updateMeasurements(entries);
		});

		if (elementToObserveHeight) {
			observer.observe(elementToObserveHeight);
		}
		if (elementToObserveWidth) {
			observer.observe(elementToObserveWidth);
		}

		return () => {
			observer.disconnect();
		};
	}, [isLarge, isSharedGrid, containerRef, gridTableRef]);

	return {
		containerRef,
		gridTableRef,
		gridHeight,
		gridTableTotalWidth,
		isLarge,
	};
};
