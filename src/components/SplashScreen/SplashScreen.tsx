import "./SplashScreen.css";

import type { CSSProperties } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface SplashScreenHandle {
	hide: () => void;
}

interface SplashScreenProps {
	minDurationMs?: number;
	onHidden?: () => void; // Callback when fully hidden and removed
}

/**
 * SplashScreen component displays a loading screen with an animation.
 * It can be programmatically hidden after a minimum duration.
 *
 * @param {SplashScreenProps} props - The props for the SplashScreen component.
 * @param {number} [props.minDurationMs=0] - The minimum duration in milliseconds the splash screen should be visible.
 * @param {() => void} [props.onHidden] - Callback function to be called when the splash screen is fully hidden and removed from the DOM.
 * @param {React.Ref<SplashScreenHandle>} ref - Ref to expose `hide` method.
 * @returns {JSX.Element | null} The rendered SplashScreen component, or null if hidden.
 */
const SplashScreen = forwardRef<SplashScreenHandle, SplashScreenProps>(
	({ minDurationMs = 0, onHidden }, ref) => {
		const [status, setStatus] = useState<"pending" | "visible" | "hiding" | "hidden">(
			"pending"
		);
		const elementRef = useRef<HTMLDivElement>(null);
		const renderedAtRef = useRef<number>(0);
		const cssBlock = "SplashScreen"; // BEM Block name, also used for URL param

		useEffect(() => {
			renderedAtRef.current = new Date().getTime();
			const url = new URL(window.location.href);
			const urlParams = new URLSearchParams(url.search);
			const param = urlParams.get(cssBlock); // Check for ?SplashScreen=false

			let shouldBeVisible = true;
			if (param === "false") {
				shouldBeVisible = false;
			}

			if (param) {
				urlParams.delete(cssBlock);
				url.search = urlParams.toString();
				window.history.replaceState({}, "", url.toString());
			}

			setStatus(shouldBeVisible ? "visible" : "hidden");
		}, [cssBlock]);

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
					style={{ visibility: "visible" } as CSSProperties} // Made visible by JS when status is 'visible'
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
