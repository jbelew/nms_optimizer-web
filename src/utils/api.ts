import { fetchWithTimeout } from "./fetchWithTimeout";
import { HttpError } from "./HttpError";

/**
 * Fetches a JSON resource from the network.
 *
 * @template T - The expected return type.
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options] - Fetch options.
 * @param {number} [timeout=10000] - Timeout in milliseconds.
 * @returns {Promise<T>} The parsed JSON response.
 * @throws {HttpError} If the response status is not ok.
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
