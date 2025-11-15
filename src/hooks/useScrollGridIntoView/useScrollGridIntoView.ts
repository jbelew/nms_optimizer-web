import { useCallback } from "react";

import { useBreakpoint } from "../useBreakpoint/useBreakpoint";

const GRID_SCROLL_OFFSET_SMALL = 54; // < 640px
const GRID_SCROLL_OFFSET_MEDIUM = 8; // 640px - 768px
const GRID_SCROLL_OFFSET_LARGE = 0; // >= 768px

/**
 * Custom hook to scroll a grid container into view with a responsive offset.
 *
 * @param {React.MutableRefObject<HTMLDivElement | null>} gridContainerRef - Ref to the grid container element.
 * @returns {{scrollIntoView: () => void}} - Function to trigger scroll animation.
 */
export const useScrollGridIntoView = (
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>
) => {
	const isAbove640 = useBreakpoint("640px");
	const isAbove768 = useBreakpoint("768px");

	let offset = GRID_SCROLL_OFFSET_SMALL;
	if (isAbove640 && !isAbove768) {
		offset = GRID_SCROLL_OFFSET_MEDIUM;
	} else if (isAbove768) {
		offset = GRID_SCROLL_OFFSET_LARGE;
	}

	const scrollIntoView = useCallback(() => {
		if (!gridContainerRef.current) return;

		const element = gridContainerRef.current;
		requestAnimationFrame(() => {
			const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
			window.scrollTo({ top, behavior: "smooth" });
		});
	}, [gridContainerRef, offset]);

	return { scrollIntoView };
};
