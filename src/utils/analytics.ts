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
 * @see {@link ./analytics.test.ts Unit Tests}
 *
 * @category Utilities
 */

import { TRACKING_ID } from "../constants";
import { sendEvent as sendAnalyticsEvent } from "./analyticsClient";
import { isBot } from "./isBot";

/**
 * Resolved `react-ga4` module instance, accounting for CJS/ESM interop in Rolldown.
 *
 * @remarks
 * This constant ensures that the `react-ga4` module is correctly accessed even
 * when bundled in environments that might wrap CJS exports in a `.default` property.
 *
 * @see {@link https://github.com/MatteoGioioso/react-ga-4} react-ga4
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
 * Defines the structure for events sent to both client-side (`ReactGA`)
 * and server-side fallback tracking. Includes standard GA4 fields and
 * application-specific custom dimensions.
 *
 * @see {@link sendEvent}
 *
 * @category Utilities
 */
export interface GA4Event {
	/** The category of the event (e.g., `'ui'`, `'error'`, `'api'`). */
	category: string;
	/** The action that occurred (e.g., `'click'`, `'submit'`, `'load'`). */
	action: string;
	/** Optional label for the event. */
	label?: string;
	/** Optional numerical value associated with the event. */
	value?: number;
	/** Whether the event is non-interactive (e.g., background metric). */
	nonInteraction?: boolean;
	/** The platform where the event occurred. */
	platform?: string;
	/** Technology type associated with the event. */
	tech?: string;
	/** The method used to solve an optimization problem. */
	solve_method?: string;
	/** Whether the build is supercharged. */
	supercharged?: boolean;
	/** The page where the event occurred. */
	page?: string;
	/** The title of the page. */
	title?: string;
	/** The SEO-friendly title of the page. */
	page_title?: string;
	/** The full URL of the page. */
	page_location?: string;
	/** The referrer URL. */
	page_referrer?: string;
	/** The name of a specific metric being tracked. */
	metric_name?: string;
	/** Build identifier. */
	build?: string;
	/** React component stack trace for errors. */
	componentStack?: string;
	/** JavaScript stack trace for errors. */
	stackTrace?: string;
	/** The application version. */
	app_version?: string;
	/** The name given to a build. */
	buildName?: string;
	/** The filename associated with the event. */
	fileName?: string;
	/** The type of ship in the optimization. */
	shipType?: string;
	/** Status of storage clearing operation. */
	storageCleared?: string;
	/** Source of the tracking (`'client'` or `'server'`). */
	tracking_source?: string;
}

/**
 * Tracks whether `ReactGA.initialize` has already been called this session.
 *
 * @remarks
 * Prevents duplicate initialization of the GA4 client.
 *
 * @category Utilities
 */
let gaInitialized = false;

/**
 * Detects if client-side tracking is likely being blocked.
 *
 * @remarks
 * Checks both Google Tag Manager and Google Analytics collection endpoints.
 * Some blockers allow GTM but block the collection endpoint.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if tracking is likely blocked.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const blocked = await detectAdBlocker();
 * if (blocked) console.log("Ad blocker detected");
 * // returns true if blocked
 * ```
 */
const detectAdBlocker = async (): Promise<boolean> => {
	// Check both GTM (script loading) and GA (collection) domains
	// Some blockers allow GTM but block the collection endpoint
	const urls = [
		`https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`,
		"https://www.google-analytics.com/g/collect",
	];

	try {
		// Try to fetch all with a timeout. If ANY fail, tracking is likely blocked.
		await Promise.all(
			urls.map((url) => {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 3000);

				return fetch(url, {
					method: "HEAD",
					mode: "no-cors",
					cache: "no-store",
					signal: controller.signal,
				}).finally(() => clearTimeout(timeoutId));
			})
		);

		if (env.isDevMode()) {
			console.log("No Ad blocker detected. Using client-side analytics.");
		}

		return false;
	} catch (_error) {
		if (env.isDevMode()) {
			console.log(
				"Ad blocker detected or network error. Using server-side analytics fallback."
			);
		}

		return true;
	}
};

/**
 * Cached promise for in-flight ad blocker detection.
 *
 * @remarks
 * Prevents duplicate network requests when multiple components check status simultaneously.
 *
 * @category Utilities
 */
let adBlockerDetectionPromise: Promise<boolean> | null = null;

/**
 * Cached boolean result of the ad blocker detection once resolved.
 *
 * @category Utilities
 */
let adBlockerResult: boolean | null = null;

