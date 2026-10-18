/**
 * Executes a function when the browser is idle.
 *
 * @remarks
 * Wraps `requestIdleCallback` with a fallback to `setTimeout`
 * for environments where `requestIdleCallback` is not supported.
 *
 * @param fn - The function to execute.
 * @param options - Configuration options.
 * @param options.timeout - Maximum time to wait before forcing execution.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * runWhenIdle(() => preloadAssets(), { timeout: 1000 });
 * // schedules callback during browser idle period
 * ```
 */
export function runWhenIdle(fn: () => void, options: { timeout?: number } = {}): void {
	const { timeout = 2000 } = options;

	if (
		typeof window !== "undefined"
		&& typeof (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback
			=== "function"
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
