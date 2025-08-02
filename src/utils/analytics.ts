import ReactGA from "react-ga4";

import { TRACKING_ID } from "../constants";
import { reportWebVitals } from "../reportWebVitals";

interface GA4Event {
	category: string;
	action: string;
	label?: string;
	value?: number;
	nonInteraction?: boolean;
	platform?: string;
	tech?: string;
	solve_method?: string;
	page?: string;
	title?: string;
	metric_name?: string;
	build?: string;
	componentStack?: string;
	stackTrace?: string;
}

let gaInitialized = false;

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

export const sendEvent = (event: GA4Event) => {
	const { action, ...params } = event;
	ReactGA.event(action, params);
};
