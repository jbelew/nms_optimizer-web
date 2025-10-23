// ShakingWrapper.tsx
import "./GridShake.scss";

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
	const ref = React.useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (shaking) {
			ref.current?.classList.add("shake");
			const timer = setTimeout(() => {
				ref.current?.classList.remove("shake");
			}, duration);
			return () => clearTimeout(timer);
		}
	}, [shaking, duration]);

	return (
		<div ref={ref} className={`gridTable__shakeWrapper relative`}>
			{children}
		</div>
	);
};

export default ShakingWrapper;
