import React from "react";

import { lifecycleCoordinator } from "../src/utils/system/lifecycleCoordinator";

/**
 * A utility component that ensures the application's splash screen is hidden.
 *
 * This is used within Storybook decorators to prevent the loading overlay from
 * obscuring the components being tested.
 *
 * @returns This component renders nothing.
 *
 * @example Storybook usage
 * ```tsx
 * <SplashHider />
 * ```
 */
export const SplashHider = () => {
	React.useEffect(() => {
		lifecycleCoordinator.markReady();
	}, []);

	return null;
};
