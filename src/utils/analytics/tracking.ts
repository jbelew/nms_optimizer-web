/**
 * Analytics utility module for Google Analytics 4 (GA4) and Core Web Vitals.
 *
 * @remarks
 * This module provides a deep, unified interface for tracking user interactions, errors,
 * and Core Web Vitals performance metrics. It supports both client-side tracking via `react-ga4`
 * and a server-side Measurement Protocol relay (`/api/events`) for environments where
 * client-side tracking is blocked (e.g., ad blockers or DNS sinkholes).
 *
 * It encapsulates:
 * - Disabled and bot/crawler guards across both client and server-relay paths.
 * - Client session ID resolution (`_ga` cookie, `localStorage`, or generated `web_<ts>_<rand>`).
 * - Multi-probe ad-blocker detection with a 3-second timeout safeguard.
 * - Pre-initialization event buffering and early `visibilitychange` / `pagehide` flushing.
 * - Boolean parameter normalization (`"true"` / `"false"`) for BigQuery parity ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 * - Core Web Vitals (`CLS`, `INP`, `FCP`, `LCP`, `TTFB`) observer registration and DOM attribution.
 *
 * @see {@link initializeAnalytics}
 * @see {@link sendEvent}
 * @see {@link sendDeferredEvent}
 * @see {@link buildExceptionEvent}
 *
 * @category Utilities
 */

import type ReactGA from "react-ga4";
import type {
	CLSMetricWithAttribution,
	INPMetricWithAttribution,
	LCPMetricWithAttribution,
	Metric,
} from "web-vitals/attribution";

