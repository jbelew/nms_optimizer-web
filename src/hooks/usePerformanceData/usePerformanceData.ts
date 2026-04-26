import { use } from "react";

import { fetchPerformanceData } from "../../utils/api/performanceResource";

/**
 * Represents a single performance metric aggregate record.
 *
 * @remarks
 * This type captures p75 values for Core Web Vitals and other performance indicators.
 * It is consumed by both the service layer and the frontend dashboard.
 *
 * @category Types
 *
 * @example
 * ```ts
 * const metric: PerformanceMetric = {
 *   timestamp: 1619370000000,
 *   metric_name: "LCP",
 *   average_value: 1200
 * };
 * ```
 */
export type PerformanceMetric = {
	/** The Unix timestamp in milliseconds for the hourly bucket. */
	timestamp: number;
	/** The name of the performance metric (e.g., `LCP`, `FCP`, `INP`, `TBT`). */
	metric_name: string;
	/** The 75th percentile (p75) value of the metric for this time bucket. */
	average_value: number;
	/** The application version associated with this metric. */
	app_version: string;
};

/**
 * Custom hook for retrieving aggregate performance statistics.
 *
 * @remarks
 * This hook uses React's `use()` for promise unwrapping, allowing it to be used
 * within `<Suspense>` boundaries. It retrieves hourly p75 performance data
 * from the last 30 days via BigQuery.
 *
 * @returns {PerformanceMetric[]} An array of performance metrics.
 *
 * @throws {Error} Propagates errors from the underlying `apiCall` if the fetch fails.
 *
 * @see {@link fetchPerformanceData} for the underlying API resource.
 * @see {@link PerformanceMetric} for the data structure.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const PerformanceDashboard = () => {
 *   const data = usePerformanceData();
 *   return <PerformanceChart data={data} />;
 * };
 * ```
 */
export const usePerformanceData = (): PerformanceMetric[] => {
	return use(fetchPerformanceData());
};
