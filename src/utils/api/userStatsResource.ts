import type { UserStat } from "@/types/userStats";

import { API_URL } from "@/constants";

import { apiCall } from "./network";

let userStatsPromise: null | Promise<UserStat[]> = null;

/**
 * Fetches popular data statistics from the analytics endpoint.
 *
 * @remarks
 * This utility retrieves aggregate usage data (e.g., most optimized technologies)
 * for the past 28 days. The result is cached in a promise to prevent redundant
 * API calls within the same session.
 *
 * It is primarily used by components that display community trends and
 * popular technology configurations.
 *
 * @returns {Promise<UserStat[]>} A promise resolving to an array of statistics objects.
 *
 * @see {@link apiCall} for the underlying network implementation.
 * @see {@link import('@/hooks/useUserStats/useUserStats').useUserStats} for the React hook consumer.
 *
 * @category Data Fetching
 *
 * @example
 * ```ts
 * const stats = await fetchUserStats();
 * console.log(stats[0].tech_key, stats[0].count);
 * ```
 */
export const fetchUserStats = (): Promise<UserStat[]> => {
	if (!userStatsPromise) {
		userStatsPromise = apiCall<UserStat[]>(
			API_URL + "analytics/popular_data?start_date=28daysAgo&end_date=today",
			{},
			10000
		)
			.then((data) => {
				return data;
			})
			.catch((error) => {
				// Reset promise on error so we can retry
				userStatsPromise = null;
				throw error;
			});
	}

	return userStatsPromise;
};

/**
 * Resets the cached promise for user statistics.
 *
 * @returns {void}
 *
 * @example
 * resetUserStatsCache();
 */
export const resetUserStatsCache = () => {
	userStatsPromise = null;
};
