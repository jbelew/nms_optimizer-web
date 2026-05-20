/**
 * Splash screen visibility management utility.
 *
 * @remarks
 * This module provides functions to hide the application splash screen
 * and reveal the main UI. It coordinates animations and DOM cleanup.
 *
 * @see {@link hideSplashScreenAndShowBackground}
 *
 * @category Utilities
 */

import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { Logger } from "@/utils/system/monitoring";

let isHiding = false;

/**
 * Hides the splash screen and reveals the application background.
 *
 * @remarks
 * This utility uses the `vite-plugin-splash-screen` runtime to perform the hide animation,
 * and then adds a `background-visible` class to the `document.body` to fade in the main UI background.
 * Dispatches an `app-ready` event upon initiation.
 *
 * @returns {Promise<void>} A promise that resolves once the splash screen logic is initiated.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await hideSplashScreenAndShowBackground();
 * // returns Promise<void>
 * ```
 */
export async function hideSplashScreenAndShowBackground(): Promise<void> {
	if (isHiding) {
		return;
	}

	isHiding = true;

	try {
		hideSplashScreen();

		// Dispatch a custom event to signal the app has rendered and is ready
		// This is used to defer non-critical initializations (e.g., analytics)
		window.dispatchEvent(new Event("app-ready"));

		// Show background image with a slight delay to ensure splash screen is hidden
		requestAnimationFrame(() => {
			document.documentElement.classList.add("background-visible");

			// Completely purge all vpss objects from DOM after a short delay
			// to ensure the plugin's fade-out animation is finished.
			// This solves the 'continues to animate' issue.
			setTimeout(() => {
				const vpss = document.getElementById("vpss");

				if (vpss) {
					vpss.remove();
				}

				const vpssStyle = document.getElementById("vpss-style");

				if (vpssStyle) {
					vpssStyle.remove();
				}
			}, 1000);
		});
	} catch (error) {
		Logger.error("Error hiding splash screen", error);
		isHiding = false;
	}
}
