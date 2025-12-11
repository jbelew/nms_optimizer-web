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
		await fetch("https://www.googletagmanager.com/gtag/js?id=G-P5VBZQ69Q9", {
			method: "HEAD",
			mode: "no-cors",
			cache: "reload",
		});
		console.log("No Ad blocker detected. Using client-side analytics.");

		return false;
	} catch (_error) {
		console.log("Ad blocker detected. Using server-side analytics fallback.");

		return true;
	}
};

let adBlockerDetectionPromise: Promise<boolean> | null = null;

const getAdBlockerDetectionPromise = (): Promise<boolean> => {
	if (!adBlockerDetectionPromise) {
		adBlockerDetectionPromise = detectAdBlocker();
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
};

/**
 * Initializes Google Analytics tracking.
 * Skips initialization in development mode to prevent polluting analytics data.
 *
 * @returns {void}
 */
export const initializeAnalytics = () => {
	// Skip analytics in dev mode, if already initialized, or for bots
	if (isDevMode() || gaInitialized || /bot|googlebot|crawler|spider/i.test(navigator.userAgent)) {
		return;
	}

	const isInstalled = window.matchMedia("(display-mode: standalone)").matches;

	ReactGA.initialize(TRACKING_ID, {
		gtagOptions: {
			send_page_view: true,
			anonymize_ip: true,
			user_properties: {
				app_version: __APP_VERSION__,
				is_installed: isInstalled ? "yes" : "no",
			},
		},
	});
	gaInitialized = true;
	reportWebVitals(sendEvent);
};

// Manually send a page_view event if ad-blocker is detected
getAdBlockerDetectionPromise().then((isBlocked) => {
	if (isBlocked) {
		sendEvent({
			action: "page_view",
			category: "engagement",
			label: document.title,
			page: window.location.pathname + window.location.search,
		});
	}
});

/**
 * Sends an event to Google Analytics, automatically choosing the transport method.
 *
 * @param {GA4Event} event - The event to send.
 * @returns {Promise<void>}
 */
export const sendEvent = async (event: GA4Event): Promise<void> => {
	const isBlocked = await getAdBlockerDetectionPromise();

	if (isBlocked) {
		const { action, category, ...params } = event;
		await sendAnalyticsEvent(action, {
			...params,
			category,
			action,
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
};