import type { AnalyticsEventParams, GA4Event, PerformanceMetricGA4Event } from "@/types/analytics";
import { API_URL, TRACKING_ID } from "@/constants";
import { isBot, safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

declare const __APP_VERSION__: string;

/**
 * Resolved `react-ga4` module instance, accounting for CJS/ESM interop in Rolldown.
 *
 * @category Utilities
 */
let ReactGAInstance: null | typeof ReactGA = null;

/** Event queue for events sent before the ReactGA module loads. */
let queuedEvents: GA4Event[] = [];

export type { GA4Event };

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
let clientId = "";

/** Whether the app is installed as a PWA. */
const globalIsInstalled =
	typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

/**
 * Checks whether telemetry is disabled via environment configuration or bot detection.
 *
 * @returns `true` when analytics should be suppressed.
 */
const isAnalyticsDisabled = (): boolean =>
	import.meta.env.VITE_ANALYTICS_ENABLED === "false" || isBot();

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
		let fetchSettled = false;
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

			if (!fetchSettled) {
				controller.abort();
			}

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

				fetchSettled = true;
				successes++;

				if (successes + failures === probes.length) finish(failures > 0);
			} catch {
				fetchSettled = true;
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
 */
const getGaClientIdFromCookie = (): null | string => {
	if (typeof document === "undefined") return null;

	const match = document.cookie.match(/(?:^|; )\s*_ga=GA1\.[0-9]+\.([^;]+)/);

	return match ? match[1] : null;
};

/**
 * Resolves and persists the unique session client ID.
 *
 * @remarks
 * Reads the `_ga` cookie if available, falls back to `localStorage`, or generates
 * a new session-scoped `web_<timestamp>_<random>` identifier and attaches early
 * page-hide flush listeners.
 *
 * @returns The initialized client ID.
 *
 * @category Utilities
 */
const initializeAnalyticsClient = (): string => {
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
 * Gets the current client ID, initializing it if necessary.
 *
 * @remarks
 * Lazily invokes {@link initializeAnalyticsClient} when no in-memory client ID
 * has been resolved yet for the current session.
 *
 * @returns The active client ID.
 *
 * @category Utilities
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
 * @param event - Structured GA4 event to relay.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 */
const sendServerEvent = (event: GA4Event): void => {
	try {
		const { action, category, ...params } = event;
		const normalizedParams = normalizeEventParams({
			...params,
			action,
			category,
		});
		const payload: AnalyticsEventPayload = {
			clientId: getClientId(),
			eventName: action,
			params: {
				...normalizedParams,
				app_version: __APP_VERSION__,
				is_installed: globalIsInstalled ? "yes" : "no",
				tracking_source: "server",
			},
		};

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
		if (
			isAnalyticsDisabled()
			|| document.visibilityState !== "hidden"
			|| queuedEvents.length === 0
		) {
			return;
		}

		const eventsToFlush = queuedEvents;
		queuedEvents = [];
		eventsToFlush.forEach(sendServerEvent);
	};

	document.addEventListener("visibilitychange", flushOnHide);
	window.addEventListener("pagehide", flushOnHide);
};

/**
 * Formats and dispatches a Core Web Vitals metric through {@link sendEvent}.
 *
 * @remarks
 * Converts the metric value to numerical event parameters suitable for GA4 custom metrics
 * (`CLS * 1000` or rounded milliseconds, using `metric.value` for `INP` so subsequent
 * lower-percentile updates never emit negative deltas) while preserving `label: metric.id`
 * (`^v\d+-\d+-\d+$`) for BigQuery delta deduplication ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @param metric - The Web Vitals metric to send.
 *
 * @returns Side-effects only.
 */
const sendVitalsMetric = (metric: Metric): void => {
	const rawValue =
		metric.name === "CLS" ? metric.delta * 1000
		: metric.name === "INP" ? (metric.value ?? metric.delta)
		: metric.delta;

	const event: PerformanceMetricGA4Event = {
		action: "performance_metric",
		app_version: __APP_VERSION__,
		category: "performance",
		label: metric.id,
		metric_name: metric.name,
		nonInteraction: true,
		value: Math.round(rawValue),
	};

	if (metric.name === "INP" && "attribution" in metric) {
		const inpMetric = metric as INPMetricWithAttribution;
		const attribution = inpMetric.attribution;

		if (attribution) {
			const target = attribution.interactionTarget || "(unmounted element)";
			event.interaction_target = target;

			if (attribution.interactionType) {
				event.interaction_type = attribution.interactionType;
			}

			if (typeof attribution.inputDelay === "number") {
				event.input_delay = Math.round(attribution.inputDelay);
			}

			if (typeof attribution.processingDuration === "number") {
				event.processing_duration = Math.round(attribution.processingDuration);
			}

			if (typeof attribution.presentationDelay === "number") {
				event.presentation_delay = Math.round(attribution.presentationDelay);
			}

			if (attribution.loadState) {
				event.load_state = attribution.loadState;
			}

			Logger.info(`[Web Vitals INP] ${Math.round(metric.value)}ms (${metric.rating})`, {
				inputDelay: Math.round(attribution.inputDelay),
				loadState: attribution.loadState,
				presentationDelay: Math.round(attribution.presentationDelay),
				processingDuration: Math.round(attribution.processingDuration),
				target,
				type: attribution.interactionType,
			});
		}
	} else if (metric.name === "LCP" && "attribution" in metric) {
		const lcpMetric = metric as LCPMetricWithAttribution;
		const attribution = lcpMetric.attribution;

		if (attribution) {
			const target = attribution.target || attribution.url;

			if (target) {
				event.interaction_target = target;
			}
		}
	} else if (metric.name === "CLS" && "attribution" in metric) {
		const clsMetric = metric as CLSMetricWithAttribution;
		const attribution = clsMetric.attribution;

		if (attribution) {
			if (attribution.largestShiftTarget) {
				event.interaction_target = attribution.largestShiftTarget;
			}

			if (attribution.loadState) {
				event.load_state = attribution.loadState;
			}
		}
	}

	sendEvent(event);
};

/**
 * Lazily imports `web-vitals/attribution` and attaches `PerformanceObserver` listeners.
 *
 * @remarks
 * Triggered at the start of {@link initializeAnalytics} before awaiting the 3-second
 * ad-blocker probe so early `FCP`, `TTFB`, and `LCP` entries are observed immediately
 * and buffered until transport resolution completes.
 *
 * @returns Resolves once all five Core Web Vitals observers are registered.
 */
const registerWebVitals = async (): Promise<void> => {
	const vitalsModule = await import("web-vitals/attribution");

	if (typeof vitalsModule?.onCLS !== "function") {
		return;
	}

	const { onCLS, onFCP, onINP, onLCP, onTTFB } = vitalsModule;
	onCLS(sendVitalsMetric);
	onINP(sendVitalsMetric);
	onFCP(sendVitalsMetric);
	onLCP(sendVitalsMetric);
	onTTFB(sendVitalsMetric);
};

/**
 * Initializes Google Analytics tracking and Core Web Vitals observers.
 *
 * @remarks
 * Resolves the session client ID, registers Core Web Vitals observers concurrently
 * with ad-blocker detection, initializes `react-ga4` when unblocked, and drains
 * any pre-initialization events.
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
export const initializeAnalytics = async (): Promise<void> => {
	if (gaInitialized || isAnalyticsDisabled()) {
		return;
	}

	initializeAnalyticsClient();

	const vitalsPromise = registerWebVitals();
	const isBlocked = await getAdBlockerDetectionResult();

	if (!isBlocked) {
		const ReactGAModule = (await import("react-ga4")) as unknown as
			| undefined
			| {
					default?: typeof ReactGA & {
						default?: typeof ReactGA;
					};
			  };

		// Handle potentially nested default export in certain build environments
		const resolvedGA = ReactGAModule?.default?.default ?? ReactGAModule?.default;

		if (!resolvedGA) {
			return;
		}

		ReactGAInstance = resolvedGA;

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

	await vitalsPromise;
	gaInitialized = true;
};

/**
 * Validates that an event has required properties.
 *
 * @param event - Event to validate.
 *
 * @throws {Error} If action or category is missing.
 *
 * @category Utilities
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
 */
const dispatchEvent = (event: GA4Event, isBlocked: boolean): void => {
	if (isBlocked) {
		sendServerEvent(event);

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
 * reliability. It suppresses telemetry when analytics are disabled or in bot
 * environments, validates the event using {@link validateEvent}, and routes it
 * to either the `react-ga4` client or the `/api/events` server relay.
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
	if (isAnalyticsDisabled()) {
		return;
	}

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
 * onClick={() => sendDeferredEvent({ action: "buy_me_a_coffee_click", category: "ui" })}
 * // returns void
 * ```
 */
export const sendDeferredEvent = (event: GA4Event): void => {
	if (isAnalyticsDisabled()) {
		return;
	}

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
 * Clears cached ad-blocker detection promises, queued events, session client ID,
 * and initialization flags.
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
export const resetAnalyticsForTesting = (): void => {
	gaInitialized = false;
	hideListenersRegistered = false;
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
	clientId = "";
	queuedEvents = [];
	ReactGAInstance = null;
};
