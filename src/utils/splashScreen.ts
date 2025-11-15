/**
 * Hides the splash screen and reveals the background image.
 * Uses the vite-plugin-splash-screen runtime to hide the splash screen,
 * then adds a CSS class to show the background image.
 *
 * @async
 * @returns {Promise<void>} Resolves after the splash screen is hidden.
 * @throws {Error} Logs an error if the splash screen hiding fails.
 *
 * @example
 * await hideSplashScreenAndShowBackground();
 */
export async function hideSplashScreenAndShowBackground() {
	try {
		const { hideSplashScreen } = await import("vite-plugin-splash-screen/runtime");
		hideSplashScreen();

		// Show background image with a slight delay to ensure splash screen is hidden
		requestAnimationFrame(() => {
			document.body.classList.add("background-visible");
		});
	} catch (error) {
		console.error("Error hiding splash screen:", error);
	}
}
