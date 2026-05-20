/**
 * Visual feedback component for invalid grid interactions.
 *
 * @remarks
 * This module provides the `GridShake` wrapper component, which reacts to
 * state changes in the `ShakeStore` to provide haptic-like visual feedback.
 *
 * @see {@link GridShake}
 *
 * @category Components
 */

import "./GridShake.scss";

import React, { useEffect, useRef } from "react";

import { useShakeStore } from "@/store/ui/uiStore";

/**
 * Props for the `GridShake` component.
 */
interface GridShakeProps {
	/** The content that should perform the shake animation. */
	children: React.ReactNode;
	/** Duration of the CSS animation in milliseconds. **Must match the CSS animation-duration.** */
	duration: number;
}

/**
 * A wrapper component that provides a visual "shake" animation on demand.
 *
 * @remarks
 * It listens to the global `ShakeStore` and applies a CSS class to its child
 * container whenever a shake event is triggered. This is used as sensory
 * feedback for invalid user actions (e.g., clicking a locked cell).
 *
 * @param {GridShakeProps} props - Component properties.
 *
 * @returns {JSX.Element} The container wrapping the children.
 *
 * @see {@link useShakeStore}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridShake duration={500}>
 *   <InteractiveGrid />
 * </GridShake>
 * // renders shaking container on invalid action
 * ```
 */
const GridShake: React.FC<GridShakeProps> = ({ children, duration }) => {
	const ref = useRef<HTMLDivElement>(null);
	const shakeCount = useShakeStore((state) => state.shakeCount);

	useEffect(() => {
		// We only run the effect if shakeCount is greater than 0, which indicates a shake has been triggered.
		if (shakeCount > 0) {
			const element = ref.current;

			if (element) {
				// Add the shake class to trigger the animation
				element.classList.add("shake");

				// Set a timer to remove the class after the animation duration
				const timer = setTimeout(() => {
					element.classList.remove("shake");
				}, duration);

				// Cleanup function to clear the timer if the component unmounts
				return () => clearTimeout(timer);
			}
		}
	}, [shakeCount, duration]);

	return (
		<div className={`gridTable__shakeWrapper relative`} ref={ref}>
			{children}
		</div>
	);
};

export default GridShake;
