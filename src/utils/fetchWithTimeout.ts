/**
 * Utility for network requests with mandatory timeouts.
 *
 * @remarks
 * This module provides a wrapper around the native `fetch` API to ensure
 * that requests do not hang indefinitely. It uses `AbortController` to
 * cancel requests that exceed the specified timeout duration.
 *
 * @category Utilities
 * @see {@link fetchWithTimeout}
 */

/**
 * Wrapper for the native `fetch` API that adds timeout support.
 *
 * @remarks
 * This function initiates a network request and aborts it if it does not complete
 * within the specified duration. It provides better error messages when a
 * timeout occurs, distinguishing it from other network errors.
 *
 * @param {string} url - The URL to fetch. **Must be a valid URL string.**
 * @param {RequestInit} [options={}] - Standard `fetch` options. The `signal` property will be overridden.
 * @param {number} [timeoutMs=10000] - Timeout duration in milliseconds. **Must be a positive integer.**
 * @returns {Promise<Response>} A promise that resolves to the `Response` object.
 * @throws {Error} Throws an error if the request exceeds the `timeoutMs` duration or if the network request fails.
 * @category Utilities
 *
 * @example
 * ```ts
 * const response = await fetchWithTimeout("https://api.example.com/data", {}, 5000);
 * // returns Promise<Response>
 * ```
 */
export async function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
	timeoutMs: number = 10000
): Promise<Response> {
	const controller = new AbortController();
	let timeoutTriggered = false;
	console.log(`[fetchWithTimeout] Starting fetch with ${timeoutMs}ms timeout: ${url}`);
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
