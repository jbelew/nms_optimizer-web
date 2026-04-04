import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

let isHiding = false;

/**
 * Hides the splash screen and reveals the application background.
 *
 * This utility uses the `vite-plugin-splash-screen` runtime to perform the hide animation,
 * and then adds a `background-visible` class to the `document.body` to fade in the main UI background.
 *
 * @returns {Promise<void>} A promise that resolves once the splash screen logic is initiated.
 *
 * @example
 * await hideSplashScreenAndShowBackground();
 */
export async function hideSplashScreenAndShowBackground(): Promise<void> {
	if (isHiding) {
		return;
	}

	isHiding = true;

	try {
		hideSplashScreen();

		// Show background image with a slight delay to ensure splash screen is hidden
		requestAnimationFrame(() => {
			document.body.classList.add("background-visible");

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
		console.error("Error hiding splash screen:", error);
		isHiding = false;
	}
}
