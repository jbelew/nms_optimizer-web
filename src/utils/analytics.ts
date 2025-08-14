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
}

let gaInitialized = false;

/**
 * Initializes Google Analytics tracking.
 *
 * @returns {void}
 */
export const initializeAnalytics = () => {
	if (gaInitialized) return;
	ReactGA.initialize(TRACKING_ID, {
		gtagOptions: {
			send_page_view: true,
		},
	});
	ReactGA.set({ app_version: __APP_VERSION__ });
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
	const { action, ...params } = event;
	ReactGA.event(action, params);
};
