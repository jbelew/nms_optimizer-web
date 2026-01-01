import ReactGA from "react-ga4";

import { TRACKING_ID } from "../constants";
import { sendEvent as sendAnalyticsEvent } from "./analyticsClient";
import { reportWebVitals } from "./reportWebVitals";

/**
 * Interface for Google Analytics 4 event tracking.
 * ... (rest of the interface properties)
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
	try {
		const url = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
		await fetch(url, {
			method: "HEAD",
			mode: "no-cors",
			cache: "no-store",
		});

		if (isDevMode()) {
			console.log("No Ad blocker detected. Using client-side analytics.");
		}

		return false;
	} catch (_error) {
		if (isDevMode()) {
			console.log("Ad blocker detected. Using server-side analytics fallback.");
		}

		return true;
	}
};

let adBlockerDetectionPromise: Promise<boolean> | null = null;
let adBlockerResult: boolean | null = null;

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
 * Helper function to check if running in development mode.
 * Exported for testing purposes.
 *
 * @returns {boolean} True if in development mode
 */
export const isDevMode = (): boolean => {
	// Use typeof check to handle both string and boolean values from import.meta.env
	const devEnv = import.meta.env.DEV;

	if (typeof devEnv === "string") {
		return devEnv === "true";
	}

	return devEnv;
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

/**
 * Initializes Google Analytics tracking.
 * Skips initialization in development mode to prevent polluting analytics data.
 *
 * @returns {void}
 */
// Store globally so sendEvent can access these values for server-side fallback
const globalIsInstalled =
	typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

export const initializeAnalytics = () => {
	// Skip analytics in dev mode, if already initialized, or for bots
	if (isDevMode() || gaInitialized || /bot|googlebot|crawler|spider/i.test(navigator.userAgent)) {
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

	// Manually send initial page_view to include tracking_source
	sendEvent({
		action: "page_view",
		category: "engagement", // Common category for page views
		label: document.title,
		page: window.location.pathname + window.location.search,
	});

	gaInitialized = true;
	reportWebVitals(sendEvent);
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
