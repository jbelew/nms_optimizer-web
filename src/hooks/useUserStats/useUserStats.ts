// src/hooks/useUserStats/useUserStats.ts
import { use } from "react";

import { fetchUserStats } from "./userStatsResource";

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
 * @returns {UserStat[]} An array of user stats data.
 */
export const useUserStats = (): UserStat[] => {
	return use(fetchUserStats());
};
