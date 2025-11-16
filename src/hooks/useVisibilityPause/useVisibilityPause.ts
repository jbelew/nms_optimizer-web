/**
 * Hook to pause animations when the component is not visible
 *
 * This hook automatically pauses CSS animations and transitions when the page
 * tab becomes hidden, and resumes them when it becomes visible again.
 * This can save significant GPU and CPU time when the user switches tabs.
 *
 * Based on performance trace analysis showing 536 animation frames with potential
 * off-screen rendering overhead.
 *
 * Usage:
 *   const MyComponent = () => {
 *     useVisibilityPause();
 *     return <div className="animated-element">Content</div>;
 *   };
 */

import { useEffect, useRef } from "react";

export interface UseVisibilityPauseOptions {
	/**
	 * Selector for elements whose animations should be paused
	 * Defaults to all elements with animations/transitions
	 */
	selector?: string;

	/**
	 * Whether to pause Web Animations API (requestAnimationFrame based)
	 * @default true
	 */
	pauseWebAnimations?: boolean;

	/**
	 * Whether to pause CSS animations and transitions
	 * @default true
	 */
	pauseCSSAnimations?: boolean;

	/**
	 * Debug logging
	 * @default false
	 */
	debug?: boolean;
}

/**
 * Custom hook to manage animation visibility
 */
export function useVisibilityPause(options: UseVisibilityPauseOptions = {}): void {
	const {
		selector,
		pauseWebAnimations = true,
		pauseCSSAnimations = true,
		debug = false,
	} = options;

	const animationStateRef = useRef<Map<Animation, boolean>>(new Map());
	const cleanupRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (pauseWebAnimations) {
				pauseOrResumeWebAnimations(document.hidden, animationStateRef.current, debug);
			}

			if (pauseCSSAnimations && selector) {
				pauseOrResumeCSSAnimations(document.hidden, selector, debug);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Cleanup
		cleanupRef.current = () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};

		return cleanupRef.current;
	}, [pauseWebAnimations, pauseCSSAnimations, selector, debug]);
}

/**
 * Pauses or resumes Web Animations API animations
 */
function pauseOrResumeWebAnimations(
	shouldPause: boolean,
	stateMap: Map<Animation, boolean>,
	debug: boolean
): void {
	if (typeof document.getAnimations !== "function") {
		if (debug) {
			console.debug("document.getAnimations not supported");
		}
		return;
	}

	const animations = document.getAnimations();

	if (shouldPause) {
		// Pause all running animations
		let pausedCount = 0;
		animations.forEach((animation) => {
			if (animation.playState === "running") {
				stateMap.set(animation, true); // Mark as paused by us
				animation.pause();
				pausedCount++;
			}
		});

		if (debug && pausedCount > 0) {
			console.debug(`⏸️ Paused ${pausedCount} animations`);
		}
	} else {
		// Resume animations we paused
		let resumedCount = 0;
		stateMap.forEach((wasPausedByUs, animation) => {
			if (wasPausedByUs && animation.playState === "paused") {
				animation.play();
				resumedCount++;
				stateMap.delete(animation);
			}
		});

		if (debug && resumedCount > 0) {
			console.debug(`▶️ Resumed ${resumedCount} animations`);
		}
	}
}

/**
 * Pauses or resumes CSS animations and transitions
 */
function pauseOrResumeCSSAnimations(shouldPause: boolean, selector: string, debug: boolean): void {
	try {
		const elements = document.querySelectorAll(selector);

		elements.forEach((element) => {
			const el = element as HTMLElement;

			if (shouldPause) {
				// Store current animation state
				const animationPlayState = window
					.getComputedStyle(el)
					.getPropertyValue("animation-play-state");
				const transitionValue = window.getComputedStyle(el).getPropertyValue("transition");

				// Mark element as paused
				const elWithPausedState = el as unknown as {
					__animationPlayState?: string;
					__transitionValue?: string;
				};
				elWithPausedState.__animationPlayState = animationPlayState;
				elWithPausedState.__transitionValue = transitionValue;

				// Pause animations
				el.style.animationPlayState = "paused";
				el.style.transitionDelay = "9999s"; // Effectively pause transitions

				if (debug) {
					console.debug(`⏸️ Paused CSS animations on:`, el);
				}
			} else {
				// Restore original state
				const elWithPausedState = el as unknown as {
					__animationPlayState?: string;
					__transitionValue?: string;
				};
				const originalPlayState = elWithPausedState.__animationPlayState || "running";
				const originalTransition = elWithPausedState.__transitionValue || "";

				el.style.animationPlayState = originalPlayState;
				if (originalTransition) {
					el.style.transition = originalTransition;
				} else {
					el.style.transitionDelay = "";
				}

				if (debug) {
					console.debug(`▶️ Resumed CSS animations on:`, el);
				}
			}
		});
	} catch (error) {
		console.error("Error managing CSS animations:", error);
	}
}

export default useVisibilityPause;
