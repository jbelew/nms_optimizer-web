import { useOptimizeStore } from "../store/OptimizeStore";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { HttpError } from "./HttpError";
import { hideSplashScreenAndShowBackground } from "./splashScreen";

/**
 * Centralized API call wrapper that handles errors and triggers the error dialog.
 * All HTTP errors and network failures automatically trigger the ErrorContent dialog.
 *
 * @param {string} url - The API endpoint URL.
 * @param {RequestInit} options - Fetch options.
 * @param {number} timeout - Timeout in milliseconds (default: 10000).
 * @returns {Promise<Response>} The fetch response.
 * @throws {HttpError|Error} If the request fails or returns a non-ok status.
 */
export async function apiCall(
	url: string,
	options?: RequestInit,
	timeout: number = 10000
): Promise<Response> {
	try {
		const response = await fetchWithTimeout(url, options, timeout);

		if (!response.ok) {
			console.error(`HTTP error: ${response.status} ${response.statusText}`);
			throw new HttpError(response.status, response.statusText);
		}

		return response;
	} catch (error) {
		console.error("API call failed:", error);

		// Always trigger error dialog for any failure in apiCall
		// This centralized handling is a core feature of this utility
		hideSplashScreenAndShowBackground();
		useOptimizeStore.getState().setShowError(true);

		throw error;
	}
}
