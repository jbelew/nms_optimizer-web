import type { UserStat } from "@/types/userStats";
import { use } from "react";

import { fetchUserStats } from "@/utils/api/userStatsResource";

/**
 * Represents a single aggregate user statistic (e.g., total builds).
 * @category Hooks
 */
export type { UserStat };

/**
 * Custom hook for retrieving aggregate user statistics.
 *
 * @remarks
 * This hook uses the React 19 `use()` primitive to resolve asynchronous user statistic data.
 * It must be used within a `<Suspense>` boundary. The statistics provide a high-level
 * overview of global optimization trends, such as total builds saved and popular platforms.
 *
 * @returns {UserStat[]} An array of global user statistics.
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
 *   const totalBuilds = stats.find(s => s.key === "total_builds")?.value ?? 0;
 *   return <div>Total Builds Saved: {totalBuilds}</div>;
 * };
 * ```
 */
export const useUserStats = (): UserStat[] => {
	return use(fetchUserStats());
};
