import { useCallback } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { Logger } from "@/utils/system/monitoring";

const GRID_SCROLL_OFFSET_SMALL = 40; // < 640px
const GRID_SCROLL_OFFSET_MEDIUM = 0; // 640px - 768px
const GRID_SCROLL_OFFSET_LARGE = 0; // >= 768px

// Singleton ref shared across all hook instances
let sharedGridContainerRef = { current: null } as React.MutableRefObject<HTMLDivElement | null>;

// Shared toolbar show function
let sharedForceShow: (() => void) | null = null;

/**
 * Registers an external function to force the visibility of the toolbar.
 *
 * @remarks
 * This allows the scroll-into-view behavior to automatically unhide the mobile
 * toolbar when scrolling is triggered. This is a singleton-style registration
 * shared across all instances of the hook.
 *
 * @param {function(): void} fn - The `forceShow` function, typically from `useScrollHide`.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link import('@/hooks/useScrollHide/useScrollHide').useScrollHide} for the source of the `forceShow` callback.
 *
 * @example Callback registration
 * ```ts
 * // In the layout or toolbar component:
 * registerToolbarForceShow(() => setShowToolbar(true));
 * ```
 */
export const registerToolbarForceShow = (fn: () => void) => {
	sharedForceShow = fn;
};

/**
 * Custom hook for managing grid scrolling with responsive offsets.
 *
 * @remarks
 * Maintains a singleton ref to the grid container, allowing multiple
 * components (like the optimizer and recommended build list) to trigger
 * smooth scrolling to the grid. On screens smaller than 1024px, it ensures
 * the grid is correctly positioned near the top of the viewport with
 * responsive offsets. DOM layout measurements and smooth scrolling are
 * scheduled across two animation frames (double `requestAnimationFrame`)
 * to prevent interaction latency (INP) by allowing the active interaction
 * frame to paint first.
 *
 * @param {object} [options] - Configuration for the scroll behavior.
 * @param {boolean} [options.skipOnLargeScreens=false] - Whether to ignore scroll requests on viewports >= 1024px.
 *
 * @returns {{ gridContainerRef: React.MutableRefObject<HTMLDivElement | null>, scrollIntoView: () => void }} The shared container ref and a function to trigger the scroll.
 *
 * @see {@link useBreakpoint} for responsive offset calculations.
 * @see {@link registerToolbarForceShow} for global toolbar coordination.
 * @see {@link ./useScrollGridIntoView.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const MyGridComponent = () => {
 *   const { gridContainerRef, scrollIntoView } = useScrollGridIntoView({
 *     skipOnLargeScreens: true
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={scrollIntoView}>Go to Grid</button>
 *       <div ref={gridContainerRef}>Grid Content</div>
 *     </>
 *   );
 * };
 * ```
 */
export const useScrollGridIntoView = (options?: { skipOnLargeScreens?: boolean }) => {
	const gridContainerRef = sharedGridContainerRef;
	const isAbove640 = useBreakpoint("640px");
	const isAbove768 = useBreakpoint("768px");
	const isAbove1024 = useBreakpoint("1024px");

	let offset = GRID_SCROLL_OFFSET_SMALL;

	if (isAbove640 && !isAbove768) {
		offset = GRID_SCROLL_OFFSET_MEDIUM;
	} else if (isAbove768) {
		offset = GRID_SCROLL_OFFSET_LARGE;
	}

	/**
	 * Performs a smooth scroll to the grid container with the appropriate responsive offset.
	 *
	 * @remarks
	 * Defers DOM measurement and scrolling across two animation frames (double `requestAnimationFrame`)
	 * so the browser can complete style recalculation and paint immediate visual feedback before executing
	 * layout queries. Also triggers the registered toolbar `forceShow` function.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * scrollIntoView();
	 * // returns void, side-effect: scrolls window to grid across animation frames
	 * ```
	 */
	const scrollIntoView = useCallback(() => {
		// Skip scrolling on large screens if configured to do so
		if (options?.skipOnLargeScreens && isAbove1024) {
			return;
		}

		if (!sharedGridContainerRef.current) return;

		try {
			sharedForceShow?.();
		} catch (error) {
			Logger.error("Failed to show toolbar during scroll:", error);
		}

		if (typeof window === "undefined" || typeof requestAnimationFrame === "undefined") {
			return;
		}

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				try {
					const element = sharedGridContainerRef.current;
					if (!element) return;

					const scrollY = window.pageYOffset ?? window.scrollY ?? 0;
					const top = element.getBoundingClientRect().top + scrollY - offset;
					window.scrollTo({ behavior: "smooth", top });
				} catch (error) {
					Logger.error("Failed to scroll grid into view:", error);
				}
			});
		});
	}, [isAbove1024, offset, options?.skipOnLargeScreens]);

	return { gridContainerRef, scrollIntoView };
};

/**
 * Reset the shared grid container ref. Used for testing.
 *
 * @remarks
 * Resets both the container ref singleton and the shared toolbar force-show callback
 * to ensure complete isolation between test runs.
 *
 * @returns {void} Side-effects only.
 *
 * @example Internal reset
 * ```typescript
 * __resetScrollGridIntoViewRef();
 * // returns void, side-effect: resets singleton ref and callbacks
 * ```
 *
 * @internal
 */
export const __resetScrollGridIntoViewRef = () => {
	sharedGridContainerRef = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
	sharedForceShow = null;
};
