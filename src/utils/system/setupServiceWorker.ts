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

import { isBot } from "../browser/environment";

/**
 * Registers the PWA service worker using Vite PWA's standard registration.
 *
 * @remarks
 * This setup enables offline capabilities, background sync, and update prompts.
 * Registration is deferred until the page has loaded and is skipped for bots.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link isBot}
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
					onOfflineReady() {},
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
					onRegistered(registration) {
						if (!registration) return;

						// Periodically check for SW updates (every 60s).
						// This catches the case where a new SW enters the
						// `waiting` state but the `statechange` event was
						// missed because registration was deferred.
						setInterval(
							async () => {
								// Skip if another install is already in progress
								if (registration.installing) return;

								// Use fetch to check if the SW script changed,
								// bypassing the HTTP cache to get a fresh copy.
								try {
									const resp = await fetch("/sw.js", {
										cache: "no-store",
										headers: { "cache-control": "no-cache" },
									});

									if (resp?.status === 200) {
										await registration.update();
									}
								} catch {
									// Network error — skip this cycle
								}
							},
							60 * 1000 // every 60 seconds
						);
					},
					onRegisterError(error) {
						console.error("Service Worker registration failed:", error);
					},
				});
			} catch (error) {
				// Silently catch PWA registration errors
				// We log it but don't re-throw.
				console.error("Failed to register Service Worker:", error);
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
