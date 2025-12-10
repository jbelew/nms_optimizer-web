import ReactGA from "react-ga4";

import { TRACKING_ID } from "../constants";
import { reportWebVitals } from "./reportWebVitals";

/**
 * Interface for Google Analytics 4 event tracking.
 *
 * @interface GA4Event
 * @property {string} category - The category of the event.
 * @property {string} action - The action that occurred.
 * @property {string} [label] - An optional label for the event.
 * @property {number} [value] - An optional numerical value for the event.
 * @property {boolean} [nonInteraction] - If true, the event will not affect bounce rate.
 * @property {string} [platform] - The platform where the event occurred.
 * @property {string} [tech] - The technology associated with the event.
 * @property {string} [solve_method] - The method used to solve a problem.
 * @property {boolean} [supercharged] - Whether a feature is supercharged.
 * @property {string} [page] - The page where the event occurred.
 * @property {string} [title] - The title of the page or event.
 * @property {string} [metric_name] - The name of the metric being measured.
 * @property {string} [build] - The build version of the application.
 * @property {string} [componentStack] - The component stack trace for errors.
 * @property {string} [stackTrace] - The stack trace for errors.
 * @property {string} [app_version] - The version of the application.
 * @property {string} [storageCleared] - Whether localStorage was successfully cleared ("yes" or "no").
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
	source?: string;
}

let gaInitialized = false;

/**
 * Helper function to check if running in development mode.
 * Exported for testing purposes.
 *
 * @returns {boolean} True if in development mode
 */
export const isDevMode = (): boolean => import.meta.env.DEV;

/**
 * Reset analytics initialization state for testing.
 * @internal For testing purposes only.
 */
export const resetAnalyticsForTesting = () => {
	gaInitialized = false;
};

/**
 * Initializes Google Analytics tracking.
 * Skips initialization in development mode to prevent polluting analytics data,
 * unless dual tracking is enabled for testing.
 *
 * @returns {void}
 */
export const initializeAnalytics = () => {
	// Skip analytics in dev mode, if already initialized, or for bots
	// Exception: allow in dev when VITE_DUAL_ANALYTICS is enabled for testing
	const dualTracking = import.meta.env.VITE_DUAL_ANALYTICS === "true";

	if (
		(isDevMode() && !dualTracking) ||
		gaInitialized ||
		/bot|googlebot|crawler|spider/i.test(navigator.userAgent)
	) {
		return;
	}

	ReactGA.initialize(TRACKING_ID, {
		gtagOptions: {
			send_page_view: true,
			anonymize_ip: true,
			user_properties: {
				app_version: __APP_VERSION__,
			},
		},
	});
	gaInitialized = true;
	reportWebVitals(sendEvent);
};

/**
 * Sends an event to Google Analytics.
 *
 * @param {GA4Event} event - The event to send.
 * @returns {void}
 */
export const sendEvent = (event: GA4Event) => {
	const { action, category, ...params } = event;
	ReactGA.event(action, { ...params, category });
};
