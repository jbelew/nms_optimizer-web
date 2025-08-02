import ReactGA from "react-ga4";

import { TRACKING_ID } from "../constants";
import { reportWebVitals } from "../reportWebVitals";

interface GA4Event {
	name: string;
	params: {
		[key: string]: string | number | boolean | undefined;
	};
}

let gaInitialized = false;

export const initializeAnalytics = () => {
	if (gaInitialized) return;
	ReactGA.initialize(TRACKING_ID, {
		gtagOptions: {
			send_page_view: true,
		},
	});
	gaInitialized = true;
	reportWebVitals(sendEvent);
};

export const sendEvent = ({ name, params }: GA4Event) => {
	ReactGA.event(name, params);
};
