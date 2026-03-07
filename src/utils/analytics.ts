import ReactGA from "react-ga4";

import { TRACKING_ID } from "../constants";
import { sendEvent as sendAnalyticsEvent } from "./analyticsClient";
import { isBot } from "./isBot";
import { reportWebVitals } from "./reportWebVitals";

/**
 * Interface for Google Analytics 4 event tracking.
 * @typedef {object} GA4Event
 * @property {string} category - The category of the event (e.g., 'ui', 'error', 'api').
 * @property {string} action - The action that occurred (e.g., 'click', 'submit', 'load').
 * @property {string} [label] - Optional label for the event.
 * @property {number} [value] - Optional numerical value associated with the event.
 * @property {boolean} [nonInteraction] - Whether the event is non-interactive.
 * @property {string} [platform] - The platform where the event occurred.
 * @property {string} [tech] - Technology type associated with the event.
 * @property {string} [solve_method] - The method used to solve an optimization problem.
 * @property {boolean} [supercharged] - Whether the build is supercharged.
 * @property {string} [page] - The page where the event occurred.
 * @property {string} [title] - The title of the page.
 * @property {string} [page_title] - The SEO-friendly title of the page.
 * @property {string} [page_location] - The full URL of the page.
 * @property {string} [page_referrer] - The referrer URL.
 * @property {string} [metric_name] - The name of a specific metric being tracked.
 * @property {string} [build] - Build identifier.
 * @property {string} [componentStack] - React component stack trace for errors.
 * @property {string} [stackTrace] - JavaScript stack trace for errors.
 * @property {string} [app_version] - The application version.
 * @property {string} [buildName] - The name given to a build.
 * @property {string} [fileName] - The filename associated with the event.
 * @property {string} [shipType] - The type of ship in the optimization.
 * @property {string} [storageCleared] - Status of storage clearing operation.
 * @property {string} [tracking_source] - Source of the tracking ('client' or 'server').
 */
export interface GA4Event {
	category: string;
	action: string;
	label?: string;
	value?: number;
	nonInteraction?: boolean;
	platform?: string;
	tech?: string;
	solve_method?: string;
	supercharged?: boolean;
	page?: string;
	title?: string;
	page_title?: string;
	page_location?: string;
	page_referrer?: string;
	metric_name?: string;
	build?: string;
	componentStack?: string;
	stackTrace?: string;
	app_version?: string;
	buildName?: string;
	fileName?: string;
	shipType?: string;
	storageCleared?: string;
	tracking_source?: string;
}

let gaInitialized = false;

/**
 * Detects if client-side tracking is likely being blocked.
 * This is a simplified check. For a more robust solution, consider a library.
 * @returns {Promise<boolean>} True if tracking is likely blocked.
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

let adBlockerDetectionPromise: Promise<boolean> | null = null;
let adBlockerResult: boolean | null = null;

/**
 * Gets the result of the ad blocker detection.
 * If detection is already in progress or completed, returns the existing promise or result.
 * @returns {Promise<boolean>} A promise that resolves to true if an ad blocker is detected.
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
 * Environment check utilities
 */
export const env = {
	/**
	 * Helper function to check if running in development mode.
	 *
	 * @returns {boolean} True if in development mode
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
 * @internal For testing purposes only.
 */
export const resetAnalyticsForTesting = () => {
	gaInitialized = false;
	adBlockerDetectionPromise = null;
	adBlockerResult = null;
};

// Store globally so sendEvent can access these values for server-side fallback
const globalIsInstalled =
	typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

/**
 * Initializes Google Analytics tracking.
 * Skips initialization in development mode to prevent polluting analytics data.
 * Also checks for ad blockers and falls back to server-side tracking if necessary.
 *
 * @returns {Promise<void>}
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

	ReactGA.initialize(TRACKING_ID, {
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
 * Wraps script loading with error suppression to catch SecurityErrors from cross-origin iframe access attempts.
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
 * @param {GA4Event} event - The event to validate.
 * @throws {Error} If required properties are missing.
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
 * Uses cached ad-blocker detection result, or waits for detection on first call.
 * Falls back to server-side tracking if client-side is blocked.
 *
 * @param {GA4Event} event - The event to send.
 * @returns {Promise<void>}
 * @throws {Error} If event validation fails.
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
				ReactGA.event(action, {
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

// Start detection immediately on module load instead of waiting for the first event or initialization
// This ensures we have the result ready (or in flight) by the time initializeAnalytics is called.
if (typeof window !== "undefined") {
	getAdBlockerDetectionResult().catch((error) => {
		if (env.isDevMode()) {
			console.error("Failed to detect ad blocker on module load:", error);
		}
	});
}
