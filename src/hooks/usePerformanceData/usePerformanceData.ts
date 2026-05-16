import type { PerformanceMetric } from "../../types/performance";
import { use } from "react";

import { fetchPerformanceData } from "../../utils/api/performanceResource";

export type { PerformanceMetric };

/**
 * Custom hook for retrieving aggregate performance statistics.
...
 */
export const usePerformanceData = (startDate?: string, endDate?: string): PerformanceMetric[] => {
	return use(fetchPerformanceData(startDate, endDate));
};
