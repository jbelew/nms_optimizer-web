/**
 * Performance monitoring types for NMS Optimizer.
 *
 * @category Types
 */

/**
 * Represents a single performance metric aggregate record.
 *
 * @remarks
 * This type captures p75 values for Core Web Vitals and other performance indicators.
 * It is consumed by both the service layer and the frontend dashboard.
 */
export type PerformanceMetric = {
	/** The application version associated with this metric. */
	app_version: string;
	/** The 75th percentile (p75) value of the metric for this time bucket. */
	average_value: number;
	/** The name of the performance metric (e.g., `LCP`, `FCP`, `INP`, `TBT`). */
	metric_name: string;
	/** The 50th percentile (p50) value of the metric. */
	p50?: number;
	/** The 75th percentile (p75) value of the metric. */
	p75?: number;
	/** The 90th percentile (p90) value of the metric. */
	p90?: number;
	/** The Unix timestamp in milliseconds for the hourly bucket. */
	timestamp: number;
};
