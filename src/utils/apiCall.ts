import { useOptimizeStore } from "../store/OptimizeStore";
import { fetchJson } from "./api";
import { hideSplashScreenAndShowBackground } from "./splashScreen";

export interface ApiCallOptions extends RequestInit {
	skipGlobalError?: boolean;
}

/**
 * Centralized API call wrapper that handles errors and triggers the error dialog.
 * All HTTP errors and network failures automatically trigger the ErrorContent dialog unless skipped.
 *
 * @template T - The expected return type.
 * @param {string} url - The API endpoint URL.
 * @param {ApiCallOptions} [options] - Fetch options plus custom flags.
 * @param {number} [timeout=10000] - Timeout in milliseconds (default: 10000).
 * @returns {Promise<T>} The parsed JSON response.
 * @throws {HttpError|Error} If the request fails or returns a non-ok status.
 */
export async function apiCall<T = unknown>(
	url: string,
	options: ApiCallOptions = {},
	timeout: number = 10000
): Promise<T> {
	const { skipGlobalError = false, ...fetchOptions } = options;

	try {
		return await fetchJson<T>(url, fetchOptions, timeout);
	} catch (error) {
		console.error("API call failed:", error);

		if (!skipGlobalError) {
			// Always trigger error dialog for any failure in apiCall unless skipped
			hideSplashScreenAndShowBackground();
			useOptimizeStore
				.getState()
				.setShowError(
					true,
					"fatal",
					error instanceof Error ? error : new Error(String(error))
				);
		}

		throw error;
	}
}
