/**
 * Wrapper for fetch with timeout support.
 * Throws an AbortError if the request exceeds the timeout duration.
 *
 * @param url - The URL to fetch
 * @param options - Fetch options (timeout will be added/overridden)
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise<Response>
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
			throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
		}
		throw error;
	} finally {
		clearTimeout(timeoutId);
	}
}
