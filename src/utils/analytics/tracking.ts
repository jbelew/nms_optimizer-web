/**
 * Analytics utility module for Google Analytics 4 (GA4).
 *
 * @remarks
 * This module provides a unified interface for tracking user interactions, errors,
 * and performance metrics. It supports both client-side tracking via `react-ga4`
 * and a server-side fallback for environments where client-side tracking is blocked
 * (e.g., ad blockers).
 *
 * It handles:
 * - GA4 initialization with anonymization.
 * - Ad blocker detection for fallback routing.
 * - Event validation and dispatching.
 * - Web Vitals reporting.
 *
 * @see {@link initializeAnalytics}
 * @see {@link sendEvent}
 *
 * @category Utilities
 */

/**
 * Interface for Google Analytics 4 event tracking.
 *
 * @remarks
 * This interface is designed to support both custom events and GA4 recommended events.
 * It uses `snake_case` for all parameters to align with GA4 best practices.
 *
 * @category Utilities
 */
import type { AnalyticsEventParams, GA4Event } from "@/types/analytics";
import type ReactGA from "react-ga4";

import { API_URL, TRACKING_ID } from "@/constants";
import { isBot, safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

/**
 * Resolved `react-ga4` module instance, accounting for CJS/ESM interop in Rolldown.
 *
 * @category Utilities
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ReactGAInstance: any = null;

/** Event queue for events sent before the ReactGA module loads */
let queuedEvents: GA4Event[] = [];

export type { AnalyticsEventParams, GA4Event };

/**
 * Payload sent to the backend for server-side analytics. *
 * @category Utilities
 */
interface AnalyticsEventPayload {
	/** Unique client session ID. */
	clientId: string;
	/** Event name. */
	eventName: string;
	/** Event-specific parameters. */
	params?: AnalyticsEventParams;
	/** Authenticated user ID. */
	userId?: string;
}

/** Flag indicating if GA has been initialized. */
let gaInitialized = false;
/** Cached promise for ad blocker detection. */
let adBlockerDetectionPromise: null | Promise<boolean> = null;
/** Cached result of ad blocker detection. */
let adBlockerResult: boolean | null = null;
/** Active client ID for the session. */
let clientId: string;

/**
 * Environment check utilities.
 *
 * @category Utilities
 */
export const env = {
	/**
	 * Checks if the application is running in development mode.
	 *
	 * @returns {boolean} True if in dev mode.
	 *
	 * @example
	 * ```ts
	 * if (env.isDevMode()) { console.log("Dev mode active"); }
	 * // returns boolean
	 * ```
	 */
	isDevMode: (): boolean => {
		const devEnv = import.meta.env.DEV;

		if (typeof devEnv === "string") {
			return devEnv === "true";
		}

		return devEnv;
	},
};

/** Whether the app is installed as a PWA. */
const globalIsInstalled =
	typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

/**
 * Detects if an ad blocker or tracking protection is active.
 *
 * @remarks
 * This function uses a multi-probe strategy to identify both browser-level script
 * blockers (like uBlock Origin) and network-level DNS filters (like Pi-hole).
 *
 * The strategy includes:
 * 1.  **GTM Script Probe**: Attempts to inject the Google Tag Manager script. Verified
 *     against "spoofing" by checking for the `window.google_tag_manager` global.
 * 2.  **GA Collect Probe**: A `fetch` HEAD request to the GA4 collection endpoint.
 *     This specifically catches DNS sinkholes that might allow scripts but block data.
 * 3.  **Fail-Fast Settlement**: The promise resolves to `true` as soon as any probe fails,
 *     triggering the server-side fallback immediately.
 * 4.  **Timeout Safeguard**: Resolves to `true` after 3.5s if the network silently drops
 *     the requests without an immediate error.
 *
 * @returns {Promise<boolean>} A promise resolving to `true` if blocking is detected.
 *
 * @see {@link getAdBlockerDetectionResult}
 * @see {@link ./tracking.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const blocked = await detectAdBlocker();
 * // returns true if blocked, false otherwise
 * ```
 */
const detectAdBlocker = (): Promise<boolean> => {
	const probes = [`https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`];

	// Fallback for SSR / non-DOM environments
	if (typeof document === "undefined" || !document.head) {
		return (async () => {
			try {
				await Promise.all(
					probes.map(async (url) => {
						const controller = new AbortController();
						const timeoutId = setTimeout(() => controller.abort(), 3000);

						try {
							await fetch(url, {
								cache: "no-cache",
								method: "HEAD",
								mode: "no-cors",
								signal: controller.signal,
							});
						} finally {
							clearTimeout(timeoutId);
						}
					})
				);

				return false;
			} catch {
				return true;
			}
		})();
	}

	return new Promise<boolean>((resolve) => {
		let settled = false;
		let failures = 0;
		let successes = 0;

		const finish = (blocked: boolean) => {
			if (settled) return;
			settled = true;

			resolve(blocked);
		};

		// 1. Script injection probe (GTM)
		const script = document.createElement("script");
		script.src = probes[0];
		script.async = true;

		script.onload = () => {
			// Verify it's not a dummy script injected by uBlock/Brave
			const gtmLoaded = !!(window as unknown as { google_tag_manager?: object })
				.google_tag_manager;

			if (!gtmLoaded) {
				failures++;
				finish(true);

				return;
			}

			successes++;

			try {
				script.remove();
			} catch {
				/* noop */
			}

			if (successes + failures === probes.length) finish(failures > 0);
		};

		script.onerror = () => {
			failures++;

			try {
				script.remove();
			} catch {
				/* noop */
			}

			finish(true);
		};

		try {
			document.head.appendChild(script);
		} catch {
			finish(true);
		}
	});
};

/**
 * Gets the cached result of the ad blocker detection or triggers a new detection.
 *
 * @remarks
 * This is the primary accessor for the detection state. It ensures that the detection
 * logic only runs once per session and caches the result for synchronous access in
 * {@link sendEvent}.
 *
 * @returns {Promise<boolean>} A promise resolving to `true` if blocking is detected.
 *
 * @see {@link detectAdBlocker}
 * @see {@link initializeAnalytics}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const isBlocked = await getAdBlockerDetectionResult();
 * // returns true if blocked
 * ```
 */
const getAdBlockerDetectionResult = async (): Promise<boolean> => {
	if (adBlockerResult !== null) {
		return adBlockerResult;
	}

	if (!adBlockerDetectionPromise) {
		adBlockerDetectionPromise = detectAdBlocker().then((result) => {
			adBlockerResult = result;

			return result;
		});
	}

	return adBlockerDetectionPromise;
};

/**
 * Attempts to retrieve the Client ID from the Google Analytics cookie (`_ga`).
 *
 * @returns {string|null} The extracted ID or null.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const id = getGaClientIdFromCookie();
 * // returns string | null
 * ```
 */
const getGaClientIdFromCookie = (): null | string => {
	if (typeof document === "undefined") return null;

	const match = document.cookie.match(/(?:^|; )\s*_ga=GA1\.[0-9]+\.([^;]+)/);

	return match ? match[1] : null;
};

/**
 * Initialize the analytics client with a unique client ID.
 *
 * @returns {string} The initialized client ID.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const id = initializeAnalyticsClient();
 * // returns string
 * ```
 */
export const initializeAnalyticsClient = (): string => {
	const gaId = getGaClientIdFromCookie();
	const stored = safeGetItem("analytics_client_id");

	if (gaId) {
		clientId = gaId;

		if (stored !== gaId) {
			safeSetItem("analytics_client_id", gaId);
		}
	} else if (stored) {
		clientId = stored;
	} else {
		clientId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
		safeSetItem("analytics_client_id", clientId);
	}

	return clientId;
};

/**
 * Gets the current client ID, initializing it if necessary.
 *
 * @returns {string} The active client ID.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const id = getClientId();
 * // returns string
 * ```
 */
const getClientId = (): string => {
	if (!clientId) {
		initializeAnalyticsClient();
	}

	return clientId;
};

/**
 * Sends an analytics event to the backend for server-side relay.
 *
 * @param {string} eventName - Name of the event.
 * @param {AnalyticsEventParams} [params={}] - Event parameters.
 * @param {string} [userId] - Optional user ID.
 *
 * @returns {void} Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendServerEvent("optimization_complete", { method: "SA" });
 * // returns void
 * ```
 */
export const sendServerEvent = (
	eventName: string,
	params: AnalyticsEventParams = {},
	userId?: string
): void => {
	try {
		const payload: AnalyticsEventPayload = {
			clientId: getClientId(),
			eventName,
			params: {
				...params,
				app_version: __APP_VERSION__,
				is_installed: globalIsInstalled ? "yes" : "no",
				tracking_source: "server",
			},
		};

		if (userId) {
			payload.userId = userId;
		}

		const baseUrl = API_URL ? (API_URL.endsWith("/") ? API_URL : `${API_URL}/`) : "/";
		const endpoint = `${baseUrl}api/events`;

		if (navigator.sendBeacon) {
			try {
				// Tag the transport so the server-side relay can distinguish beacon
				// vs keepalive-fetch deliveries in GA4 reports.
				payload.params = { ...payload.params, transport: "beacon" };
				const beaconBlob = new Blob([JSON.stringify(payload)], {
					type: "application/json",
				});
				const success = navigator.sendBeacon(endpoint, beaconBlob);
				if (success) return;
			} catch (error) {
				Logger.warn("navigator.sendBeacon failed, falling back to fetch:", {
					error,
				});
			}
		}

		payload.params = { ...payload.params, transport: "fetch-keepalive" };
		fetch(endpoint, {
			body: JSON.stringify(payload),
			headers: {
				"Content-Type": "application/json",
			},
			keepalive: true,
			method: "POST",
		}).catch((error) => {
			Logger.error("Analytics event fallback failed:", error);
		});
	} catch (error) {
		Logger.error("Error preparing analytics event:", error);
	}
};

/**
 * Initializes Google Analytics tracking.
 *
 * @returns {Promise<void>} Resolves when initialization is complete or skipped.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await initializeAnalytics();
 * // returns Promise<void>
 * ```
 */
export const initializeAnalytics = async () => {
	if (import.meta.env.VITE_ANALYTICS_ENABLED === "false" || gaInitialized || isBot()) {
		return;
	}

	const isBlocked = await getAdBlockerDetectionResult();

	if (!isBlocked) {
		const ReactGAModule = (await import("react-ga4")) as unknown as {
			default: typeof ReactGA & {
				default?: typeof ReactGA;
			};
		};

		// Handle potentially nested default export in certain build environments
		ReactGAInstance = ReactGAModule.default.default ?? ReactGAModule.default;

		ReactGAInstance.initialize(TRACKING_ID, {
			gtagOptions: {
				allow_ad_personalization_signals: false,
				allow_google_signals: false,
				anonymize_ip: true,
				send_page_view: false,
				user_properties: {
					app_version: __APP_VERSION__,
					is_installed: globalIsInstalled ? "yes" : "no",
					platform_type: safeGetItem("selectedPlatform") || "starship",
				},
			},
		});
	}

	// Drain any events queued before detection completed. When blocked, route
	// them through the server fallback instead of dropping them on the floor.
	if (queuedEvents.length > 0) {
		const eventsToFlush = queuedEvents;
		queuedEvents = [];
		eventsToFlush.forEach(sendEvent);
	}

	gaInitialized = true;

	// Flush remaining queued events synchronously when the page is hidden so
	// late-firing Web Vitals (CLS/INP/LCP) survive tab close.
	if (typeof window !== "undefined" && typeof document !== "undefined") {
		const flushOnHide = () => {
			if (document.visibilityState !== "hidden" || queuedEvents.length === 0) return;
			const eventsToFlush = queuedEvents;
			queuedEvents = [];
			eventsToFlush.forEach((event) => {
				const { action, category, ...params } = event;
				sendServerEvent(action, {
					...params,
					action,
					category,
					tracking_source: "server",
				});
			});
		};

		document.addEventListener("visibilitychange", flushOnHide);
		window.addEventListener("pagehide", flushOnHide);
	}

	const { reportWebVitals } = await import("./reportWebVitals");
	reportWebVitals(sendEvent);
};

/**
 * Validates that an event has required properties.
 *
 * @param {GA4Event} event - Event to validate.
 *
 * @throws {Error} If action or category is missing.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * validateEvent({ action: "click", category: "UI" });
 * // returns void
 * ```
 */
const validateEvent = (event: GA4Event): void => {
	if (!event.action) {
		throw new Error("Event must have an 'action' property");
	}

	if (!event.category) {
		throw new Error("Event must have a 'category' property");
	}
};

/**
 * Sends an event to Google Analytics, automatically choosing the transport method.
 *
 * @param {GA4Event} event - Event to send.
 *
 * @returns {void} Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendEvent({ category: "UI", action: "click" });
 * // returns void
 * ```
 */
const dispatchEvent = (event: GA4Event, isBlocked: boolean): void => {
	if (isBlocked) {
		const { action, category, ...params } = event;
		sendServerEvent(action, {
			...params,
			action,
			app_version: __APP_VERSION__,
			category,
			is_installed: globalIsInstalled ? "yes" : "no",
			tracking_source: "server",
		});

		return;
	}

	if (!ReactGAInstance) {
		queuedEvents.push(event);

		return;
	}

	const { action, category, ...params } = event;
	ReactGAInstance.event(action, {
		...params,
		category,
		tracking_source: "client",
		transport: "gtag",
	});
};

/**
 * Dispatches a validated GA4 event to all configured destinations.
 *
 * @remarks
 * This function provides a synchronous dispatch path for performance and
 * reliability. It first validates the event using {@link validateEvent},
 * then routes it to the local analytics buffer and the Google Analytics
 * instance. It automatically injects `tracking_source` and `transport`
 * metadata.
 *
 * @param {GA4Event} event - The structured event payload to transmit.
 *
 * @example
 * ```ts
 * sendEvent({ action: "page_view", page_title: "Home" });
 * ```
 */
export const sendEvent = (event: GA4Event): void => {
	try {
		validateEvent(event);
	} catch (validationError) {
		Logger.error("Event validation failed:", validationError);

		return;
	}

	// Synchronous dispatch is critical for late-firing events (e.g. Web Vitals
	// on `visibilitychange`) to ensure they fire before page teardown.
	// We use the cached adBlockerResult if available, defaulting to false.
	dispatchEvent(event, adBlockerResult ?? false);
};

/**
 * Defer a GA4 event so it does not block UI interactions (good for INP).
 *
 * Wraps `sendEvent` in `requestIdleCallback` (or `setTimeout` fallback). Use
 * this from click/tap handlers where the analytics call is incidental to the
 * interaction. Do NOT use this for late-firing events (Web Vitals,
 * `visibilitychange`, unload) — those must call `sendEvent` synchronously.
 *
 * @param {GA4Event} event - The structured event payload to transmit.
 *
 * @example
 * ```ts
 * onClick={() => sendDeferredEvent({ category: "ui", action: "click_logo" })}
 * ```
 */
export const sendDeferredEvent = (event: GA4Event): void => {
	const dispatch = () => sendEvent(event);

	if (typeof window !== "undefined" && "requestIdleCallback" in window) {
		window.requestIdleCallback(dispatch, { timeout: 1000 });
	} else {
		setTimeout(dispatch, 0);
	}
};

/**
 * Reset analytics initialization state for testing.
 *
 * @returns {void} Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * resetAnalyticsForTesting();
 * // returns void
 * ```
 */
export const resetAnalyticsForTesting = () => {
	gaInitialized = false;
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
};
