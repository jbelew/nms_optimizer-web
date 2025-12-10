import type { GA4Event } from "../../utils/analytics";

import { sendEvent as sendClientSideEvent } from "../../utils/analytics";
import { sendEvent as sendAnalyticsEvent } from "../../utils/analyticsClient";

// Use server-side analytics if VITE_USE_SERVER_ANALYTICS is true, otherwise use client-side
const USE_SERVER_ANALYTICS = import.meta.env.VITE_USE_SERVER_ANALYTICS === "true";

// Dual-tracking mode: send to both client-side and server-side to detect ad blockers
const DUAL_TRACKING = import.meta.env.VITE_DUAL_ANALYTICS === "true";

/**
 * Custom hook for handling Google Analytics event tracking.
 *
 * This hook provides a convenient way to send GA4 events from any component.
 * Can use either client-side (ReactGA) or server-side (backend relay) tracking
 * based on the VITE_USE_SERVER_ANALYTICS environment variable.
 *
 * When VITE_DUAL_ANALYTICS is enabled, sends to both implementations simultaneously
 * to measure ad blocker adoption (server events that don't reach client-side indicate blockers).
 *
 * @returns {{sendEvent: (event: GA4Event) => Promise<boolean> | void}} - Object containing the sendEvent function.
 * @example
 * const { sendEvent } = useAnalytics();
 * await sendEvent({ category: 'ui', action: 'button_clicked', label: 'submit' });
 */
export const useAnalytics = () => {
	const sendEvent = async (event: GA4Event): Promise<boolean> => {
		const { action, category, ...params } = event;

		if (DUAL_TRACKING) {
			// Send to both implementations with source tagging
			const serverPromise = sendAnalyticsEvent(action, {
				...params,
				category,
				action,
				source: "server",
			});

			// Client-side (may be blocked by ad blockers)
			sendClientSideEvent({
				...event,
				source: "client",
			});

			return serverPromise;
		} else if (USE_SERVER_ANALYTICS) {
			// Server-side analytics: convert GA4Event to analytics client format
			return sendAnalyticsEvent(action, {
				...params,
				category,
				action,
			});
		} else {
			// Client-side analytics: use ReactGA directly
			sendClientSideEvent(event);

			return true;
		}
	};

	return { sendEvent };
};
