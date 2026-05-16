// src/hooks/useBreakpoint.tsx
import { useSyncExternalStore } from "react";

/**
 * Custom hook for tracking whether a media query breakpoint is currently matched.
 *
 * Uses `useSyncExternalStore` for performant, tear-free subscription to the
 * `window.matchMedia` API.
 *
 * @param {string} breakpoint - The minimum width breakpoint to track (e.g., "768px"). **Must be a valid CSS length.**
 *
 * @returns {boolean} `true` if the viewport is at least as wide as the `breakpoint`, otherwise `false`.
 *
 * @see [useBreakpoint Tests](./useBreakpoint.test.tsx)
 * @see {@link import('@/hooks/useAppLayout/useAppLayout').useAppLayout} for layout-specific responsive logic.
 *
 * @category Hooks
 *
 * @example Conditional rendering
 * ```tsx
 * const isDesktop = useBreakpoint("1024px");
 *
 * return <div>{isDesktop ? "Desktop View" : "Mobile/Tablet View"}</div>;
 * ```
 */
export const useBreakpoint = (breakpoint: string) => {
	const subscribe = (callback: () => void) => {
		const mediaQuery = window.matchMedia(`(min-width: ${breakpoint})`);
		mediaQuery.addEventListener("change", callback);

		return () => {
			mediaQuery.removeEventListener("change", callback);
		};
	};

	const getSnapshot = () => {
		return window.matchMedia(`(min-width: ${breakpoint})`).matches;
	};

	const getServerSnapshot = () => {
		// Default to false for SSR or if matchMedia is unavailable
		return false;
	};

	const matches = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	return matches;
};
