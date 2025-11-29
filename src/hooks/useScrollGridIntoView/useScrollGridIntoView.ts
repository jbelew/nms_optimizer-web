import { useCallback, useEffect } from "react";

import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useScrollHide } from "../useScrollHide/useScrollHide";

const GRID_SCROLL_OFFSET_SMALL = 40; // < 640px
const GRID_SCROLL_OFFSET_MEDIUM = 0; // 640px - 768px
const GRID_SCROLL_OFFSET_LARGE = 0; // >= 768px

// Singleton ref shared across all hook instances
let sharedGridContainerRef = { current: null } as React.MutableRefObject<HTMLDivElement | null>;

// Shared toolbar show function
let sharedForceShow: (() => void) | null = null;

/**
 * Custom hook to manage grid container ref and scroll behavior with responsive offset.
 * Maintains a single shared ref across all callers (useOptimize, GridTableButtons, useRecommendedBuild).
 * On screens < 1024px, scrolls the grid to near the top of the screen.
 * On larger screens (>= 1024px), may skip scrolling depending on the caller's preference.
 * Also automatically shows the toolbar when scrolling.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.skipOnLargeScreens=false] - If true, skip scrolling on screens >= 1024px
 * @returns {{gridContainerRef: React.MutableRefObject<HTMLDivElement | null>, scrollIntoView: () => void}}
 *          The shared ref to attach to the grid container element and function to trigger scroll animation.
 */
export const useScrollGridIntoView = (options?: { skipOnLargeScreens?: boolean }) => {
	const gridContainerRef = sharedGridContainerRef;
	const isAbove640 = useBreakpoint("640px");
	const isAbove768 = useBreakpoint("768px");
	const isAbove1024 = useBreakpoint("1024px");
	const { forceShow } = useScrollHide(80);

	// Register the forceShow function once from the first caller
	useEffect(() => {
		sharedForceShow = forceShow;
	}, [forceShow]);

	let offset = GRID_SCROLL_OFFSET_SMALL;
	if (isAbove640 && !isAbove768) {
		offset = GRID_SCROLL_OFFSET_MEDIUM;
	} else if (isAbove768) {
		offset = GRID_SCROLL_OFFSET_LARGE;
	}

	const scrollIntoView = useCallback(() => {
		// Skip scrolling on large screens if configured to do so
		if (options?.skipOnLargeScreens && isAbove1024) {
			return;
		}

		if (!gridContainerRef.current) return;

		sharedForceShow?.();

		const element = gridContainerRef.current;
		requestAnimationFrame(() => {
			const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
			window.scrollTo({ top, behavior: "smooth" });
		});
	}, [gridContainerRef, offset, isAbove1024, options?.skipOnLargeScreens]);

	return { gridContainerRef, scrollIntoView };
};

/**
 * Reset the shared grid container ref. Used for testing.
 * @internal
 */
export const __resetScrollGridIntoViewRef = () => {
	sharedGridContainerRef = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
};
