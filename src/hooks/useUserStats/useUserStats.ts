// src/hooks/useUserStats/useUserStats.ts
import { use } from "react";

import { fetchUserStats } from "./userStatsResource";

/**
 * Represents a single aggregate record of user optimization activity.
 *
 * @category Types
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
 * @remarks
 * This hook uses React's `use()` for promise unwrapping, allowing it to be used
 * within Suspense boundaries. It retrieves usage data from the last 28 days
 * to identify popular technologies and configurations.
 *
 * @hook
 * @category Hooks
 * @returns {UserStat[]} An array of user statistics.
 *
 * @see {@link fetchUserStats} for the underlying API resource.
 * @see {@link ./useUserStats.test.ts Unit Tests}
 *
 * @example
 * ```tsx
 * const PopularTechList = () => {
 *   const stats = useUserStats();
 *   return (
 *     <ul>
 *       {stats.map(s => <li key={s.technology}>{s.technology}: {s.total_events}</li>)}
 *     </ul>
 *   );
 * };
 * ```
 */
export const useUserStats = (): UserStat[] => {
	return use(fetchUserStats());
};
