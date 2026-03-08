import { useOptimizeStore } from "../store/OptimizeStore";
import { fetchJson } from "./api";
import { hideSplashScreenAndShowBackground } from "./splashScreen";

/**
 * Options for the `apiCall` function, extending standard `RequestInit`.
 */
export interface ApiCallOptions extends RequestInit {
	/** Whether to skip showing the global error dialog on failure. Defaults to `false`. */
	skipGlobalError?: boolean;
}

/**
 * Centralized API call wrapper that handles errors and triggers the global error dialog.
 *
 * All HTTP errors and network failures automatically trigger the `ErrorContent` dialog
 * via the `OptimizeStore` unless `skipGlobalError` is set to `true`.
 *
 * @template T - The expected return type of the JSON data.
 * @param {string} url - The API endpoint URL. **Must be a valid URL.**
 * @param {ApiCallOptions} [options={}] - Fetch options plus custom logic flags.
 * @param {number} [timeout=10000] - Timeout in milliseconds. **Must be a positive integer.**
 * @returns {Promise<T>} A promise that resolves to the parsed JSON response of type `T`.
 * @throws {HttpError} Throws if the response status is not "ok".
 * @throws {Error} Throws on network failure or timeout.
 *
 * @example
 * const result = await apiCall<{ success: boolean }>("/api/submit", { method: "POST" });
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