/**
 * Gets the result of the ad blocker detection.
 *
 * @remarks
 * If detection is already in progress or completed, returns the existing promise or result.
 * This is the preferred way to check for ad blockers within the application.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if an ad blocker is detected.
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
 * Environment check utilities.
 *
 * @remarks
 * Provides helper functions for detecting the current execution environment.
 *
 * @category Utilities
 */
export const env = {
	/**
	 * Helper function to check if running in development mode.
	 *
	 * @returns {boolean} `true` if in development mode.
	 *
	 * @example
	 * ```ts
	 * if (env.isDevMode()) { console.log("Debug mode active"); }
	 * ```
	 */
	isDevMode: (): boolean => {
		// Use typeof check to handle both string and boolean values from import.meta.env
		const devEnv = import.meta.env.DEV;

		if (typeof devEnv === "string") {
			return devEnv === "true";
		}

		return devEnv;
	},
};

/**
 * Reset analytics initialization state for testing.
 *
 * @remarks
 * This function clears the initialization flags and cached ad blocker results,
 * allowing for a clean slate between test runs.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * resetAnalyticsForTesting();
 * ```
 *
 * @internal For testing purposes only.
 */
export const resetAnalyticsForTesting = () => {
	gaInitialized = false;
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
};

// Store globally so sendEvent can access these values for server-side fallback
/**
 * Whether the app is currently running as an installed PWA (standalone display mode).
 *
 * @remarks
 * Used to track user engagement from installed vs. browser-based usage.
 *
 * @category Utilities
 */
const globalIsInstalled =
	typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

/**
 * Initializes Google Analytics tracking.
 *
 * @remarks
 * Skips initialization in development mode, for bots, or if already initialized.
 * Falls back to server-side tracking if an ad blocker is detected.
 * Automatically starts tracking Web Vitals once initialized.
 *
 * @returns {Promise<void>} Resolves when initialization is complete or skipped.
 *
 * @see {@link ReactGAInstance}
 * @see {@link getAdBlockerDetectionResult}
 * @see {@link isBot}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await initializeAnalytics();
 * ```
 */
export const initializeAnalytics = async () => {
	// Skip analytics in dev mode, if already initialized, or for bots
	if (env.isDevMode() || gaInitialized || isBot()) {
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
				user_properties: {
					app_version: __APP_VERSION__,
					is_installed: globalIsInstalled ? "yes" : "no",
				},
			},
		});

		// Flush queued events
		if (queuedEvents.length > 0) {
			const eventsToFlush = [...queuedEvents];
			queuedEvents = [];
			eventsToFlush.forEach(sendEvent);
		}
	}

	gaInitialized = true;

	const { reportWebVitals } = await import("./reportWebVitals");
	reportWebVitals(sendEvent);
};

// Detect ad-blocker is now handled lazily within sendEvent -> getAdBlockerDetectionResult
// This prevents an immediate network request when the module loads.

/**
 * Validates that an event has required properties.
 *
 * @remarks
 * Ensures that all events sent to GA4 have at least an `action` and a `category`.
 *
 * @param {GA4Event} event - The event to validate.
 *
 * @throws {Error} Throws if `action` or `category` are missing.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * validateEvent({ action: "click", category: "ui" });
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
 * @remarks
 * Falls back to server-side tracking if client-side is blocked by an ad-blocker.
 * Validates the `event` structure before dispatching. Events are dispatched
 * asynchronously ("fire and forget").
 *
 * @param {GA4Event} event - The event to send.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link GA4Event}
 * @see {@link getAdBlockerDetectionResult}
 * @see {@link sendAnalyticsEvent}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendEvent({
 *   category: "ui",
 *   action: "click",
 *   label: "submit_button"
 * });
 * // returns void
 * ```
 */
export const sendEvent = (event: GA4Event): void => {
	try {
		validateEvent(event);
	} catch (validationError) {
		console.error("Event validation failed:", validationError);

		// throw validationError; // Don't throw, just log and return to avoid crashing
		return;
	}

	// Fire and forget - do not await detection or sending
	getAdBlockerDetectionResult()
		.then((isBlocked) => {
			if (isBlocked) {
				const { action, category, ...params } = event;
				sendAnalyticsEvent(action, {
					...params,
					category,
					action,
					app_version: __APP_VERSION__,
					is_installed: globalIsInstalled ? "yes" : "no",
					tracking_source: "server",
				});
			} else {
				if (!ReactGAInstance) {
					queuedEvents.push(event);

					return;
				}

				const { action, category, ...params } = event;
				ReactGAInstance.event(action, {
					...params,
					category,
					tracking_source: "client",
				});
			}
		})
		.catch((trackingError) => {
			console.error("Failed to send analytics event:", trackingError);
		});
};
