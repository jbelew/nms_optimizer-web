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
export const useScrollHide = (threshold = 80): UseScrollHideReturn => {
	const [isVisible, setIsVisible] = useState(true);
	const toolbarRef = useRef<HTMLElement>(null);
	const lastScrollYRef = useRef(0);
	const directionBaseRef = useRef(0);
	const lastDirectionRef = useRef<"up" | "down" | null>(null);

	const forceShow = useCallback(() => {
		setIsVisible(true);
	}, []);

	useEffect(() => {
		const initialScroll = window.scrollY;
		lastScrollYRef.current = initialScroll;
		directionBaseRef.current = initialScroll;
		lastDirectionRef.current = "down";

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const isScrollingDown = currentScrollY > lastScrollYRef.current;
			const currentDirection = isScrollingDown ? "down" : "up";

			// Ignore iOS bounce scroll at top and bottom
			const isAtTop = currentScrollY <= 0;
			const isAtBottom =
				window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 100;
			if (isAtTop || isAtBottom) {
				lastScrollYRef.current = currentScrollY;
				return;
			}

			if (currentDirection !== lastDirectionRef.current) {
				directionBaseRef.current = lastScrollYRef.current;
				lastDirectionRef.current = currentDirection;
			}

			const scrollDistance = currentScrollY - directionBaseRef.current;

			if (isScrollingDown && scrollDistance > threshold) {
				setIsVisible(false);
			} else if (!isScrollingDown) {
				setIsVisible(true);
			}

			lastScrollYRef.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [threshold]);

	return { isVisible, toolbarRef, forceShow };
};
