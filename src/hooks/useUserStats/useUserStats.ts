import type { UserStat } from "@/types/userStats";
import { use } from "react";

import { fetchUserStats } from "@/utils/api/userStatsResource";

export type { UserStat };

/**
 * Custom hook for retrieving aggregate user statistics.
...
 */
export const useUserStats = (): UserStat[] => {
	return use(fetchUserStats());
};
