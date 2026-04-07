/**
 * API utility module for simplified network requests.
 *
 * @remarks
 * This module provides high-level functions for interacting with the backend API.
 * It abstracts away common tasks such as JSON parsing, error handling, and
 * timeout management.
 *
 * @category Utilities
 * @see {@link fetchJson}
 * @see {@link HttpError}
 */

import { fetchWithTimeout } from "./fetchWithTimeout";
import { HttpError } from "./HttpError";

/**
 * Fetches a JSON resource from the network with built-in error handling and timeout.
 *
 * @remarks
 * Automatically checks if the response is successful and parses the body as JSON.
 * It uses {@link fetchWithTimeout} internally to ensure requests do not hang indefinitely.
 *
 * @template T - The expected return type of the JSON data.
 * @param {string} url - The URL to fetch. **Must be a valid URL string.**
 * @param {RequestInit} [options] - Standard `fetch` options.
 * @param {number} [timeout=10000] - Timeout in milliseconds. **Must be a positive integer.**
 * @returns {Promise<T>} A promise that resolves to the parsed JSON response of type `T`.
 * @throws {HttpError} Throws an `HttpError` if the response status is not "ok" (200-299).
 * @throws {Error} Throws a timeout error if the request exceeds the `timeout` duration.
 * @category Utilities
 * @see {@link fetchWithTimeout}
 * @see {@link HttpError}
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
