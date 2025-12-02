/**
 * Registers the PWA service worker with Workbox integration.
 * Handles offline capability, app ready status, and update prompts.
 * Skips registration for bot user agents to avoid unnecessary overhead.
 *
 * @returns {void}
 */
export function setupServiceWorkerRegistration() {
	// Conditionally register the service worker for non-bot user agents
	if (
		"serviceWorker" in navigator &&
		!/bot|googlebot|crawler|spider|crawling/i.test(navigator.userAgent)
	) {
		const registerWorker = () => {
			setTimeout(() => {
				import("virtual:pwa-register")
					.then(({ registerSW }) => {
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
					})
					.catch((e) => {
						console.error("Failed to import PWA register:", e);
					});
			}, 2000); // Delay after load event
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
