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
 * - Boolean parameter normalization (`"true"` / `"false"`) for BigQuery parity ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 * - Event validation and dispatching.
 * - Web Vitals reporting.
 *
 * @see {@link initializeAnalytics}
 * @see {@link sendEvent}
 *
 * @category Utilities
 */

import type ReactGA from "react-ga4";

import type { AnalyticsEventParams, GA4Event } from "@/types/analytics";
import { API_URL, TRACKING_ID } from "@/constants";
import { isBot, safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

/**
 * Resolved `react-ga4` module instance, accounting for CJS/ESM interop in Rolldown.
 *
 * @category Utilities
 */
let ReactGAInstance: null | typeof ReactGA = null;

/** Event queue for events sent before the ReactGA module loads. */
let queuedEvents: GA4Event[] = [];

export type { AnalyticsEventParams, GA4Event };

/**
 * Payload sent to the backend for server-side analytics.
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
/** Flag indicating if pagehide/visibilitychange flush listeners have been attached. */
let hideListenersRegistered = false;
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
	 * @returns True if in dev mode.
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
 * Normalizes boolean event parameters (except `nonInteraction`) into `"true"` / `"false"` strings.
 *
 * @remarks
 * Client-side `gtag` serializes boolean parameters as strings (`"true"` / `"false"`), whereas
 * the GA4 Measurement Protocol JSON API converts JSON booleans into `int_value` (`1` / `0`) in BigQuery.
 * Normalizing booleans to strings prior to dispatch guarantees identical `string_value` columns
 * across both transports ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @param params - Raw event parameter dictionary.
 *
 * @returns Normalized parameter dictionary with boolean dimensions converted to strings.
 */
const normalizeEventParams = (params: AnalyticsEventParams): AnalyticsEventParams => {
	const normalized: AnalyticsEventParams = {};

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;

		if (key !== "nonInteraction" && typeof value === "boolean") {
			normalized[key] = value ? "true" : "false";
		} else {
			normalized[key] = value;
		}
	}

	return normalized;
};

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
 * 4.  **Timeout Safeguard**: Resolves to `true` after 3s if the network silently drops
 *     the requests without an immediate error.
 *
 * @returns A promise resolving to `true` if blocking is detected.
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
	const probes = [
		`https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`,
		"https://www.google-analytics.com/g/collect",
	];

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
					}),
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

		// 1. Script injection probe (GTM)
		const script = document.createElement("script");
		script.src = probes[0];
		script.async = true;

		let timeoutId: null | ReturnType<typeof setTimeout> = null;
		const controller = new AbortController();

		const finish = (blocked: boolean) => {
			if (settled) return;
			settled = true;

			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}

			controller.abort();

			try {
				script.remove();
			} catch {
				/* noop */
			}

			resolve(blocked);
		};

		// Failsafe timeout for DNS sinkholes (e.g. Pi-hole) or stalled networks
		timeoutId = setTimeout(() => {
			finish(true);
		}, 3000);

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

			if (successes + failures === probes.length) finish(failures > 0);
		};

		script.onerror = () => {
			failures++;
			finish(true);
		};

		// 2. Fetch probe (GA Collect)
		const fetchProbe = async () => {
			try {
				await fetch(probes[1], {
					cache: "no-store",
					method: "HEAD",
					mode: "no-cors",
					signal: controller.signal,
				});

				successes++;

				if (successes + failures === probes.length) finish(failures > 0);
			} catch {
				failures++;
				finish(true);
			}
		};

		try {
			document.head.appendChild(script);
			void fetchProbe();
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
 * @returns A promise resolving to `true` if blocking is detected.
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
 * @returns The extracted ID or null.
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
 * Gets the current client ID, initializing it if necessary.
 *
 * @remarks
 * Lazily invokes {@link initializeAnalyticsClient} when no in-memory client ID
 * has been resolved yet for the current session.
 *
 * @returns The active client ID.
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
 * Builds a standardized GA4 `exception` event payload without stack traces.
 *
 * @remarks
 * Formats `error.name` and `error.message` into a 150-character `description`
 * and omits stack traces in accordance with ADR-0002 and ADR-0003.
 *
 * @param error - The caught or handled error instance.
 * @param fatal - Whether the exception crashed a boundary (`true`) or was handled (`false`).
 * @param [fallbackName="Error"] - Default error name when `error.name` is empty.
 *
 * @returns The standardized `GA4Event` payload for an exception.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const event = buildExceptionEvent(new Error("Boom"), true);
 * // returns { action: "exception", category: "error", description: "Error: Boom", fatal: true, nonInteraction: true }
 * ```
 */
export const buildExceptionEvent = (
	error: Error,
	fatal: boolean,
	fallbackName = "Error",
): GA4Event => ({
	action: "exception",
	category: "error",
	description: `${error.name || fallbackName}: ${error.message}`.slice(0, 150),
	fatal,
	nonInteraction: true,
});

/**
 * Sends an analytics event to the backend for server-side relay.
 *
 * @remarks
 * Normalizes boolean event parameters to `"true"` / `"false"` strings before
 * transmitting over `navigator.sendBeacon` or `fetch(..., { keepalive: true })`.
 *
 * @param eventName - Name of the event.
 * @param [params={}] - Event parameters.
 * @param [userId] - Optional user ID.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendServerEvent("optimize_tech", { solve_method: "SA" });
 * // returns void
 * ```
 */
export const sendServerEvent = (
	eventName: string,
	params: AnalyticsEventParams = {},
	userId?: string,
): void => {
	try {
		const normalizedParams = normalizeEventParams(params);
		const payload: AnalyticsEventPayload = {
			clientId: getClientId(),
			eventName,
			params: {
				...normalizedParams,
				app_version: __APP_VERSION__,
				is_installed: globalIsInstalled ? "yes" : "no",
				tracking_source: "server",
			},
		};

		if (userId) {
			payload.userId = userId;
		}

		const baseUrl =
			API_URL ?
				API_URL.endsWith("/") ?
					API_URL
				:	`${API_URL}/`
			:	"/";
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
 * Attaches `visibilitychange` and `pagehide` listeners once per session so queued
 * pre-initialization events survive early tab close.
 *
 * @returns Side-effects only.
 */
const ensureFlushOnHideListeners = (): void => {
	if (
		hideListenersRegistered
		|| typeof window === "undefined"
		|| typeof document === "undefined"
	) {
		return;
	}

	hideListenersRegistered = true;

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
};

/**
 * Initialize the analytics client with a unique client ID.
 *
 * @remarks
 * Reads the `_ga` cookie if available, falls back to `localStorage`, or generates
 * a new session-scoped `web_<timestamp>_<random>` identifier and attaches early
 * page-hide flush listeners.
 *
 * @returns The initialized client ID.
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
	ensureFlushOnHideListeners();

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
 * Initializes Google Analytics tracking.
 *
 * @remarks
 * Runs ad-blocker detection, initializes `react-ga4` when unblocked, flushes
 * buffered events, and registers Core Web Vitals listeners via {@link reportWebVitals}.
 *
 * @returns Resolves when initialization is complete or skipped.
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

	ensureFlushOnHideListeners();

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
					platform_type: safeGetItem("selectedPlatform") || "standard",
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

	const { reportWebVitals } = await import("./reportWebVitals");
	reportWebVitals(sendEvent);
};

/**
 * Validates that an event has required properties.
 *
 * @param event - Event to validate.
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
 * @param event - Event to send.
 * @param isBlocked - Whether client-side tracking is blocked.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * dispatchEvent({ category: "UI", action: "click" }, false);
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
		ensureFlushOnHideListeners();
		queuedEvents.push(event);

		return;
	}

	const { action, category, ...params } = event;
	const normalizedParams = normalizeEventParams(params);
	ReactGAInstance.event(action, {
		...normalizedParams,
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
 * @param event - The structured event payload to transmit.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendEvent({ action: "page_view", category: "engagement", page_title: "Home" });
 * // returns void
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
 * @remarks
 * Wraps {@link sendEvent} in `requestIdleCallback` (or `setTimeout` fallback). Use
 * this from click/tap handlers where the analytics call is incidental to the
 * interaction. Do NOT use this for late-firing events (Web Vitals,
 * `visibilitychange`, unload) — those must call {@link sendEvent} synchronously.
 *
 * @param event - The structured event payload to transmit.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * onClick={() => sendDeferredEvent({ category: "ui", action: "click_logo" })}
 * // returns void
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
 * @remarks
 * Clears cached ad-blocker detection promises, queued events, and initialization flags.
 *
 * @returns Side-effects only.
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
	hideListenersRegistered = false;
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
	queuedEvents = [];
	ReactGAInstance = null;
};
