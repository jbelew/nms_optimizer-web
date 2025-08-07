// src/hooks/useUserStats/useUserStats.ts
import { useEffect, useState } from "react";

import { API_URL } from "../../constants";

export type UserStat = {
	event_name: string;
	ship_type: string;
	supercharged: string;
	technology: string;
	total_events: number;
};

export const useUserStats = () => {
	const [data, setData] = useState<UserStat[] | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					API_URL + "analytics/popular_data?start_date=28daysAgo&end_date=today"
				);
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				const result = await response.json();
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
