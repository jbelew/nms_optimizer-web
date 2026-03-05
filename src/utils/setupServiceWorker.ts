import { isBot } from "./isBot";

/**
 * Registers the PWA service worker with Workbox integration.
 * Handles offline capability, app ready status, and update prompts.
 * Skips registration for bot user agents to avoid unnecessary overhead.
 *
 * @returns {void}
 */
export function setupServiceWorkerRegistration() {
	// Conditionally register the service worker for non-bot user agents
	if ("serviceWorker" in navigator && !isBot()) {
		const registerWorker = async (retries = 2) => {
			try {
				// Use a single, shorter timeout or no timeout at all to register after load
				// 1000ms is usually enough to let the main thread settle
				await new Promise((resolve) => setTimeout(resolve, 1000));

				let registerSWModule;

				try {
					registerSWModule = await import("virtual:pwa-register");
				} catch (importError) {
					if (retries > 0) {
						console.warn(
							`PWA import failed, retrying (${retries} left)...`,
							importError
						);

						return registerWorker(retries - 1);
					}

					throw importError;
				}

				const { registerSW } = registerSWModule;

				const updateServiceWorker = registerSW({
					onOfflineReady() {
						console.log("App is ready to work offline");
					},
					onNeedRefresh() {
						// Directly dispatch an event for the UI to handle the update.
						// The onNeedRefresh event is only triggered by Workbox when a
						// new service worker is available and waiting.
						console.log("New service worker available. Prompting user.");
						window.dispatchEvent(
							new CustomEvent("new-version-available", {
								detail: updateServiceWorker, // Pass the updateServiceWorker function
							})
						);
					},
					onRegistered(registration) {
						console.log("Service Worker registered:", registration);
					},
					onRegisterError(error) {
						console.error("Service Worker registration failed:", error);
					},
				});
			} catch (error) {
				// Silently catch PWA registration errors after retries to avoid crashing the app
				// We log it but don't re-throw.
				console.error("Failed to register Service Worker after retries:", error);
			}
		};

		if (document.readyState === "complete") {
			// Page already loaded, register worker
			registerWorker();
		} else {
			// Wait for page load event before registering
			const handleLoad = () => {
				registerWorker();
				window.removeEventListener("load", handleLoad); // Clean up listener
			};

			window.addEventListener("load", handleLoad);
		}
	}
}
