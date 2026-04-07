/**
 * Application boot splash screen module.
 *
 * @remarks
 * This module provides the `SplashScreen` component, which handles the initial
 * loading visual and coordinates with the application bootstrap process
 * to reveal the main UI.
 *
 * @see {@link SplashScreen}
 *
 * @category Components
 */

import "./SplashScreen.scss";

import type { CSSProperties } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * Handle object exposed via ref to interact with the `SplashScreen`.
 */
export interface SplashScreenHandle {
	/** Initiates the hide animation, respecting the `minDurationMs` constraint. */
	hide: () => void;
}

/**
 * Props for the `SplashScreen` component.
 */
interface SplashScreenProps {
	/** The minimum time in milliseconds that the splash screen must remain visible. Defaults to `0`. */
	minDurationMs?: number;
	/** Callback function triggered once the splash screen is completely removed from the DOM. */
	onHidden?: () => void;
}

/**
 * A highly performant, animation-capable splash screen component.
 *
 * @remarks
 * It remains visible until programmatically hidden via its `hide` method (exposed
 * through `useImperativeHandle`). It supports a minimum visibility duration to
 * prevent "flickering" during rapid loads and can be bypassed using the
 * `?SplashScreen=false` URL parameter for debugging or automated testing.
 *
 * @param {SplashScreenProps} props - Component properties.
 * @param {React.Ref<SplashScreenHandle>} ref - Ref to control the splash screen's lifecycle.
 *
 * @returns {JSX.Element | null} The rendered splash screen, or `null` if hidden.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * const splashRef = useRef<SplashScreenHandle>(null);
 * <SplashScreen ref={splashRef} minDurationMs={1500} />
 * // Later: splashRef.current?.hide();
 * ```
 */
const SplashScreen = forwardRef<SplashScreenHandle, SplashScreenProps>(
	({ minDurationMs = 0, onHidden }, ref) => {
		const [status, setStatus] = useState<"pending" | "visible" | "hiding" | "hidden">(() => {
			const url = new URL(window.location.href);
			const urlParams = new URLSearchParams(url.search);
			const param = urlParams.get("SplashScreen"); // Check for ?SplashScreen=false

			let shouldBeVisible = true;

			if (param === "false") {
				shouldBeVisible = false;
			}

			if (param) {
				urlParams.delete("SplashScreen");
				url.search = urlParams.toString();
				window.history.replaceState({}, "", url.toString());
			}

			return shouldBeVisible ? "visible" : "hidden";
		});
		const elementRef = useRef<HTMLDivElement>(null);
		const renderedAtRef = useRef<number>(0);
		const cssBlock = "SplashScreen"; // BEM Block name, also used for URL param

		useEffect(() => {
			renderedAtRef.current = new Date().getTime();
		}, []);

		useImperativeHandle(ref, () => ({
			async hide() {
				if (status !== "visible" || !elementRef.current) return;

				const elapsedTime = new Date().getTime() - renderedAtRef.current;
				const remainingTime = Math.max(minDurationMs - elapsedTime, 0);

				if (remainingTime > 0) {
					await new Promise((resolve) => setTimeout(resolve, remainingTime));
				}

				setStatus("hiding");
			},
		}));

		useEffect(() => {
			const element = elementRef.current;

			if (status === "hiding" && element) {
				const handleAnimationEnd = (event: AnimationEvent) => {
					if (event.animationName === `${cssBlock}-hide`) {
						setStatus("hidden");
						// Call onHidden callback when animation completes
						// Note: If onHidden dependency changes during animation, the new callback will be called
						onHidden?.();
						element.removeEventListener(
							"animationend",
							handleAnimationEnd as EventListener
						);
					}
				};

				element.addEventListener("animationend", handleAnimationEnd as EventListener);
				element.classList.add(`${cssBlock}--hidden`); // Trigger animation

				return () => {
					element.removeEventListener(
						"animationend",
						handleAnimationEnd as EventListener
					);
				};
			}

			return;
		}, [status, cssBlock, onHidden]);

		if (status === "hidden" || status === "pending") {
			return null;
		}

		return (
			<>
				<div
					className={cssBlock}
					ref={elementRef}
					style={
						{
							visibility: "visible",
						} as CSSProperties
					}
				>
					<div className={`${cssBlock}__loader`}>
						<div className={`${cssBlock}__dot`}></div>
						<div className={`${cssBlock}__dot`}></div>
						<div className={`${cssBlock}__dot`}></div>
						<div className={`${cssBlock}__dot`}></div>
					</div>
				</div>
			</>
		);
	}
);

SplashScreen.displayName = "SplashScreen";

export default SplashScreen;
