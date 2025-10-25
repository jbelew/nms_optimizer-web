import "./GridShake.scss";

import React, { useEffect, useRef } from "react";

import { useShakeStore } from "../../store/ShakeStore";

interface GridShakeProps {
	children: React.ReactNode;
	duration: number;
}

/**
 * GridShake component applies a shaking animation to its children when the `shakeCount` in the store is incremented.
 * The shaking effect lasts for a specified `duration`.
 *
 * @param {GridShakeProps} props - The props for the GridShake component.
 * @returns {JSX.Element} The rendered GridShake component.
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
		<div ref={ref} className={`gridTable__shakeWrapper relative`}>
			{children}
		</div>
	);
};

export default GridShake;
