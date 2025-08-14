// src/hooks/useBreakpoint.tsx
import { useEffect, useState } from "react";

/**
 * Custom hook for tracking whether a media query breakpoint is matched.
 *
 * @param {string} breakpoint - The media query breakpoint to track (e.g., "768px").
 * @returns {boolean} Whether the breakpoint is currently matched.
 */
export const useBreakpoint = (breakpoint: string) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(min-width: ${breakpoint})`);
		const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

		setMatches(mediaQuery.matches);
		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [breakpoint]);

	return matches;
};
