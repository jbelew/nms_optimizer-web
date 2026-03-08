/**
 * Server-side analytics client.
 *
 * Replaces client-side GA4 tracking by sending events to the backend,
 * which forwards them to GA4 via the Measurement Protocol.
 * This provides better privacy, avoids ad blockers, and centralizes tracking logic.
 */

import { API_URL } from "../constants";
import { safeGetItem, safeSetItem } from "./storage";

/**
 * Key-value pairs for event parameters.
 *
 * Each key is a string representing the parameter name, and the value can be
 * a string, number, boolean, or undefined.
 */
export interface AnalyticsEventParams {
	[key: string]: string | number | boolean | undefined;
}

/**
 * Payload sent to the backend for server-side analytics.
 *
 * Contains all necessary metadata to track an event on the server side
 * using GA4 Measurement Protocol.
 */
export interface AnalyticsEventPayload {
	/** Unique identifier for the client session. */
	clientId: string;
	/** The name of the event to track. */
	eventName: string;
	/** Optional event-specific parameters. */
	params?: AnalyticsEventParams;
	/** Optional authenticated user identifier. */
	userId?: string;
}

let clientId: string;

/**
 * Attempts to retrieve the Client ID from the Google Analytics cookie (`_ga`).
 *
 * This ensures consistency between client-side (ReactGA) and server-side fallback tracking.
 * Cookie format is expected to be `GA1.1.<clientId>.<timestamp>` or `GA1.2.<clientId>.<timestamp>`.
 *
 * @returns {string | null} The extracted Client ID or `null` if the cookie is not found or invalid.
 *
 * @example
 * const gaId = getGaClientIdFromCookie();
 */
const getGaClientIdFromCookie = (): string | null => {
	if (typeof document === "undefined") return null;

	const match = document.cookie.match(/(?:^|; )\s*_ga=GA1\.[0-9]+\.([^;]+)/);

	return match ? match[1] : null;
};

/**
 * Initialize the analytics client with a unique client ID.
 *
 * Prioritizes the ID from the Google Analytics cookie for cross-track consistency.
 * If not found, it falls back to `localStorage` or generates a new one.
 * The ID is persisted in `localStorage`.
 *
 * @returns {string} The initialized client ID.
 *
 * @example
 * const id = initializeAnalyticsClient();
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
 * Gets the current client ID, initializing it if necessary.
 *
 * @returns {string} The active client ID.
 *
 * @example
 * const id = getClientId();
 */
export const getClientId = (): string => {
	if (!clientId) {
		initializeAnalyticsClient();
	}

	return clientId;
};

/**
 * Sends an analytics event to the backend for server-side relay.
 *
 * Uses `navigator.sendBeacon` if available for non-blocking reliability on page unload.
 * Falls back to a standard `fetch` with `keepalive: true` if `sendBeacon` fails or is unavailable.
 *
 * @param {string} eventName - The name of the event (e.g., "optimization_complete"). **Must not be empty.**
 * @param {AnalyticsEventParams} [params={}] - Optional event parameters.
 * @param {string} [userId] - Optional authenticated user identifier.
 * @returns {void}
 *
 * @example
 * sendEvent("optimization_complete", { category: "ui", solve_method: "sa" });
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
			try {
				const success = navigator.sendBeacon(`${API_URL}api/events`, blob);
				if (success) return;
			} catch (error) {
				// Facebook Android in-app browser can throw "Java object is gone"
				// or other bridge-related errors. Fall back to fetch.
				console.warn("navigator.sendBeacon failed, falling back to fetch:", error);
			}
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
