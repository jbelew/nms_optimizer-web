import type { UserStat } from "./useUserStats";

import { API_URL } from "../../constants";
import { apiCall } from "../../utils/apiCall";

let userStatsPromise: Promise<UserStat[]> | null = null;

/**
 * Fetches popular data statistics from the analytics endpoint.
 *
 * This utility retrieves aggregate usage data (e.g., most optimized technologies)
 * for the past 28 days. The result is cached in a promise to prevent redundant
 * API calls within the same session.
 *
 * @returns {Promise<UserStat[]>} A promise resolving to an array of statistics objects.
 *
 * @example
 * const stats = await fetchUserStats();
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
