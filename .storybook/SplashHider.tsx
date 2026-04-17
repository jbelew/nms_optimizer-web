import React from "react";
import { hideSplashScreenAndShowBackground } from "../src/utils/system/splashScreen";

/**
 * A utility component that ensures the application's splash screen is hidden.
 *
 * This is used within Storybook decorators to prevent the loading overlay from
 * obscuring the components being tested.
 *
 * @returns {null} This component renders nothing.
 *
 * @example Storybook usage
 * ```tsx
 * <SplashHider />
 * ```
 */
export const SplashHider = () => {
	React.useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	return null;
};
