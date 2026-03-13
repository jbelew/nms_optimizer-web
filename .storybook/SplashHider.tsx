import React from "react";
import { hideSplashScreenAndShowBackground } from "../src/utils/splashScreen";

export const SplashHider = () => {
	React.useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	return null;
};
