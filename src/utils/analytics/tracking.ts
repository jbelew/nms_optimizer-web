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

import { API_URL, TRACKING_ID } from "../../constants";
import { isBot, safeGetItem, safeSetItem } from "../browser/environment";

/**
 * Resolved `react-ga4` module instance, accounting for CJS/ESM interop in Rolldown.
 *
 * @category Utilities
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ReactGAInstance: any = null;

/** Event queue for events sent before the ReactGA module loads */
let queuedEvents: GA4Event[] = [];

/**
 * Interface for Google Analytics 4 event tracking.
 *
 * @remarks
 * This interface is designed to support both custom events and GA4 recommended events.
 * It uses `snake_case` for all parameters to align with GA4 best practices.
 *
 * @category Utilities
 */
export interface GA4Event {
	/** Event category (e.g., 'ui', 'performance', 'error'). */
	category: string;
	/** Event action/name (e.g., 'optimize_tech', 'select_content', 'share'). */
	action: string;
	/** Optional event label (legacy/custom). */
	label?: string;
	/** Optional numeric value (legacy/custom). */
	value?: number;
	/** Whether the event is non-interactive. */
	nonInteraction?: boolean;

	// --- GA4 Recommended Parameters ---
	/** The type of content selected (e.g., 'platform', 'language'). */
	content_type?: string;
	/** The identifier of the selected item. */
	item_id?: string;
	/** The method used for the action (e.g., 'nms_file', 'url', 'png'). */
	method?: string;
	/** Screen name for screen_view events. */
	firebase_screen?: string;
	/** Screen class for screen_view events. */
	screen_class?: string;
	/** Virtual currency name for earn_virtual_currency events. */
	virtual_currency_name?: string;

	// --- Custom Dimensions (Mapped in GA4) ---
	/** Platform identifier (e.g., 'starship', 'multitool'). Maps to customEvent:platform. */
	platform?: string;
	/** Tech identifier (e.g., 'pulse', 'hyperdrive'). Maps to customEvent:tech. */
	tech?: string;
	/** Whether the build is supercharged. Maps to customEvent:supercharged. */
	supercharged?: boolean;
	/** Application version. Maps to customEvent:app_version. */
	app_version?: string;
	/** Tracking source (client/server). Maps to customEvent:tracking_source. */
	tracking_source?: string;

	// --- Legacy/Other Parameters ---
	/** Method used for legacy solve tracking. */
	solve_method?: string;
	/** Page identifier. */
	page?: string;
	/** Page title. */
	title?: string;
	/** SEO page title. */
	page_title?: string;
	/** Page location URL. */
	page_location?: string;
	/** Referrer URL. */
	page_referrer?: string;
	/** Metric name for web vitals. */
	metric_name?: string;
	/** Build ID. */
	build?: string;
	/** React component stack trace. */
	componentStack?: string;
	/** Error stack trace. */
	stackTrace?: string;
	/** Name of the build. */
	buildName?: string;
	/** Name of the build (snake_case). */
	build_name?: string;
	/** Filename involved. */
	fileName?: string;
	/** Filename involved (snake_case). */
	file_name?: string;
	/** Ship type category. */
	shipType?: string;
	/** Storage status. */
	storageCleared?: string;
}

/**
 * Key-value pairs for event parameters.
 *
 * @category Utilities
 */
export interface AnalyticsEventParams {
	[key: string]: string | number | boolean | undefined;
}

/**
 * Payload sent to the backend for server-side analytics.
 *
 * @category Utilities
 */
export interface AnalyticsEventPayload {
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
let adBlockerDetectionPromise: Promise<boolean> | null = null;
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
 * Detects if client-side tracking is likely being blocked.
 *
 * @returns {Promise<boolean>} True if blocked.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const blocked = await detectAdBlocker();
 * // returns Promise<boolean>
 * ```
 */
const detectAdBlocker = (): Promise<boolean> => {
	// Script-injection probe is more reliable than `fetch({mode: "no-cors"})`,
	// which resolves opaquely even when ad blockers (e.g. uBlock Origin) return
	// synthetic empty responses — producing false negatives.
	if (typeof document === "undefined" || !document.head) {
		// SSR / non-DOM environment — fall back to fetch probe used historically
		// (and exercised by the existing test suite).
		return (async () => {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 3000);
				await fetch(`https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`, {
					method: "HEAD",
					mode: "no-cors",
					cache: "no-store",
					signal: controller.signal,
				}).finally(() => clearTimeout(timeoutId));

				return false;
			} catch {
				return true;
			}
		})();
	}

	return new Promise<boolean>((resolve) => {
		let settled = false;

		const finish = (blocked: boolean) => {
			if (settled) return;
			settled = true;

			try {
				script.remove();
			} catch {
				/* noop */
			}

			resolve(blocked);
		};

		const script = document.createElement("script");
		script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
		script.async = true;
		script.onload = () => finish(false);
		script.onerror = () => finish(true);
		// Treat lack of response within 3s as blocked (network filter / DNS sink).
		setTimeout(() => finish(true), 3000);

		try {
			document.head.appendChild(script);
		} catch {
			finish(true);
		}
	});
};

/**
 * Gets the result of the ad blocker detection.
 *
 * @returns {Promise<boolean>} True if blocked.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const isBlocked = await getAdBlockerDetectionResult();
 * // returns Promise<boolean>
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
const getGaClientIdFromCookie = (): string | null => {
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
export const getClientId = (): string => {
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
				console.warn("navigator.sendBeacon failed, falling back to fetch:", error);
			}
		}

		payload.params = { ...payload.params, transport: "fetch-keepalive" };
		fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			keepalive: true,
		}).catch((error) => {
			console.error("Analytics event fallback failed:", error);
		});
	} catch (error) {
		console.error("Error preparing analytics event:", error);
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
		const ReactGAModule = await import("react-ga4");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		ReactGAInstance = (ReactGAModule.default as any)?.default ?? ReactGAModule.default;

		ReactGAInstance.initialize(TRACKING_ID, {
			gtagOptions: {
				send_page_view: false,
				anonymize_ip: true,
				allow_ad_personalization_signals: false,
				allow_google_signals: false,
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
					category,
					action,
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
			category,
			action,
			app_version: __APP_VERSION__,
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
		console.error("Event validation failed:", validationError);

		return;
	}

	// Fast synchronous path once detection has resolved. This is critical so
	// late-firing events (e.g. Web Vitals on `visibilitychange`) are dispatched
	// before the browser tears the page down — `await` would lose them.
	if (adBlockerResult !== null) {
		dispatchEvent(event, adBlockerResult);

		return;
	}

	getAdBlockerDetectionResult()
		.then((isBlocked) => dispatchEvent(event, isBlocked))
		.catch((trackingError) => {
			console.error("Failed to send analytics event:", trackingError);
		});
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
