/**
 * Hides the splash screen and reveals the background image
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
