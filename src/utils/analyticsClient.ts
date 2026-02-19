/**
 * Server-side analytics client.
 *
 * Replaces client-side GA4 tracking by sending events to the backend,
 * which forwards them to GA4 via the Measurement Protocol.
 * This provides better privacy, avoids ad blockers, and centralizes tracking logic.
 */

import { API_URL } from "../constants";
import { safeGetItem, safeSetItem } from "./storage";

export interface AnalyticsEventParams {
	[key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEventPayload {
	clientId: string;
	eventName: string;
	params?: AnalyticsEventParams;
	userId?: string;
}

let clientId: string;

/**
 * Attempts to retrieve the Client ID from the Google Analytics cookie (_ga).
 * This ensures consistency between client-side (ReactGA) and server-side fallback tracking.
 *
 * Cookie format: GA1.1.<clientId>.<timestamp> or GA1.2.<clientId>.<timestamp>
 * We need to extract: <clientId>.<timestamp>
 *
 * @returns {string | null} The extracted Client ID or null if not found.
 */
const getGaClientIdFromCookie = (): string | null => {
	if (typeof document === "undefined") return null;

	const match = document.cookie.match(/(?:^|; )\s*_ga=GA1\.[0-9]+\.([^;]+)/);

	return match ? match[1] : null;
};

/**
 * Initialize the analytics client with a unique client ID.
 * Stores the client ID in sessionStorage for persistence across page loads.
 *
 * @returns {string} The client ID
 */
export const initializeAnalyticsClient = (): string => {
	// 1. Try to get ID from GA cookie (source of truth)
	const gaId = getGaClientIdFromCookie();
	const stored = safeGetItem("analytics_client_id");

	if (gaId) {
		// If we have a GA cookie, use it and sync local storage
		clientId = gaId;

		if (stored !== gaId) {
			safeSetItem("analytics_client_id", gaId);
		}
	} else if (stored) {
		clientId = stored;
	} else {
		clientId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
		safeSetItem("analytics_client_id", clientId);
	}

	return clientId;
};

/**
 * Get the current client ID.
 * Initializes if not already done.
 *
 * @returns {string} The client ID
 */
export const getClientId = (): string => {
	if (!clientId) {
		initializeAnalyticsClient();
	}

	return clientId;
};

/**
 * Send an analytics event to the backend.
 * Events are relayed to GA4 via the Measurement Protocol.
 *
 * @param {string} eventName - The event name (e.g., "optimization_complete")
 * @param {AnalyticsEventParams} [params={}] - Event parameters
 * @param {string} [userId] - Optional user ID
 * @returns {Promise<boolean>} True if sent successfully
 *
 * @example
 * await sendEvent("optimization_complete", {
 *   category: "optimization",
 *   action: "complete",
 *   solve_method: "pattern_matching",
 *   max_bonus: 45,
 * });
 */
export const sendEvent = (
	eventName: string,
	params: AnalyticsEventParams = {},
	userId?: string
): void => {
	try {
		const payload: AnalyticsEventPayload = {
			clientId: getClientId(),
			eventName,
			params,
		};

		if (userId) {
			payload.userId = userId;
		}

		const blob = new Blob([JSON.stringify(payload)], {
			type: "application/json",
		});

		// Use navigator.sendBeacon if available (non-blocking, reliable on unload)
		if (navigator.sendBeacon) {
			const success = navigator.sendBeacon(`${API_URL}api/events`, blob);
			if (success) return;
		}

		// Fallback to fetch with keepalive if sendBeacon fails or isn't available
		// Fire and forget - do not await
		fetch(`${API_URL}api/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			keepalive: true,
		}).catch((error) => {
			console.error("Analytics event fallback failed:", error);
		});
	} catch (error) {
		console.error("Error preparing analytics event:", error);
	}
};
