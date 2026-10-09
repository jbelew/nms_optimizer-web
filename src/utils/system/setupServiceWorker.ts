/**
 * Service Worker registration utility for PWA capabilities.
 *
 * @remarks
 * This module handles the registration of the application's service worker,
 * enabling offline support and update prompts.
 *
 * @see {@link setupServiceWorkerRegistration}
 * @see {@link ./setupServiceWorker.test.ts Unit Tests}
 *
 * @category Utilities
 */

import { registerSW } from "virtual:pwa-register";

import { isBot } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

/**
 * Registers the PWA service worker using Vite PWA's standard registration.
 *
 * @remarks
 * This setup enables offline capabilities, background sync, and update prompts.
 * Registration is deferred until the page has loaded and is skipped for bots.
 *
 * When a new version is available, it dispatches a `new-version-available`
 * custom event on the `window` object. The event detail contains a wrapper
 * function that triggers the service worker update to avoid race conditions
 * during registration.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link isBot}
 * @see {@link ./setupServiceWorker.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * setupServiceWorkerRegistration();
 * // returns void
 * ```
 */
export function setupServiceWorkerRegistration() {
	// Conditionally register the service worker for non-bot user agents
	if ("serviceWorker" in navigator && !isBot()) {
		const registerWorker = async () => {
			try {
				// Use a single, shorter timeout or no timeout at all to register after load
				// 1000ms is usually enough to let the main thread settle
				await new Promise((resolve) => setTimeout(resolve, 1000));

				const updateServiceWorker = registerSW({
					onNeedRefresh() {
						// Use a small timeout to ensure the updateServiceWorker assignment is complete
						// and wrap the call to ensure it resolves correctly at execution time.
						setTimeout(() => {
							window.dispatchEvent(
								new CustomEvent("new-version-available", {
									detail: (reload?: boolean) => {
										return updateServiceWorker(reload);
									},
								})
							);
						}, 0);
					},
					onOfflineReady() {},
					onRegistered(registration) {
						if (!registration) return;

						// Check for SW updates when the user returns to the tab
						document.addEventListener("visibilitychange", () => {
							if (
								document.visibilityState === "visible" &&
								!registration.installing
							) {
								void registration.update().catch(() => {});
							}
						});

						// Also periodically check for updates once per hour during long-running sessions
						setInterval(
							() => {
								if (!registration.installing) {
									void registration.update().catch(() => {});
								}
							},
							60 * 60 * 1000 // every 1 hour
						);
					},
					onRegisterError(error) {
						Logger.error("Service Worker registration failed", error);
					},
				});
			} catch (error) {
				// Silently catch PWA registration errors
				// We log it but don't re-throw.
				Logger.error("Failed to register Service Worker", error);
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
