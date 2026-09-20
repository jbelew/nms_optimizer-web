import { useEffect, useState } from "react";

/**
 * Custom hook to manage the enter fade-in animation for the tech tree section
 * when transitioning from a shared grid to an editable grid on desktop.
 *
 * @param {boolean} isSharedGrid - Whether the current view is a shared grid.
 * @param {boolean} isLargeScreen - Whether the current viewport is desktop (>=1024px).
 *
 * @returns {boolean} True if the enter animation class should be applied.
 */
export const useTechTreeEnterAnimation = (
	isSharedGrid: boolean,
	isLargeScreen: boolean
): boolean => {
	const [prevSharedGrid, setPrevSharedGrid] = useState(isSharedGrid);
	const [isEntering, setIsEntering] = useState(false);

	if (prevSharedGrid !== isSharedGrid) {
		setPrevSharedGrid(isSharedGrid);

		if (isLargeScreen && prevSharedGrid && !isSharedGrid) {
			setIsEntering(true);
		}
	}

	useEffect(() => {
		if (isEntering) {
			const timer = setTimeout(() => {
				setIsEntering(false);
			}, 200);

			return () => clearTimeout(timer);
		}
	}, [isEntering]);

	return isEntering;
};
