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

/** Inactivity threshold in milliseconds to consider the application idle (30 minutes). */
const IDLE_INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000;

/** Timeout in milliseconds to wait for a waiting service worker to transition to activated state. */
const WAITING_WORKER_ACTIVATION_TIMEOUT_MS = 1500;

let lastUserActivityTimestamp = Date.now();

if (typeof window !== "undefined") {
	const recordActivity = () => {
		lastUserActivityTimestamp = Date.now();
	};

	["mousedown", "keydown", "touchstart", "scroll"].forEach((eventName) => {
		window.addEventListener(eventName, recordActivity, { passive: true });
	});
}

/**
 * Verifies that the service worker about to be activated is the latest available version
 * on the server, and triggers the update and page reload.
 *
 * @remarks
 * If the application has been open for an extended period, multiple deployments
 * may have occurred after the waiting service worker was staged. Calling `registration.update()`
 * ensures that if an even newer version exists on the server, it begins installing.
 * If a newer version is installing, this function waits for it to finish installing so the
 * user skips directly to the newest release without having to reload multiple times.
 *
 * If `registration.update()` fails (e.g. offline, timeout, network glitch), it safely falls
 * back to activating the existing waiting worker immediately.
 *
 * @param {((reload?: boolean) => Promise<void>) | undefined} [updateSW] - Function provided by Vite PWA / Workbox to trigger service worker activation.
 * @param {ServiceWorkerRegistration} [customRegistration] - Optional registration override for testing.
 * @param {number} [maxTimeoutMs=3000] - Maximum milliseconds to wait for network update check and installation before proceeding.
 *
 * @returns {Promise<void>} Resolves when activation and reload have been initiated.
 *
 * @default 3000
 *
 * @see {@link setupServiceWorkerRegistration}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await activateLatestServiceWorker(updateSW);
 * // resolves void
 * ```
 */
export async function activateLatestServiceWorker(
	updateSW?: (reload?: boolean) => Promise<void>,
	customRegistration?: ServiceWorkerRegistration,
	maxTimeoutMs = 3000
): Promise<void> {
	let registration = customRegistration;

	try {
		if (!registration && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
			registration = await navigator.serviceWorker?.getRegistration();
		}

		if (registration) {
			const activeReg = registration;
			// Bounded update check: race network update check and install against maxTimeoutMs
			await new Promise<void>((resolve) => {
				let settled = false;
				const timer = setTimeout(() => {
					if (!settled) {
						settled = true;
						resolve();
					}
				}, maxTimeoutMs);

				const handleInstallingWorker = (worker: ServiceWorker) => {
					if (worker.state === "installed" || worker.state === "redundant") {
						if (!settled) {
							settled = true;
							clearTimeout(timer);
							resolve();
						}

						return;
					}

					worker.addEventListener("statechange", () => {
						if (
							!settled &&
							(worker.state === "installed" || worker.state === "redundant")
						) {
							settled = true;
							clearTimeout(timer);
							resolve();
						}
					});
				};

				activeReg
					.update()
					.then(() => {
						if (activeReg.installing) {
							handleInstallingWorker(activeReg.installing);
						} else if (!settled) {
							settled = true;
							clearTimeout(timer);
							resolve();
						}
					})
					.catch(() => {
						if (!settled) {
							settled = true;
							clearTimeout(timer);
							resolve();
						}
					});
			});
		}
	} catch (error) {
		Logger.warn("Failed to check for newer service worker update before activation", { error });
	}

	if (registration?.waiting) {
		const waitingWorker = registration.waiting;

		await new Promise<void>((resolve) => {
			if (waitingWorker.state === "activated" || waitingWorker.state === "redundant") {
				if (updateSW) {
					void updateSW(true);
				}

				resolve();

				return;
			}

			let finished = false;

			const onStateChange = () => {
				if (
					!finished &&
					(waitingWorker.state === "activated" || waitingWorker.state === "redundant")
				) {
					finished = true;
					clearTimeout(timer);
					waitingWorker.removeEventListener("statechange", onStateChange);
					resolve();
				}
			};

			const timer = setTimeout(() => {
				if (!finished) {
					finished = true;
					waitingWorker.removeEventListener("statechange", onStateChange);
					resolve();
				}
			}, WAITING_WORKER_ACTIVATION_TIMEOUT_MS);

			waitingWorker.addEventListener("statechange", onStateChange);

			if (updateSW) {
				void updateSW(true);
			} else {
				waitingWorker.postMessage({ type: "SKIP_WAITING" });
			}
		});

		if (!updateSW && typeof window !== "undefined") {
			window.location.reload();
		}
	} else if (updateSW) {
		await updateSW(true);
	} else if (typeof window !== "undefined") {
		window.location.reload();
	}
}

/**
 * Determines whether the application tab is currently hidden or idle.
 *
 * @returns {boolean} True if the tab is hidden or inactive for longer than the idle threshold.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const hiddenOrIdle = isAppHiddenOrIdle();
 * // returns boolean
 * ```
 */
export function isAppHiddenOrIdle(): boolean {
	if (typeof document === "undefined") return false;
	const isHidden = document.visibilityState === "hidden";
	const isIdle = Date.now() - lastUserActivityTimestamp > IDLE_INACTIVITY_THRESHOLD_MS;

	return isHidden || isIdle;
}

/**
 * Sets the last user activity timestamp for testing purposes.
 *
 * @param {number} timestamp - The unix timestamp in milliseconds.
 *
 * @returns {void} Side-effects only.
 *
 * @internal
 */
export function setLastUserActivityForTesting(timestamp: number): void {
	lastUserActivityTimestamp = timestamp;
}

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
						// If the tab is currently hidden or idle, apply the update silently
						// so the user returns to an already-updated application.
						if (isAppHiddenOrIdle()) {
							void updateServiceWorker(true);

							return;
						}

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

						// Check for SW updates when the user returns to the tab,
						// or silently apply a waiting update when the tab becomes hidden.
						document.addEventListener("visibilitychange", () => {
							if (document.visibilityState === "hidden") {
								if (registration.waiting) {
									void updateServiceWorker(true);
								}

								return;
							}

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
