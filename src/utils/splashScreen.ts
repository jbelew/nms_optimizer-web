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
		const { hideSplashScreen } = await import("vite-plugin-splash-screen/runtime");
		hideSplashScreen();

		// Show background image with a slight delay to ensure splash screen is hidden
		requestAnimationFrame(() => {
			document.body.classList.add("background-visible");
		});
	} catch (error) {
		console.error("Error hiding splash screen:", error);
		isHiding = false;
	}
}
