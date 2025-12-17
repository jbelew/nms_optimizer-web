/**
 * Server-side analytics client.
 *
 * Replaces client-side GA4 tracking by sending events to the backend,
 * which forwards them to GA4 via the Measurement Protocol.
 * This provides better privacy, avoids ad blockers, and centralizes tracking logic.
 */

import { API_URL } from "../constants";

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
 * Initialize the analytics client with a unique client ID.
 * Stores the client ID in sessionStorage for persistence across page loads.
 *
 * @returns {string} The client ID
 */
export const initializeAnalyticsClient = (): string => {
	const stored = localStorage.getItem("analytics_client_id");

	if (stored) {
		clientId = stored;
	} else {
		clientId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
		localStorage.setItem("analytics_client_id", clientId);
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
export const sendEvent = async (
	eventName: string,
	params: AnalyticsEventParams = {},
	userId?: string
): Promise<boolean> => {
	try {
		const payload: AnalyticsEventPayload = {
			clientId: getClientId(),
			eventName,
			params,
		};

		if (userId) {
			payload.userId = userId;
		}

		const response = await fetch(`${API_URL}api/events`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			keepalive: true,
		});

		if (!response.ok) {
			console.error(`Analytics event failed: ${response.status}`);

			return false;
		}

		return true;
	} catch (error) {
		console.error("Error sending analytics event:", error);

		return false;
	}
};
