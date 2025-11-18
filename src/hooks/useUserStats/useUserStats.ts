// src/hooks/useUserStats/useUserStats.ts
import { useEffect, useState } from "react";

import { API_URL } from "../../constants";
import { apiCall } from "../../utils/apiCall";

/**
 * @typedef {object} UserStat
 * @property {string} event_name - The name of the event.
 * @property {string} ship_type - The type of ship.
 * @property {string} supercharged - Whether the technology was supercharged.
 * @property {string} technology - The technology that was optimized.
 * @property {number} total_events - The total number of events.
 */
export type UserStat = {
	event_name: string;
	ship_type: string;
	supercharged: string;
	technology: string;
	total_events: number;
};

/**
 * Custom hook to fetch user statistics from the API.
 *
 * @returns {{data: UserStat[] | null, loading: boolean, error: string | null}}
 *          An object containing the user stats data, loading state, and error state.
 */
export const useUserStats = () => {
	const [data, setData] = useState<UserStat[] | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await apiCall<UserStat[]>(
					API_URL + "analytics/popular_data?start_date=28daysAgo&end_date=today",
					{},
					10000
				);
				setData(result);
			} catch (error: unknown) {
				setError((error as Error).message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return { data, loading, error };
};
