/**
 * @file Robust dynamic module loading with retry logic for flaky environments like iOS Safari.
 */

/**
 * Options for retrying a dynamic import.
 *
 * @property {number} retries - The number of times to retry the import before giving up.
 * @property {number} delay - The delay in milliseconds between retry attempts.
 */
interface RetryOptions {
	retries?: number;
	delay?: number;
}

/**
 * Attempts to dynamically import a module with retry logic.
 *
 * This is particularly useful for addressing "Importing a module script failed" errors
 * in iOS Safari, which can occur during concurrent network activity or race conditions.
 *
 * @template T - The type of the imported module.
 * @param {() => Promise<T>} importFn - A function that returns the dynamic import promise.
 * @param {RetryOptions} options - Configuration for retry attempts.
 * @returns {Promise<T>} A promise that resolves to the imported module.
 *
 * @example
 * const module = await retryImport(() => import("./myModule"), { retries: 3, delay: 1000 });
 */
export async function retryImport<T>(
	importFn: () => Promise<T>,
	{ retries = 3, delay = 1000 }: RetryOptions = {}
): Promise<T> {
	try {
		return await importFn();
	} catch (error) {
		if (retries > 0) {
			console.warn(
				`Dynamic import failed. Retrying in ${delay}ms... (${retries} attempts left)`,
				error
			);

			await new Promise((resolve) => setTimeout(resolve, delay));

			return retryImport(importFn, { retries: retries - 1, delay: delay * 2 }); // Exponential backoff
		}

		console.error("Dynamic import failed after all retry attempts:", error);
		throw error;
	}
}
