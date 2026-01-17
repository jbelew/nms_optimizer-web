import { API_URL } from "../../constants";
import { apiCall } from "../../utils/apiCall";
import { UserStat } from "./useUserStats";

let userStatsPromise: Promise<UserStat[]> | null = null;

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

// Function to reset the cache (useful for testing)
export const resetUserStatsCache = () => {
	userStatsPromise = null;
};
