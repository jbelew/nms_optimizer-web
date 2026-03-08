import { useBreakpoint } from "../useBreakpoint/useBreakpoint";

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
 * This allows the scroll-into-view behavior to automatically unhide the mobile
 * toolbar when scrolling is triggered.
 *
 * @param {function(): void} fn - The `forceShow` function, typically from `useScrollHide`.
 * @returns {void}
 */
export const registerToolbarForceShow = (fn: () => void) => {
	sharedForceShow = fn;
};

/**
 * Custom hook for managing grid scrolling with responsive offsets.
 *
 * It maintains a singleton ref to the grid container, allowing multiple
 * components (like the optimizer and recommended build list) to trigger
 * smooth scrolling to the grid. On screens smaller than 1024px, it ensures
 * the grid is correctly positioned near the top of the viewport.
 *
 * @param {object} [options] - Configuration for the scroll behavior.
 * @param {boolean} [options.skipOnLargeScreens=false] - Whether to ignore scroll requests on viewports >= 1024px.
 * @returns {{ gridContainerRef: React.MutableRefObject<HTMLDivElement | null>, scrollIntoView: function(): void }} The shared container ref and a function to trigger the scroll.
 *
 * @example
 * const { gridContainerRef, scrollIntoView } = useScrollGridIntoView({ skipOnLargeScreens: true });
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
	 * Also triggers the registered toolbar `forceShow` function.
	 */
	const scrollIntoView = () => {
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
	};

	return { gridContainerRef, scrollIntoView };
};

/**
 * Reset the shared grid container ref. Used for testing.
 * @internal
 */
export const __resetScrollGridIntoViewRef = () => {
	sharedGridContainerRef = { current: null } as React.MutableRefObject<HTMLDivElement | null>;
};
