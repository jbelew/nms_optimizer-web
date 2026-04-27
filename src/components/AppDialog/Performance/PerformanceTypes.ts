/**
 * Represents a single point in the timeseries chart.
 *
 * @remarks
 * This interface defines the data structure expected by Recharts components.
 * It contains standard metadata (timestamp, version) and dynamic metric keys
 * that correspond to actual CWV names (e.g., `LCP`).
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
	appVersion: string;
	/**
	 * Dynamic performance metric values or ranges.
	 * Metrics are stored as numbers (e.g., `1250`).
	 * Clamped visual values use the `_clamped` suffix.
	 * Ranges for bar charts are `[p50, p90]`.
	 */
	[metricName: string]: string | number | [number, number] | undefined;
}
