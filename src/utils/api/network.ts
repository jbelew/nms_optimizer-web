/**
 * Network utility module for API operations.
 *
 * @remarks
 * This module provides high-level functions for interacting with the backend API,
 * including custom error classes, timeout management, and global error handling.
 *
 * @category Utilities
 */

import { useOptimizeStore } from "../../store/app/optimizeStore";

/**
 * Options for the `apiCall` function, extending standard `RequestInit`.
 *
 * @category Utilities
 */
export interface ApiCallOptions extends RequestInit {
	/** Whether the call is critical for app boot. If true, error dialog is skipped. */
	isCritical?: boolean;
	/** Whether to skip showing the global error dialog on failure. Defaults to `false`. */
	skipGlobalError?: boolean;
}

/**
 * Custom error class for HTTP errors.
 *
 * @remarks
 * Provides a structured way to handle failed network requests by including
 * the HTTP status code and status text alongside the error message.
 * This is the standard error type thrown by {@link fetchJson}.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * throw new HttpError(404, "Not Found", "User with ID 1 does not exist");
 * ```
 */
export class HttpError extends Error {
	/**
	 * The HTTP status code (e.g., 404, 500).
	 */
	status: number;

	/**
	 * The HTTP status text (e.g., "Not Found", "Internal Server Error").
	 */
	statusText: string;

	/**
	 * Creates an instance of `HttpError`.
	 *
	 * @param status - The HTTP status code. Must be a valid HTTP status.
	 * @param statusText - The HTTP status text.
	 * @param message - An optional descriptive error message. Defaults to a generic "HTTP error" string.
	 *
	 * @example
	 * ```ts
	 * const error = new HttpError(404, "Not Found");
	 * // returns HttpError instance
	 * ```
	 */
	constructor(status: number, statusText: string, message?: string) {
		super(message || `HTTP error! status: ${status}`);
		this.name = "HttpError";
		this.status = status;
		this.statusText = statusText;
	}
}

/**
 * Centralized API call wrapper that handles errors and triggers the global error dialog.
 *
 * @remarks
 * All HTTP errors and network failures automatically trigger the `ErrorContent` dialog
 * via the `OptimizeStore` unless `skipGlobalError` or `isCritical` is set to `true`. This ensures a
 * consistent error experience across the application without manual try-catch in every hook.
 *
 * It uses {@link fetchJson} internally for the actual network request and JSON parsing.
 *
 * @template T - The expected return type of the JSON data.
 *
 * @param url - The API endpoint URL. Must be a valid URL.
 * @param options - Fetch options plus custom logic flags.
 * @param timeout - Timeout in milliseconds. Must be a positive integer.
 *
 * @returns A promise that resolves to the parsed JSON response of type `T`.
 *
 * @throws {HttpError} Throws if the response status is not "ok" (e.g., 4xx, 5xx).
 * @throws {Error} Throws on network failure, timeout, or JSON parsing error.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * try {
 *   const result = await apiCall<{ success: boolean }>("/api/submit", {
 *     method: "POST",
 *     body: JSON.stringify(payload)
 *   });
 *   console.log("Success:", result.success);
 * } catch (error) {
 *   // Error dialog already shown unless skipGlobalError: true
 * }
 * ```
 */
export async function apiCall<T = unknown>(
	url: string,
	options: ApiCallOptions = {},
	timeout: number = 10000
): Promise<T> {
	const { isCritical = false, skipGlobalError = false, ...fetchOptions } = options;

	try {
		return await fetchJson<T>(url, fetchOptions, timeout);
	} catch (error) {
		console.error("API call failed:", error);

		if (!skipGlobalError && !isCritical) {
			// Always trigger error dialog for any failure in apiCall unless skipped or critical
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

/**
 * Fetches a JSON resource from the network with built-in error handling and timeout.
 *
 * @remarks
 * Automatically checks if the response is successful and parses the body as JSON.
 * It uses {@link fetchWithTimeout} internally to ensure requests do not hang indefinitely.
 *
 * @template T - The expected return type of the JSON data.
 *
 * @param url - The URL to fetch. Must be a valid URL string.
 * @param options - Standard `fetch` options.
 * @param timeout - Timeout in milliseconds. Must be a positive integer.
 *
 * @returns A promise that resolves to the parsed JSON response of type `T`.
 *
 * @throws {HttpError} Throws an `HttpError` if the response status is not "ok" (200-299).
 * @throws {Error} Throws a timeout error if the request exceeds the `timeout` duration.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const data = await fetchJson<{ id: number }>("/api/user/1");
 * ```
 */
export async function fetchJson<T>(
	url: string,
	options?: RequestInit,
	timeout: number = 10000
): Promise<T> {
	const response = await fetchWithTimeout(url, options, timeout);

	if (!response.ok) {
		throw new HttpError(response.status, response.statusText);
	}

	return response.json();
}

/**
 * Wrapper for the native `fetch` API that adds timeout support.
 *
 * @remarks
 * This function initiates a network request and aborts it if it does not complete
 * within the specified duration. It provides better error messages when a
 * timeout occurs, distinguishing it from other network errors.
 *
 * @param url - The URL to fetch. Must be a valid URL string.
 * @param options - Standard `fetch` options. The `signal` property will be overridden.
 * @param timeoutMs - Timeout duration in milliseconds. Must be a positive integer.
 *
 * @returns A promise that resolves to the `Response` object.
 *
 * @throws {Error} Throws an error if the request exceeds the `timeoutMs` duration or if the network request fails.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const response = await fetchWithTimeout("https://api.example.com/data", {}, 5000);
 * ```
 */
export async function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
	timeoutMs: number = 10000
): Promise<Response> {
	const controller = new AbortController();
	let timeoutTriggered = false;
	const timeoutId = setTimeout(() => {
		timeoutTriggered = true;
		console.warn(`[fetchWithTimeout] Timeout (${timeoutMs}ms) TRIGGERED for: ${url}`);
		controller.abort();
	}, timeoutMs);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		return response;
	} catch (error) {
		if (timeoutTriggered && error instanceof Error && error.name === "AbortError") {
			console.error(`[fetchWithTimeout] Request aborted due to timeout: ${url}`);
			throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`, { cause: error });
		}

		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
}
