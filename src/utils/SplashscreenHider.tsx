import React, { useEffect } from "react";

import { hideSplashScreenAndShowBackground } from "./splashScreen";

export const SplashscreenHider: React.FC = () => {
	useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	return null; // This component doesn't render anything visible itself
};
