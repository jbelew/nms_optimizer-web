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
 * Payload interface for version information served from `/version.json`.
 */
interface VersionPayload {
	/** ISO timestamp when the application was built. */
	buildDate?: string;
	/** Semantic version string of the release. */
	version?: string;
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
 * @param [updateSW] - Function provided by Vite PWA / Workbox to trigger service worker activation.
 * @param [customRegistration] - Optional registration override for testing.
 * @param [maxTimeoutMs=3000] - Maximum milliseconds to wait for network update check and installation before proceeding.
 *
 * @returns Resolves when activation and reload have been initiated.
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
	maxTimeoutMs = 3000,
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
							!settled
							&& (worker.state === "installed" || worker.state === "redundant")
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
					!finished
					&& (waitingWorker.state === "activated" || waitingWorker.state === "redundant")
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
 * Activates a confirmed **Staged Worker** with a 2.5-second fallback reload timer and
 * **PWA Self-Healing** eviction on activation failure.
 *
 * @remarks
 * Calls {@link activateLatestServiceWorker} so that if newer deployments landed while
 * the prompt was open, the client skips directly to the latest worker. If activation
 * does not trigger a controlling reload within 2.5 seconds, forces `window.location.reload()`.
 * If activation rejects, runs {@link evictStaleServiceWorkers} before reloading.
 *
 * @param updateSW - Callback provided by the Service Worker registration to trigger activation.
 *
 * @returns Resolves once activation or fallback recovery has been scheduled.
 *
 * @see {@link activateLatestServiceWorker}
 * @see {@link evictStaleServiceWorkers}
 * @see {@link ./setupServiceWorker.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await applyStagedServiceWorkerUpdate(updateSW);
 * // activates staged worker with self-healing fallback
 * ```
 */
export async function applyStagedServiceWorkerUpdate(
	updateSW?: (reloadPage?: boolean) => Promise<void>,
): Promise<void> {
	try {
		await activateLatestServiceWorker(updateSW);
		setTimeout(() => {
			if (typeof window !== "undefined") {
				window.location.reload();
			}
		}, 2500);
	} catch {
		await evictStaleServiceWorkers().finally(() => {
			if (typeof window !== "undefined") {
				window.location.reload();
			}
		});
	}
}

/**
 * Evicts active service worker registrations and purges all CacheStorage entries.
 *
 * @remarks
 * Used for self-healing recovery when a client is stranded on stale or corrupt
 * service worker state, or during emergency reset actions.
 *
 * @returns Resolves to true if any service workers were unregistered, false otherwise.
 *
 * @see {@link ./setupServiceWorker.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const evicted = await evictStaleServiceWorkers();
 * // returns boolean
 * if (evicted) {
 *   window.location.reload();
 * }
 * ```
 */
export async function evictStaleServiceWorkers(): Promise<boolean> {
	let unregisteredAny = false;

	if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
		try {
			const registrations = await navigator.serviceWorker.getRegistrations();

			if (registrations && registrations.length > 0) {
				await Promise.all(registrations.map((reg) => reg.unregister()));
				unregisteredAny = true;
			}
		} catch (error) {
			Logger.warn("Failed to unregister service workers during eviction", { error });
		}
	}

	if (typeof window !== "undefined" && "caches" in window) {
		try {
			const cacheNames = await caches.keys();
			await Promise.all(cacheNames.map((name) => caches.delete(name)));
		} catch (error) {
			Logger.warn("Failed to delete cache storage during eviction", { error });
		}
	}

	return unregisteredAny;
}

/**
 * Determines whether the application tab is currently hidden or idle.
 *
 * @returns True if the tab is hidden or inactive for longer than the idle threshold.
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
 * @param timestamp - The unix timestamp in milliseconds.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * setLastUserActivityForTesting(Date.now() - 600_000);
 * // overrides internal activity timestamp for idle tests
 * ```
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
 * @returns Side-effects only.
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

				let reloadIntent: "idle" | "requested" | "suppressed" = "idle";

				const updateServiceWorker = registerSW({
					immediate: true,
					onNeedRefresh() {
						// If the tab is currently hidden or idle, apply the update silently
						// so the user returns to an already-updated application.
						if (isAppHiddenOrIdle()) {
							reloadIntent = "requested";
							void updateServiceWorker(true);

							return;
						}

						// Use a small timeout to ensure the updateServiceWorker assignment is complete
						// and wrap the call to ensure it resolves correctly at execution time.
						setTimeout(() => {
							window.dispatchEvent(
								new CustomEvent("new-version-available", {
									detail: (reload?: boolean) => {
										reloadIntent =
											reload === false ? "suppressed" : "requested";

										return updateServiceWorker(reload);
									},
								}),
							);
						}, 0);
					},
					onNeedReload() {
						if (reloadIntent === "suppressed") {
							reloadIntent = "idle";

							return;
						}

						if (reloadIntent === "requested" || isAppHiddenOrIdle()) {
							reloadIntent = "idle";
							window.location.reload();
						}
					},
					onOfflineReady() {},
					onRegistered(registration) {
						if (!registration) return;

						// Check for SW updates when the user returns to the tab,
						// or silently apply a waiting update when the tab becomes hidden.
						document.addEventListener("visibilitychange", () => {
							if (document.visibilityState === "hidden") {
								if (registration.waiting) {
									reloadIntent = "requested";
									void updateServiceWorker(true);
								}

								return;
							}

							if (
								document.visibilityState === "visible"
								&& !registration.installing
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
							60 * 60 * 1000, // every 1 hour
						);
					},
					onRegisterError(error) {
						Logger.warn("Service Worker registration failed", { error });
					},
				});
			} catch (error) {
				// Silently catch PWA registration errors
				// We log it as a warning but don't re-throw.
				Logger.warn("Failed to register Service Worker", { error });
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

/**
 * Verifies against `/version.json` whether a **Staged Worker** represents a release newer
 * than the currently running client bundle, suppressing false-positive prompts via
 * **Silent Background Activation**.
 *
 * @remarks
 * If `/version.json` matches the running `__BUILD_DATE__` and `__APP_VERSION__`, the
 * **Staged Worker** is commanded to activate silently (`updateSW(false)`) without
 * reloading the page, and this function resolves to `false`. If a newer release is
 * detected or if `/version.json` cannot be verified (offline fail-safe), it resolves
 * to `true`.
 *
 * @param updateSW - Callback provided by the Service Worker registration to trigger activation.
 *
 * @returns Resolves to `true` when the user should be prompted for an update, or `false` when suppressed.
 *
 * @see {@link setupServiceWorkerRegistration}
 * @see {@link ./setupServiceWorker.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const shouldPrompt = await verifyStagedUpdateFreshness(updateSW);
 * // returns boolean
 * ```
 */
export async function verifyStagedUpdateFreshness(
	updateSW?: (reloadPage?: boolean) => Promise<void>,
): Promise<boolean> {
	try {
		const response = await fetch("/version.json", { cache: "no-store" });

		if (!response.ok) {
			throw new Error(`Failed to fetch version.json: HTTP ${response.status}`);
		}

		const data = (await response.json()) as VersionPayload;

		if (!data || (!data.buildDate && !data.version)) {
			throw new Error("version.json response missing buildDate and version fields");
		}

		const latestBuildDate = data.buildDate;
		const currentBuildDate = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : undefined;

		const latestVersion = data.version;
		const currentVersion = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : undefined;

		const isDifferentVersion =
			Boolean(latestBuildDate && currentBuildDate && latestBuildDate !== currentBuildDate)
			|| Boolean(latestVersion && currentVersion && latestVersion !== currentVersion);

		if (isDifferentVersion) {
			return true;
		}

		Logger.info("Update prompt suppressed: running client matches latest release", {
			currentBuildDate,
			currentVersion,
			latestBuildDate,
			latestVersion,
		});

		if (updateSW) {
			void updateSW(false);
		}

		return false;
	} catch (error) {
		Logger.warn("Failed to verify version freshness; falling back to prompt", {
			error,
		});

		return true;
	}
}
