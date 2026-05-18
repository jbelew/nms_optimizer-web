/**
 * Executes a function when the browser is idle.
 *
 * This is a wrapper around `requestIdleCallback` with a fallback to `setTimeout`
 * for environments where `requestIdleCallback` is not supported.
 *
 * @param {() => void} fn - The function to execute.
 * @param {object} options - Configuration options.
 * @param {number} [options.timeout=2000] - Maximum time to wait before forcing execution.
 *
 * @category Utils
 */
export function runWhenIdle(fn: () => void, options: { timeout?: number } = {}): void {
	const { timeout = 2000 } = options;

	if (
		typeof window !== "undefined" &&
		typeof (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback ===
			"function"
	) {
		(
			window as typeof window & {
				requestIdleCallback: (cb: () => void, options?: { timeout: number }) => void;
			}
		).requestIdleCallback(fn, { timeout });
	} else {
		// Fallback for environments without requestIdleCallback
		// Use a short delay if no timeout specified, otherwise half the timeout
		const delay = options.timeout ? options.timeout / 2 : 100;
		setTimeout(fn, delay);
	}
}
