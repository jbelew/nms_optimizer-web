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
	gaInitialized = true;
	reportWebVitals(sendEvent);
};

/**
 * Sends an event to the analytics server.
 *
 * @param {GA4Event} event - The event to send.
 * @returns {void}
 */
const getClientId = () => {
	let clientId = localStorage.getItem("ga_client_id");
	if (!clientId) {
		clientId = crypto.randomUUID();
		localStorage.setItem("ga_client_id", clientId);
	}
	return clientId;
};

export const sendEvent = (event: GA4Event) => {
	const { action, ...params } = event;

	const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL;
	console.log(analyticsUrl);
	if (!analyticsUrl) {
		console.error("VITE_ANALYTICS_URL is not defined");
		return;
	}

	fetch(`${analyticsUrl}api/analytics`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		// Use `keepalive` to ensure the request is sent even if the page is being unloaded.
		// This is crucial for reporting web vitals, which can be sent at the end of a session.
		keepalive: true,
		body: JSON.stringify({
			client_id: getClientId(),
			eventName: action,
			eventParams: params,
		}),
	}).catch((error) => {
		console.error("Error sending analytics event:", error);
	});
};
