import React, { useEffect } from "react";

import { hideSplashScreenAndShowBackground } from "./splashScreen";

/**
 * A utility component that triggers the hiding of the splash screen.
 *
 * This component is intended for use in routes or layouts that do not include
 * the standard `MainAppContent` logic. It ensures that the splash screen is
 * dismissed and the main background is revealed upon mounting.
 *
 * @returns {null} This component does not render any visual elements.
 *
 * @example
 * <SplashscreenHider />
 */
export const SplashscreenHider: React.FC = () => {
	useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	return null; // This component doesn't render anything visible itself
};
