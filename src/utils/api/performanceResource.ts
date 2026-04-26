import type { PerformanceMetric } from "../../hooks/usePerformanceData/usePerformanceData";

import { API_URL } from "../../constants";
import { apiCall } from "./network";

/**
 * Cached promise to prevent redundant API calls during the same session.
 * @internal
 */
let performanceDataPromise: Promise<PerformanceMetric[]> | null = null;

/**
 * Fetches performance data statistics from the analytics endpoint.
 *
 * @remarks
 * This utility retrieves aggregate p75 performance metrics (e.g., `LCP`, `FCP`, `INP`, `TBT`)
 * for the past 30 days grouped by hour. The result is cached in a promise to optimize
 * performance within the same session. It includes a cache-busting timestamp to ensure
 * hourly updates are always fresh when the cache is reset.
 *
 * @returns {Promise<PerformanceMetric[]>} A promise resolving to an array of performance metrics.
 *
 * @throws {Error} Throws if the `apiCall` fails or the network times out.
 *
 * @see {@link apiCall} for the underlying network implementation.
 * @see {@link import('../../hooks/usePerformanceData/usePerformanceData').usePerformanceData} for the React hook consumer.
 *
 * @category Data Fetching
 *
 * @example
 * ```ts
 * const data = await fetchPerformanceData();
 * ```
 */
export const fetchPerformanceData = (): Promise<PerformanceMetric[]> => {
	if (!performanceDataPromise) {
		const timestamp = new Date().getTime();
		performanceDataPromise = apiCall<PerformanceMetric[]>(
			`${API_URL}analytics/performance_data?start_date=30daysAgo&end_date=today&_=${timestamp}`,
			{ skipGlobalError: true },
			10000
		)
			.then((data) => {
				return data;
			})
			.catch((error) => {
				// Reset promise on error so we can retry
				performanceDataPromise = null;
				throw error;
			});
	}

	return performanceDataPromise;
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
	performanceDataPromise = null;
};
