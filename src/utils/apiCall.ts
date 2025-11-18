import { useOptimizeStore } from "../store/OptimizeStore";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { hideSplashScreenAndShowBackground } from "./splashScreen";

/**
 * Centralized API call wrapper that handles errors and triggers the error dialog.
 * All HTTP errors and network failures automatically trigger the ErrorContent dialog.
 *
 * @param {string} url - The API endpoint URL.
 * @param {RequestInit} options - Fetch options.
 * @param {number} timeout - Timeout in milliseconds (default: 10000).
 * @returns {Promise<Response>} The fetch response.
 * @throws {Error} If the request fails or returns a non-ok status.
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
			hideSplashScreenAndShowBackground();
			useOptimizeStore.getState().setShowError(true);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return response;
	} catch (error) {
		console.error("API call failed:", error);
		// Only trigger error dialog for non-error-already-thrown cases
		if (!(error instanceof Error && error.message.includes("HTTP error"))) {
			hideSplashScreenAndShowBackground();
			useOptimizeStore.getState().setShowError(true);
		}
		throw error;
	}
}
