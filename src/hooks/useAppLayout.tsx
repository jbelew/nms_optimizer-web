// src/hooks/useAppLayout.tsx
import { useEffect, useRef, useState, useCallback } from "react";

import { useGridStore } from "../store/GridStore";
import { useBreakpoint } from "./useBreakpoint";

interface AppLayout {
	containerRef: React.RefObject<HTMLDivElement | null>;
	gridTableRef: React.RefObject<HTMLDivElement | null>;
	gridHeight: number | null;
	gridTableTotalWidth: number | undefined;
	isLarge: boolean;
}

const GRID_TABLE_WIDTH_ADJUSTMENT = -40;

export const useAppLayout = (): AppLayout => {
	const containerRef = useRef<HTMLDivElement>(null);
	const gridTableRef = useRef<HTMLDivElement>(null);
	const [gridHeight, setGridHeight] = useState<number | null>(null);
	const [gridTableTotalWidth, setGridTableTotalWidth] = useState<number | undefined>(undefined);
	const isLarge = useBreakpoint("1024px");
	const { isSharedGrid } = useGridStore();

	const updateMeasurements = useCallback(
		(entries?: ResizeObserverEntry[]) => {
			let newGridHeight: number | null = gridHeight; // Initialize with current state
			let newGridTableTotalWidth: number | undefined = gridTableTotalWidth; // Initialize with current state

			const elementToObserveHeight = containerRef.current;
			const elementToObserveWidth = gridTableRef.current;

			// Prioritize ResizeObserver entries if available
			if (entries) {
				for (const entry of entries) {
					if (entry.target === elementToObserveHeight) {
						if (isLarge && !isSharedGrid) {
							newGridHeight = entry.contentRect.height;
						}
					} else if (entry.target === elementToObserveWidth) {
						newGridTableTotalWidth = entry.contentRect.width + GRID_TABLE_WIDTH_ADJUSTMENT;
					}
				}
			}

			// Fallback for initial measurement or if specific elements weren't in entries
			// This part should only execute if the values haven't been set by entries
			// or if it's the initial call without entries.
			if (newGridHeight === gridHeight && isLarge && !isSharedGrid && elementToObserveHeight) {
				newGridHeight = elementToObserveHeight.getBoundingClientRect().height;
			}
			if (newGridTableTotalWidth === gridTableTotalWidth && elementToObserveWidth) {
				newGridTableTotalWidth = elementToObserveWidth.offsetWidth + GRID_TABLE_WIDTH_ADJUSTMENT;
			}

			// Only update state if values have actually changed
			if (newGridHeight !== gridHeight) {
				setGridHeight(newGridHeight);
			}
			if (newGridTableTotalWidth !== gridTableTotalWidth) {
				setGridTableTotalWidth(newGridTableTotalWidth);
			}
		},
		[isLarge, isSharedGrid, gridHeight, gridTableTotalWidth] // Removed containerRef, gridTableRef
	);

	useEffect(() => {
		// Initial measurement using requestAnimationFrame
		const initialUpdateFrameId = requestAnimationFrame(() => updateMeasurements());

		const observer = new ResizeObserver((entries) => {
			// Pass entries to the updateMeasurements function
			updateMeasurements(entries);
		});

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}
		if (gridTableRef.current) {
			observer.observe(gridTableRef.current);
		}

		return () => {
			cancelAnimationFrame(initialUpdateFrameId);
			observer.disconnect();
		};
	}, [updateMeasurements]);

	return {
		containerRef,
		gridTableRef,
		gridHeight,
		gridTableTotalWidth,
		isLarge,
	};
};