import React, { useEffect } from "react";

import { hideSplashScreenAndShowBackground } from "./splashScreen";

/**
 * Component that hides the splash screen and shows the application background.
 * This is typically placed in routes that don't use the standard main layout.
 * @returns {null} This component doesn't render any visible output.
 */
export const SplashscreenHider: React.FC = () => {
	useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	return null; // This component doesn't render anything visible itself
};
