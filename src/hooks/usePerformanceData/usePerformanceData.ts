import type { PerformanceMetric } from "@/types/performance";
import { use } from "react";

import { fetchPerformanceData } from "@/utils/api/performanceResource";

/**
 * Type definition for performance metrics retrieved from the monitoring API.
 * @category Hooks
 */
export type { PerformanceMetric };

/**
 * Custom hook for retrieving aggregate performance statistics.
 *
 * @remarks
 * This hook uses the React 19 `use()` primitive to resolve asynchronous performance data.
 * It must be used within a `<Suspense>` boundary to handle the loading state gracefully.
 * The data includes metrics like TBT (Total Blocking Time), LCP (Largest Contentful Paint),
 * and custom optimization solve durations.
 *
 * @param {string} [startDate] - ISO string for the start of the reporting period.
 * @param {string} [endDate] - ISO string for the end of the reporting period.
 *
 * @returns {PerformanceMetric[]} An array of aggregate performance metrics.
 *
 * @see {@link fetchPerformanceData} for the API resource implementation.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Usage within a Suspense boundary
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <PerformanceView />
 * </Suspense>
 *
 * const PerformanceView = () => {
 *   const metrics = usePerformanceData();
 *   return <div>Latest LCP: {metrics.find(m => m.name === "LCP")?.value}ms</div>;
 * };
 * ```
 */
export const usePerformanceData = (startDate?: string, endDate?: string): PerformanceMetric[] => {
	return use(fetchPerformanceData(startDate, endDate));
};
