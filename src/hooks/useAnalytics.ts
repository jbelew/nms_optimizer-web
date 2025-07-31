import { useEffect, useRef } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";

import { TRACKING_ID } from "../constants";
import { reportWebVitals } from "../reportWebVitals";

interface GA4Event {
	category: string;
	action: string;
	label?: string;
	value?: number;
	nonInteraction?: boolean;
	// Custom parameters used in the application
	platform?: string;
	tech?: string;
	solve_method?: string;
	page?: string;
	title?: string;
	metric_name?: string;
	// Add any other custom parameters as needed
}

/**
 * Custom hook for handling Google Analytics initialization and pageview tracking.
 */
export const useAnalytics = () => {
	const location = useLocation();
	const gaInitialized = useRef(false);
	const initialPageViewSentRef = useRef(false);

	const sendEvent = (event: GA4Event) => {
		ReactGA.event(event);
	};

	/**
	 * Initializes Google Analytics and sets up web vitals reporting.
	 * This effect runs only once when the component mounts.
	 */
	useEffect(() => {
		if (gaInitialized.current) return;
		ReactGA.initialize(TRACKING_ID, {
			testMode: import.meta.env.DEV,
		});
		gaInitialized.current = true;
		reportWebVitals(sendEvent);
	}, []);

	/**
	 * Sends pageview events to Google Analytics on navigation.
	 */
	useEffect(() => {
		if (initialPageViewSentRef.current) {
			sendEvent({
				category: "Page View",
				action: "page_view",
				page: location.pathname + location.search,
				title: document.title, // Use current document title
			});
		} else {
			initialPageViewSentRef.current = true;
		}
	}, [location.pathname, location.search]);

	return { sendEvent };
};
