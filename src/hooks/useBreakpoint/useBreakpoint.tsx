// src/hooks/useBreakpoint.tsx
import { useCallback, useSyncExternalStore } from "react";

/**
 * Custom hook for tracking whether a media query breakpoint is matched.
 *
 * @param {string} breakpoint - The media query breakpoint to track (e.g., "768px").
 * @returns {boolean} Whether the breakpoint is currently matched.
 */
export const useBreakpoint = (breakpoint: string) => {
	const subscribe = useCallback(
		(callback: () => void) => {
			const mediaQuery = window.matchMedia(`(min-width: ${breakpoint})`);
			mediaQuery.addEventListener("change", callback);
			return () => {
				mediaQuery.removeEventListener("change", callback);
			};
		},
		[breakpoint]
	);

	const getSnapshot = useCallback(() => {
		return window.matchMedia(`(min-width: ${breakpoint})`).matches;
	}, [breakpoint]);

	const matches = useSyncExternalStore(subscribe, getSnapshot);
	return matches;
};
