// ShakingWrapper.tsx
import "./GridShake.css";

import React, { useEffect } from "react";

interface ShakingWrapperProps {
	shaking: boolean;
	children: React.ReactNode;
	duration: number;
}

/**
 * ShakingWrapper component applies a shaking animation to its children when the `shaking` prop is true.
 * The shaking effect lasts for a specified `duration`.
 *
 * @param {ShakingWrapperProps} props - The props for the ShakingWrapper component.
 * @returns {JSX.Element} The rendered ShakingWrapper component.
 */
const ShakingWrapper: React.FC<ShakingWrapperProps> = ({ shaking, children, duration }) => {
	const [isShaking, setIsShaking] = React.useState(false);

	useEffect(() => {
		if (shaking) {
			setIsShaking(true);
			const timeout = setTimeout(() => {
				setIsShaking(false);
			}, duration);
			return () => clearTimeout(timeout);
		} else {
			setIsShaking(false);
			return;
		}
	}, [shaking, duration]);

	return (
		<div className={`gridTable__shakeWrapper relative ${isShaking ? "shake" : ""}`}>
			{children}
		</div>
	);
};

export default ShakingWrapper;
