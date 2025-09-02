import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { sendEvent } from "../../utils/analytics";

/**
 * Custom hook to track page views using Google Analytics 4.
 * It sends a 'page_view' event whenever the route changes.
 */
export const usePageViewTracker = () => {
	const location = useLocation();

	useEffect(() => {
		// Send a page_view event whenever the location changes
		sendEvent({
			category: "Page View",
			action: "page_view",
			page: location.pathname + location.search,
			title: document.title,
		});
	}, [location]);
};
