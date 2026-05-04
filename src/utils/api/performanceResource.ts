import type { PerformanceMetric } from "../../hooks/usePerformanceData/usePerformanceData";

import { API_URL } from "../../constants";
import { apiCall } from "./network";

/**
 * Cached promises for different date ranges to prevent redundant API calls.
 * @internal
 */
const performanceDataPromises = new Map<string, Promise<PerformanceMetric[]>>();

/**
 * Fetches performance data statistics from the analytics endpoint.
 *
 * @remarks
 * This utility retrieves aggregate performance metrics (e.g., `LCP`, `FCP`, `INP`)
 * for a specified date range. Results are cached per range to optimize
 * performance. A cache-busting timestamp is included to ensure freshness.
 *
 * @param {string} [startDate="30daysAgo"] - The start date for the data (GA4 relative format or YYYY-MM-DD).
 * @param {string} [endDate="today"] - The end date for the data.
 *
 * @returns {Promise<PerformanceMetric[]>} A promise resolving to an array of performance metrics.
 *
 * @throws {Error} Throws if the `apiCall` fails.
 *
 * @see {@link apiCall} for the underlying network implementation.
 *
 * @category Data Fetching
 *
 * @example
 * ```ts
 * const data = await fetchPerformanceData("7daysAgo", "today");
 * ```
 */
export const fetchPerformanceData = (
	startDate = "30daysAgo",
	endDate = "today"
): Promise<PerformanceMetric[]> => {
	const rangeKey = `${startDate}-${endDate}`;

	if (!performanceDataPromises.has(rangeKey)) {
		const timestamp = new Date().getTime();
		const promise = apiCall<PerformanceMetric[]>(
			`${API_URL}analytics/performance_data?start_date=${startDate}&end_date=${endDate}&_=${timestamp}`,
			{ skipGlobalError: true },
			10000
		)
			.then((data) => {
				return data;
			})
			.catch((error) => {
				// Reset promise on error so we can retry
				performanceDataPromises.delete(rangeKey);
				throw error;
			});

		performanceDataPromises.set(rangeKey, promise);
	}

	return performanceDataPromises.get(rangeKey)!;
};

/**
 * Checks if performance data for a given range is already cached.
 *
 * @param {string} [startDate="30daysAgo"] - The start date.
 * @param {string} [endDate="today"] - The end date.
 *
 * @returns {boolean} True if the data is cached.
 *
 * @example
 * ```ts
 * const cached = isPerformanceDataCached("7daysAgo");
 * ```
 */
export const isPerformanceDataCached = (startDate = "30daysAgo", endDate = "today"): boolean => {
	const rangeKey = `${startDate}-${endDate}`;

	return performanceDataPromises.has(rangeKey);
};

/**
 * Resets the cached promise for performance data.
 *
 * @remarks
 * Use this to force a fresh fetch of performance metrics, typically used
 * after a significant period has passed or when re-entering the dashboard.
 *
 * @returns {void}
 *
 * @example
 * ```ts
 * resetPerformanceDataCache();
 * ```
 */
export const resetPerformanceDataCache = () => {
	performanceDataPromises.clear();
};
