import { useEffect, useRef, useState } from "react";

/**
 * Return type for the `useScrollHide` hook.
 */
type UseScrollHideReturn = {
	/** Whether the element should currently be visible. */
	isVisible: boolean;
	/** Ref to attach to the element being controlled. */
	toolbarRef: React.RefObject<HTMLElement | null>;
	/** Function to programmatically force the element to be visible. */
	forceShow: () => void;
};

/**
 * Custom hook to manage the visibility of an element based on scroll direction.
 *
 * Typically used for toolbars or headers, it hides the element when scrolling down
 * and reveals it when scrolling up. It includes hysteresis to prevent flickering
 * and a "force show" mechanism for programmatic control.
 *
 * @param {number} [threshold=10] - The distance from the top of the page (in pixels) where the element is always visible.
 * @param {number} [hysteresis=20] - The minimum distance (in pixels) that must be scrolled in a new direction before visibility changes.
 * @returns {UseScrollHideReturn} State and functions for visibility control.
 *
 * @example
 * const { isVisible, toolbarRef } = useScrollHide(10, 30);
 */
export const useScrollHide = (threshold = 10, hysteresis = 20): UseScrollHideReturn => {
	const [isVisible, setIsVisible] = useState(true);
	const toolbarRef = useRef<HTMLElement>(null);
	const lastScrollYRef = useRef(0);
	const directionBaseRef = useRef(0);
	const lastDirectionRef = useRef<"up" | "down" | null>(null);
	const isForcedRef = useRef(false);
	const scrollStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Manually triggers the visibility of the element.
	 */
	const forceShow = () => {
		setIsVisible(true);
		isForcedRef.current = true;
	};

	useEffect(() => {
		let rafId: number | null = null;

		const handleScroll = () => {
			if (rafId !== null) {
				return;
			}

			rafId = requestAnimationFrame(() => {
				const currentScrollY = window.scrollY;

				// 1. Top of Page Guarantee (including negative scroll for iOS bounce)
				// Always show the toolbar if we are near the top.
				if (currentScrollY <= threshold) {
					setIsVisible(true);
					lastScrollYRef.current = currentScrollY;
					// Reset direction base to prevent immediate hiding when scrolling starts
					directionBaseRef.current = currentScrollY;
					rafId = null;

					return;
				}

				// 2. Bottom of Page Handling (ignore bounce)
				const isAtBottom =
					window.innerHeight + currentScrollY >= document.documentElement.scrollHeight;

				if (isAtBottom) {
					lastScrollYRef.current = currentScrollY;
					rafId = null;

					return;
				}

				// Determine direction
				const isScrollingDown = currentScrollY > lastScrollYRef.current;
				const currentDirection = isScrollingDown ? "down" : "up";

				// Reset anchor point if direction changes
				if (currentDirection !== lastDirectionRef.current) {
					directionBaseRef.current = lastScrollYRef.current;
					lastDirectionRef.current = currentDirection;
				}

				// Calculate distance scrolled in current direction since last direction change
				const scrollDistance = Math.abs(currentScrollY - directionBaseRef.current);

				// 3. Logic with Hysteresis
				if (isScrollingDown && scrollDistance > hysteresis) {
					// Suppress hiding if we are in a forced state (e.g. from programmatic scroll)
					if (!isForcedRef.current) {
						setIsVisible(false);
					}
				} else if (!isScrollingDown && scrollDistance > hysteresis) {
					setIsVisible(true);
					// If we are scrolling up, we can clear the forced state
					isForcedRef.current = false;
				}

				// Detect when scrolling has stopped to clear the forced state
				if (scrollStopTimeoutRef.current) {
					clearTimeout(scrollStopTimeoutRef.current);
				}

				scrollStopTimeoutRef.current = setTimeout(() => {
					isForcedRef.current = false;
				}, 150);

				lastScrollYRef.current = currentScrollY;
				rafId = null;
			});
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);

			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}

			if (scrollStopTimeoutRef.current) {
				clearTimeout(scrollStopTimeoutRef.current);
			}
		};
	}, [threshold, hysteresis]);

	return { isVisible, toolbarRef, forceShow };
};
