// src/hooks/useUserStats/useUserStats.ts
import { use } from "react";

import { fetchUserStats } from "./userStatsResource";

/**
 * Represents a single aggregate record of user optimization activity.
 */
export type UserStat = {
	/** The name of the analytics event. */
	event_name: string;
	/** The ship type identifier associated with the event. */
	ship_type: string;
	/** A string flag ('yes' or 'no') indicating if supercharged slots were used. */
	supercharged: string;
	/** The technology identifier that was optimized. */
	technology: string;
	/** The total occurrences of this specific configuration. */
	total_events: number;
};

/**
 * Custom hook for retrieving aggregate user statistics.
 *
 * Uses React's `use` for promise unwrapping, designed for use within a Suspense boundary.
 *
 * @returns {UserStat[]} An array of user statistics.
 *
 * @example
 * const stats = useUserStats();
 */
export const useUserStats = (): UserStat[] => {
	return use(fetchUserStats());
};
