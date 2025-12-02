import { useCallback, useEffect, useRef, useState } from "react";

type UseScrollHideReturn = {
	isVisible: boolean;
	toolbarRef: React.RefObject<HTMLElement | null>;
	forceShow: () => void;
};

/**
 * Hook to hide/show an element based on scroll direction.
 * Shows when scrolling up, hides when scrolling down.
 * @param threshold - Distance scrolled before hiding (default: 80px)
 */
export const useScrollHide = (threshold = 10, hysteresis = 20): UseScrollHideReturn => {
	const [isVisible, setIsVisible] = useState(true);
	const toolbarRef = useRef<HTMLElement>(null);
	const lastScrollYRef = useRef(0);
	const directionBaseRef = useRef(0);
	const lastDirectionRef = useRef<"up" | "down" | null>(null);

	const forceShow = useCallback(() => {
		setIsVisible(true);
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// 1. Top of Page Guarantee (including negative scroll for iOS bounce)
			// Always show the toolbar if we are near the top.
			if (currentScrollY <= threshold) {
				setIsVisible(true);
				lastScrollYRef.current = currentScrollY;
				// Reset direction base to prevent immediate hiding when scrolling starts
				directionBaseRef.current = currentScrollY;

				return;
			}

			// 2. Bottom of Page Handling (ignore bounce)
			const isAtBottom =
				window.innerHeight + currentScrollY >= document.documentElement.scrollHeight;

			if (isAtBottom) {
				lastScrollYRef.current = currentScrollY;

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
				setIsVisible(false);
			} else if (!isScrollingDown && scrollDistance > hysteresis) {
				setIsVisible(true);
			}

			lastScrollYRef.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [threshold, hysteresis]);

	return { isVisible, toolbarRef, forceShow };
};
