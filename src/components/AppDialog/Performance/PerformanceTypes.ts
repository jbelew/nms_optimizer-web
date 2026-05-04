/**
 * Represents a single point in the timeseries chart.
 *
 * @remarks
 * This interface defines the data structure expected by Recharts components.
 * It contains standard metadata (timestamp, version) and dynamic metric keys
 * that correspond to actual CWV names (e.g., `LCP`).
 *
 * It supports:
 * - Raw metric values (`number`)
 * - Formatted display strings (`string`)
 * - Range values for bar charts (`[number, number]`)
 *
 * @category Interfaces
 */
export interface ChartDataPoint {
	/** Unix timestamp in milliseconds for consistent sorting. */
	timestamp: number;
	/** Localized formatted MM/DD string for X-axis display. */
	displayDate: string;
	/** Localized formatted hour string (e.g., "5 PM") for tooltip display. */
	hour: string;
	/** The application version for this data point. */
	appVersion?: string;

	// Known overall computed fields (typed explicitly for safety)
	/** Weighted overall p50 score (0-100). */
	overall_p50?: number;
	/** Weighted overall p75 score (0-100). */
	overall_p75?: number;
	/** Weighted overall p90 score (0-100). */
	overall_p90?: number;
	/** SMA-smoothed overall p75 score for trend line. */
	overall_score_p75_sma?: number;
	/** Overall score range [p90, p50] for bar chart visualization. */
	overall_score_range?: [number, number];
	/** SMA-smoothed overall deficit (100 - score) for inverted chart. */
	overall_deficit_p75_sma?: number;

	/**
	 * Dynamic per-metric values or ranges.
	 * Metrics are stored as numbers (e.g., `1250`).
	 * Ranges for bar charts are `[p50, p90]`.
	 */
	[metricName: string]: string | number | [number, number] | undefined;
}
