import ReactGA from "react-ga4";

import { TRACKING_ID } from "../constants";
import { sendEvent as sendAnalyticsEvent } from "./analyticsClient";
import { isBot } from "./isBot";
import { reportWebVitals } from "./reportWebVitals";

// Defensive wrapper to handle CommonJS/ESM interop issues with Rolldown (Vite 8+).
// When react-ga4 (a CJS package) is bundled by Rolldown in fullBundleMode, it may
// be wrapped with an extra `.default` property layer, making `ReactGA.initialize`
// inaccessible. This resolves the actual module object regardless of wrapping.

/**
 * Resolved `react-ga4` module instance, accounting for CJS/ESM interop in Rolldown.
 *
 * @see {@link https://github.com/MatteoGioioso/react-ga-4} react-ga4
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactGAInstance: typeof ReactGA = (ReactGA as any)?.default ?? ReactGA;

/**
 * Interface for Google Analytics 4 event tracking.
 *
 * Defines the structure for events sent to both client-side (`ReactGA`)
 * and server-side fallback tracking.
 *
 * @category Utilities
 * @see {@link sendEvent}
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

/** Tracks whether `ReactGA.initialize` has already been called this session. */
let gaInitialized = false;

/**
 * Detects if client-side tracking is likely being blocked.
 *
 * Checks both Google Tag Manager and Google Analytics collection endpoints.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if tracking is likely blocked.
 *
 * @example
 * const blocked = await detectAdBlocker();
 * if (blocked) console.log("Ad blocker detected");
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

/** Cached promise for in-flight ad blocker detection, preventing duplicate network requests. */
let adBlockerDetectionPromise: Promise<boolean> | null = null;
/** Cached boolean result of the ad blocker detection once resolved. */
let adBlockerResult: boolean | null = null;

/**
 * Gets the result of the ad blocker detection.
 *
 * If detection is already in progress or completed, returns the existing promise or result.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if an ad blocker is detected.
 *
 * @example
 * const isBlocked = await getAdBlockerDetectionResult();
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
 */
export const env = {
	/**
	 * Helper function to check if running in development mode.
	 *
	 * @returns {boolean} `true` if in development mode.
	 *
	 * @example
	 * if (env.isDevMode()) { console.log("Debug mode active"); }
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
 * @internal For testing purposes only.
 *
 * @example
 * resetAnalyticsForTesting();
 */
export const resetAnalyticsForTesting = () => {
	gaInitialized = false;
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
};

// Store globally so sendEvent can access these values for server-side fallback
/** Whether the app is currently running as an installed PWA (standalone display mode). */
const globalIsInstalled =
	typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

/**
 * Initializes Google Analytics tracking.
 *
 * Skips initialization in development mode, for bots, or if already initialized.
 * Falls back to server-side tracking if an ad blocker is detected.
 *
 * @returns {Promise<void>} Resolves when initialization is complete or skipped.
 * @category Utilities
 * @see {@link ReactGAInstance}
 * @see {@link getAdBlockerDetectionResult}
 * @see {@link isBot}
 *
 * @example
 * await initializeAnalytics();
 */
export const initializeAnalytics = async () => {
	// Skip analytics in dev mode, if already initialized, or for bots
	if (env.isDevMode() || gaInitialized || isBot()) {
		return;
	}

	const isBlocked = await getAdBlockerDetectionResult();

	if (isBlocked) {
		// Even if blocked, we mark as initialized so we don't try again
		gaInitialized = true;

		return;
	}

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

	gaInitialized = true;
	reportWebVitals(sendEvent);

	// Also initialize Cloudflare RUM if not blocked, when idle
	if (typeof window !== "undefined" && "requestIdleCallback" in window) {
		window.requestIdleCallback(() => initializeCloudflareRUM());
	} else {
		setTimeout(() => initializeCloudflareRUM(), 3000);
	}
};

/**
 * Initializes Cloudflare Web Analytics (RUM) conditionally.
 *
 * Wraps script loading with error suppression to catch SecurityErrors
 * from cross-origin iframe access attempts.
 *
 * @returns {void} Side-effects only.
 * @category Utilities
 * @see {@link getAdBlockerDetectionResult}
 *
 * @example
 * initializeCloudflareRUM();
 */
export const initializeCloudflareRUM = () => {
	// Skip if already loaded or in dev mode
	if (env.isDevMode() || document.querySelector('script[src*="cloudflareinsights.com"]')) {
		return;
	}

	getAdBlockerDetectionResult()
		.then((isBlocked) => {
			if (isBlocked) return;

			try {
				const script = document.createElement("script");
				script.src = "https://static.cloudflareinsights.com/beacon.min.js";
				script.defer = true;
				script.setAttribute(
					"data-cf-beacon",
					'{"token": "614f4aacf3d1446bae6719e156ecc36e"}'
				);

				// Wrap script loading with error suppression for cross-origin iframe access
				const errorHandler = (event: Event) => {
					if (event instanceof ErrorEvent && event.error?.name === "SecurityError") {
						// Suppress SecurityError from Cloudflare beacon accessing cross-origin iframes
						event.preventDefault();
					}
				};

				document.addEventListener("error", errorHandler, true);

				// Create a timeout to remove the error handler after a reasonable time
				const timeout = setTimeout(() => {
					document.removeEventListener("error", errorHandler, true);
				}, 5000);

				script.onload = () => {
					clearTimeout(timeout);
					document.removeEventListener("error", errorHandler, true);
				};

				script.onerror = () => {
					clearTimeout(timeout);
					document.removeEventListener("error", errorHandler, true);
				};

				document.body.appendChild(script);
			} catch (error) {
				// Suppress any errors during script initialization
				if (env.isDevMode()) {
					console.error("Failed to initialize Cloudflare RUM:", error);
				}
			}
		})
		.catch((error) => {
			if (env.isDevMode()) {
				console.error(
					"Failed to detect ad blocker during Cloudflare RUM initialization:",
					error
				);
			}
		});
};

// Detect ad-blocker is now handled lazily within sendEvent -> getAdBlockerDetectionResult
// This prevents an immediate network request when the module loads.

/**
 * Validates that an event has required properties.
 *
 * @param {GA4Event} event - The event to validate.
 * @throws {Error} Throws if `action` or `category` are missing.
 *
 * @example
 * validateEvent({ action: "click", category: "ui" });
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
 * Falls back to server-side tracking if client-side is blocked by an ad-blocker.
 * Validates the `event` structure before dispatching.
 *
 * @param {GA4Event} event - The event to send.
 * @returns {void} Side-effects only.
 * @category Utilities
 * @see {@link GA4Event}
 * @see {@link getAdBlockerDetectionResult}
 * @see {@link sendAnalyticsEvent}
 *
 * @example
 * sendEvent({
 *   category: "ui",
 *   action: "click",
 *   label: "submit_button"
 * });
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
