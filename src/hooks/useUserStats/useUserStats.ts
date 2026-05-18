import type { UserStat } from "@/types/userStats";
import { use } from "react";

import { fetchUserStats } from "@/utils/api/userStatsResource";

export type { UserStat };

/**
 * Custom hook for retrieving aggregate user statistics.
 *
 * @remarks
 * This hook uses React's `use()` hook to resolve the `fetchUserStats()` promise.
 * It is intended to be used within a `<Suspense>` boundary. The returned
 * statistics provide a high-level overview of global optimization trends,
 * such as total builds saved and most popular ship types.
 *
 * @returns {UserStat[]} An array of user statistics objects.
 *
 * @see {@link fetchUserStats} for the underlying resource logic.
 * @see {@link ./useUserStats.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const StatsDashboard = () => {
 *   const stats = useUserStats();
 *   return <div>Total Builds: {stats.find(s => s.key === 'total_builds')?.value}</div>;
 * };
 * ```
 */
export const useUserStats = (): UserStat[] => {
	return use(fetchUserStats());
};
