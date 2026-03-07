import type { UserStat } from "./useUserStats";

import { API_URL } from "../../constants";
import { apiCall } from "../../utils/apiCall";

let userStatsPromise: Promise<UserStat[]> | null = null;

/**
 * Fetches user statistics from the analytics endpoint.
 * Caches the result in a promise to avoid redundant network calls.
 * @returns {Promise<UserStat[]>} A promise that resolves to an array of user statistics.
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
 * Resets the cached user statistics promise.
 * Useful for testing or to force a re-fetch of the statistics data.
 */
export const resetUserStatsCache = () => {
	userStatsPromise = null;
};
