// src/hooks/useAppLayout.tsx
import { useEffect, useRef, useState } from "react";

import { useGridStore } from "../store/GridStore";
import { useBreakpoint } from "./useBreakpoint";

interface AppLayout {
	containerRef: React.RefObject<HTMLDivElement | null>;
	gridTableRef: React.RefObject<HTMLDivElement | null>;
	gridHeight: number | null;
	gridTableTotalWidth: number | undefined;
	isLarge: boolean;
}

const GRID_TABLE_WIDTH_ADJUSTMENT = 0;

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

			// Fallback for initial measurement or if specific elements weren't in entries
			// This part should only execute if the values haven't been set by entries
			// or if it's the initial call without entries.
			if (newGridHeight === null && isLarge && !isSharedGrid && elementToObserveHeight) {
				newGridHeight = Math.round(elementToObserveHeight.getBoundingClientRect().height);
			}
			if (newGridTableTotalWidth === undefined && elementToObserveWidth) {
				newGridTableTotalWidth = Math.round(
					elementToObserveWidth.offsetWidth + GRID_TABLE_WIDTH_ADJUSTMENT
				);
			}

			setGridHeight((prevHeight) => (prevHeight !== newGridHeight ? newGridHeight : prevHeight));
			setGridTableTotalWidth((prevWidth) =>
				prevWidth !== newGridTableTotalWidth ? newGridTableTotalWidth : prevWidth
			);
		};

		// Initial measurement using requestAnimationFrame
		const initialUpdateFrameId = requestAnimationFrame(() => updateMeasurements());

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
			cancelAnimationFrame(initialUpdateFrameId);
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
