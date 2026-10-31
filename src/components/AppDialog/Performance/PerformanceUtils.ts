import type React from "react";

/**
 * Represents a single point in the timeseries chart.
 *
 * @remarks
 * Defines the data structure expected by Recharts components, containing standard
 * metadata (timestamp, version) and dynamic metric keys corresponding to CWV names.
 *
 * @category Interfaces
 */
export interface ChartDataPoint {
	/**
	 * Dynamic per-metric values or ranges.
	 * Metrics are stored as numbers (e.g., `1250`).
	 * Ranges for bar charts are `[p50, p90]`.
	 */
	[metricName: string]: [number, number] | number | string | undefined;
	/** The application version for this data point. */
	appVersion?: string;
	/** Localized formatted MM/DD string for X-axis display. */
	displayDate: string;
	/** Localized formatted hour string (e.g., "5 PM") for tooltip display. */
	hour: string;
	/** Original application version preserved when the final point is tagged `"LIVE"`. */
	originalVersion?: string;
	/** SMA-smoothed overall deficit (100 - score) for inverted chart. */
	overall_deficit_p75_sma?: number;
	/** Weighted overall p50 score (0-100). */
	overall_p50?: number;
	/** Weighted overall p75 score (0-100). */
	overall_p75?: number;
	/** Weighted overall p90 score (0-100). */
	overall_p90?: number;
	/** SMA-smoothed overall p75 score for trend line. */
	overall_score_p75_sma?: number;
	/** Unanchored SMA-smoothed overall p75 score for symmetric trend comparison. */
	overall_score_p75_trend_sma?: number;
	/** Overall score range [p90, p50] for bar chart visualization. */
	overall_score_range?: [number, number];
	/** Contiguous version-segment mean overall p75 score stamped on each segment start point. */
	overall_version_avg?: number;
	/** Unix timestamp in milliseconds for consistent sorting. */
	timestamp: number;
}

/**
 * Represents a single performance metric aggregate record.
 *
 * @remarks
 * Captures p50, p75, and p90 values for Core Web Vitals and other performance indicators
 * consumed by the performance dashboard.
 *
 * @category Types
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

/**
 * Supported lookback window lengths (in days) for the performance dashboard.
 *
 * @category Types
 */
export type PerformanceRange = 3 | 7 | 14;

/**
 * Formats a metric value for display, handling metric-specific scaling (like CLS).
 *
 * @remarks
 * This utility ensures that Core Web Vitals are displayed in their standard units.
 * For CLS, values are scaled from thousands (raw telemetry) to the 0.00-1.00 range.
 * All other metrics are rounded to the nearest integer.
 *
 * @param metric - The name of the metric (e.g., `LCP`, `CLS`).
 * @param value - The raw numeric value from telemetry.
 * @param [includeUnit=true] - Whether to include the unit suffix (e.g., "ms").
 *
 * @returns The formatted string suitable for UI display.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const formatted = formatMetricValue("LCP", 1250);
 * // returns "1250ms"
 *
 * const cls = formatMetricValue("CLS", 125);
 * // returns "0.13"
 * ```
 */
export const formatMetricValue = (metric: string, value: number, includeUnit = true): string => {
	if (metric === "CLS") {
		return (value / 1000).toFixed(2);
	}

	const rounded = Math.round(value);

	return includeUnit ? `${rounded}ms` : `${rounded}`;
};

/**
 * Logical thresholds for performance metrics to keep chart resolution readable.
 *
 * @remarks
 * These values define the maximum Y-axis domain for individual metric charts
 * to prevent outliers from squashing the visual range of typical data points.
 *
 * @category Constants
 */
export const METRIC_THRESHOLDS: Record<string, number> = {
	CLS: 1000,
	FCP: 4000,
	INP: 1000,
	LCP: 8000,
	TTFB: 2500,
};

/**
 * Authority for performance dashboard dimensions and spacing.
 *
 * @remarks
 * Centralizing these values ensures that the loading skeletons perfectly match
 * the rendered charts, preventing layout shift (CLS).
 *
 * @category Constants
 */
export const PERFORMANCE_LAYOUT = {
	/** Gap between the summary cards and the range selector row. */
	CARDS_TO_RANGE_GAP: 12,
	/** Standard height for performance charts across the dashboard. */
	CHART_HEIGHT: 260,
	/** Standard bottom margin for performance charts. */
	CHART_MARGIN_BOTTOM: 0,
	/** Vertical padding applied to the content container. */
	CONTAINER_PADDING_Y: 0,
	/** Approximate height of the description text + its margin. */
	DESCRIPTION_AREA_HEIGHT: 60,
	/** Approximate height of the dialog footer (Close button area). */
	FOOTER_HEIGHT: 52,
	/** Maximum number of data points rendered on the chart X-axis. */
	MAX_CHART_POINTS: 73,
	/** Height of the range selector row. */
	RANGE_HEIGHT: 24,
	/** Gap between the range selector and the chart. */
	RANGE_TO_CHART_GAP: 0,
	/** Approximate height of the summary cards row. */
	SUMMARY_CARDS_HEIGHT: 72,
} as const;

/**
 * Standard display order for performance metrics across the dashboard.
 * @category Constants
 */
export const METRIC_DISPLAY_ORDER = ["TTFB", "FCP", "LCP", "CLS", "INP"];

/**
 * Standard styling for chart tooltips to ensure visual consistency.
 * @category Constants
 */
export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
	backgroundColor: "var(--gray-3)",
	border: "1px solid var(--gray-6)",
	borderRadius: "8px",
	boxShadow: "var(--shadow-3)",
	color: "var(--gray-12)",
	fontSize: "12px",
	fontWeight: 500,
	padding: "8px",
};

/**
 * Total height of the performance content (including description, cards, and chart).
 * Used for the top-level dialog skeleton to prevent CLS.
 * @category Constants
 */
export const FULL_DASHBOARD_HEIGHT =
	PERFORMANCE_LAYOUT.CONTAINER_PADDING_Y
	+ PERFORMANCE_LAYOUT.DESCRIPTION_AREA_HEIGHT
	+ PERFORMANCE_LAYOUT.SUMMARY_CARDS_HEIGHT
	+ PERFORMANCE_LAYOUT.CARDS_TO_RANGE_GAP
	+ PERFORMANCE_LAYOUT.RANGE_HEIGHT
	+ PERFORMANCE_LAYOUT.RANGE_TO_CHART_GAP
	+ PERFORMANCE_LAYOUT.CHART_HEIGHT
	+ PERFORMANCE_LAYOUT.CHART_MARGIN_BOTTOM;

/**
 * Maps Core Web Vital metric names to Radix UI color names.
 * @internal
 */
const METRIC_COLOR_MAP: Record<string, string> = {
	CLS: "orange",
	FCP: "purple",
	INP: "amber",
	LCP: "red",
	OVERALL: "green",
	TTFB: "cyan",
};

/**
 * Returns a consistent color for a given performance metric.
 *
 * @remarks
 * Maps Core Web Vital metric names to Radix UI color tokens.
 *
 * @param name - The name of the performance metric (e.g., `LCP`).
 * @param [weight=10] - The Radix color weight or alpha token (e.g., 11, "a3").
 *
 * @returns A CSS variable reference to the Radix color.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const color = getMetricColor("LCP", "a3");
 * // returns "var(--red-a3)"
 * ```
 */
export const getMetricColor = (name: string, weight: number | string = 10): string => {
	const base = METRIC_COLOR_MAP[name] ?? "accent";

	return `var(--${base}-${weight})`;
};

/**
 * Calculates a Lighthouse-style status color based on thresholds.
 *
 * @remarks
 * Uses standard "Good", "Needs Improvement", and "Poor" ranges for each CWV metric.
 *
 * @param metric - The name of the metric (e.g., `LCP`, `FCP`).
 * @param value - The actual metric value.
 *
 * @returns A CSS variable reference to a green, amber, or red color.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const color = getStatusColor("LCP", 1200);
 * // returns "var(--green-11)"
 * ```
 */
export const getStatusColor = (metric: string, value: null | number | undefined): string => {
	if (value === undefined || value === null) return "var(--gray-11)";

	const config = LIGHTHOUSE_CONFIG[metric];
	if (!config) return "var(--gray-11)";

	if (value <= config.p90) return "var(--green-11)";
	if (value <= config.p50) return "var(--amber-11)";

	return "var(--red-11)";
};

/**
 * Calculates a Lighthouse v10+ performance score (0–100) using a log-normal survival curve.
 *
 * @remarks
 * Evaluates the complementary log-normal cumulative distribution function via a Horner-form
 * error function (`erf`) polynomial approximation. Because `0.9061938024368232` equals
 * `erf^-1(0.80) = Phi^-1(0.90) / sqrt(2)`, `standardizedSigma` already incorporates `sqrt(2)`,
 * anchoring the curve so `value === p90` yields `90` and `value === p50` yields `50`.
 *
 * @param value - The measured metric value (e.g., milliseconds for `LCP`, or thousandths for `CLS`).
 * @param p90 - The "Good" threshold control point corresponding to a score of `90`.
 * @param p50 - The median control point corresponding to a score of `50`.
 *
 * @returns An integer Lighthouse score between `0` and `100`.
 *
 * @see {@link LIGHTHOUSE_CONFIG}
 * @see {@link ./PerformanceUtils.test.ts Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * computeLogNormalScore(2500, 2500, 4000); // returns 90
 * computeLogNormalScore(4000, 2500, 4000); // returns 50
 * ```
 */
export const computeLogNormalScore = (value: number, p90: number, p50: number): number => {
	if (value <= 0) return 100;

	const logValue = Math.log(value);
	const logP50 = Math.log(p50);
	const logP90 = Math.log(p90);

	const standardizedSigma = (logP50 - logP90) / 0.9061938024368232;
	const z = (logP50 - logValue) / standardizedSigma;

	const erf = (x: number) => {
		const a1 = 0.254829592,
			a2 = -0.284496736,
			a3 = 1.421413741,
			a4 = -1.453152027,
			a5 = 1.061405429,
			p = 0.3275911;
		const sign = x < 0 ? -1 : 1;
		const absX = Math.abs(x);
		const t = 1.0 / (1.0 + p * absX);
		const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

		return sign * y;
	};

	return Math.round(0.5 * (1 + erf(z)) * 100);
};

/**
 * Control points for the log-normal scoring distribution.
 *
 * @remarks
 * Values align with Lighthouse v10+ performance scoring for field data.
 * CLS uses raw milliseconds in our telemetry.
 *
 * @category Constants
 */
export const LIGHTHOUSE_CONFIG: Record<string, { p50: number; p90: number; weight: number }> = {
	CLS: { p50: 250, p90: 100, weight: 0.25 },
	FCP: { p50: 3000, p90: 1800, weight: 0.1 },
	INP: { p50: 500, p90: 200, weight: 0.3 },
	LCP: { p50: 4000, p90: 2500, weight: 0.3 },
	TTFB: { p50: 1800, p90: 800, weight: 0.05 },
};

/**
 * Cache for Intl.DateTimeFormat objects to avoid expensive constructor calls.
 * @internal
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Retrieves a memoized Intl.DateTimeFormat instance.
 *
 * @remarks
 * This utility optimizes performance by caching formatters by locale and options.
 *
 * @param locale - The user locale (e.g., `en-US`).
 * @param options - Standard Intl formatting options.
 *
 * @returns A cached or new formatter instance.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const formatter = getFormatter("en-US", { month: "numeric" });
 * ```
 */
export const getFormatter = (
	locale: string,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
	const key = `${locale}-${JSON.stringify(options)}`;

	if (!formatterCache.has(key)) {
		formatterCache.set(key, new Intl.DateTimeFormat(locale, options));
	}

	return formatterCache.get(key)!;
};

/**
 * Calculates a Simple Moving Average (SMA) for a timeseries.
 *
 * @remarks
 * This utility computes the average of the current point and the N-1 preceding points.
 * If a window contains `undefined` values, it averages the remaining valid numeric points.
 * If `anchorEnd` is true, the very last point in the returned array will exactly
 * match the last valid numeric point in the input data, ensuring trend lines
 * "land" on the current raw value shown in summary cards.
 *
 * @param data - The sequence of numeric values.
 * @param period - The window size (e.g., 5).
 * @param [anchorEnd=false] - Whether to force the last point to match the raw data.
 *
 * @returns The smoothed timeseries.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const sma = calculateSMA([10, 20, 30, 40], 2);
 * // returns [10, 15, 25, 35]
 *
 * const anchored = calculateSMA([10, 20, 30, 40], 3, true);
 * // returns [10, 15, 20, 40]
 * ```
 */
export const calculateSMA = (
	data: (number | undefined)[],
	period: number,
	anchorEnd = false,
): (number | undefined)[] => {
	const sma = data.map((_, index) => {
		const start = Math.max(0, index - period + 1);
		const window = data.slice(start, index + 1);
		const validValues = window.filter((v): v is number => v !== undefined);

		if (validValues.length === 0) return undefined;

		const sum = validValues.reduce((acc, val) => acc + val, 0);

		return sum / validValues.length;
	});

	if (anchorEnd && data.length > 0) {
		const lastValidIndex = data.length - 1;

		if (data[lastValidIndex] !== undefined) {
			sma[lastValidIndex] = data[lastValidIndex];
		}
	}

	return sma;
};

/**
 * Transforms flat API records into a timestamp-keyed structure for Recharts.
 *
 * @remarks
 * Performs the full dashboard timeseries pipeline:
 * 1. Groups hourly metrics by timestamp and filters out legacy `TBT` entries.
 * 2. Inserts `undefined` gap points for empty hours while carrying forward prior valid
 *    metric readings into active-hour `overall_p50`, `overall_p75`, and `overall_p90` scores.
 * 3. Computes anchored SMAs for visual trend lines and unanchored SMAs for symmetric trend comparison.
 * 4. Computes contiguous unsampled `appVersion` segment averages (including the terminal `"LIVE"` segment)
 *    before sub-sampling or padding to `maxPoints`.
 *
 * @param raw - The raw array of metric records from the API.
 * @param locale - The user locale for date formatting.
 * @param maxPoints - Maximum number of points rendered on the X-axis.
 * @param [smaPeriod=3] - The window size for SMA smoothing.
 * @param [rangeDays] - Optional lookback range in days used to slice the chart view.
 *
 * @returns Transformed chart points, range-independent summary, and active metric names.
 *
 * @see {@link ChartDataPoint}
 * @see {@link RawPerformanceSummary}
 * @see {@link calculateSMA}
 * @see {@link getPerformanceSummary}
 * @see {@link ./PerformanceUtils.test.ts Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const result = transformPerformanceData(raw, "en-US", 73, 3, 3);
 * // returns { chartData: [...], summary: { ... }, uniqueMetrics: ["LCP"] }
 * ```
 */
export const transformPerformanceData = (
	raw: PerformanceMetric[],
	locale: string,
	maxPoints: number,
	smaPeriod = 3,
	rangeDays?: number,
): {
	chartData: ChartDataPoint[];
	summary: null | RawPerformanceSummary;
	uniqueMetrics: string[];
} => {
	if (!raw || !Array.isArray(raw)) {
		return { chartData: [], summary: null, uniqueMetrics: [] };
	}

	const dateMap: Record<number, ChartDataPoint> = {};
	const metrics = new Set<string>();

	const dateFormatter = getFormatter(locale, {
		day: "numeric",
		month: "numeric",
	});
	const hourFormatter = getFormatter(locale, {
		hour: "numeric",
		minute: "numeric",
	});

	raw.forEach((item) => {
		if (item.metric_name === "TBT") return;

		const dateObj = new Date(item.timestamp);
		const formattedDate = dateFormatter.format(dateObj);
		const formattedHour = hourFormatter.format(dateObj);

		if (!dateMap[item.timestamp]) {
			dateMap[item.timestamp] = {
				appVersion: item.app_version,
				displayDate: formattedDate,
				hour: formattedHour,
				timestamp: item.timestamp,
			};
		}

		dateMap[item.timestamp][item.metric_name] = item.average_value;
		if (item.p50 !== undefined) dateMap[item.timestamp][`${item.metric_name}_p50`] = item.p50;
		if (item.p75 !== undefined) dateMap[item.timestamp][`${item.metric_name}_p75`] = item.p75;
		if (item.p90 !== undefined) dateMap[item.timestamp][`${item.metric_name}_p90`] = item.p90;

		if (item.p50 !== undefined && item.p90 !== undefined) {
			dateMap[item.timestamp][`${item.metric_name}_range`] = [item.p50, item.p90];
		}

		metrics.add(item.metric_name);
	});

	const sortedTimestamps = Object.keys(dateMap)
		.map(Number)
		.sort((a, b) => a - b);

	const fullChartData: ChartDataPoint[] = [];

	if (sortedTimestamps.length > 0) {
		const latestDataTs = sortedTimestamps[sortedTimestamps.length - 1];
		const latestHour = new Date(latestDataTs);
		latestHour.setMinutes(0, 0, 0);
		latestHour.setSeconds(0, 0);
		const endTime = latestHour.getTime();

		// Calculate the absolute start time based on the entire dataset available in raw,
		// but at minimum ensure it covers the requested rangeDays if specified.
		const earliestDataTs = sortedTimestamps[0];
		const rangeStartTs =
			rangeDays !== undefined && rangeDays > 0 ? endTime - rangeDays * 24 * 3600000 : endTime;
		const startTime = Math.min(earliestDataTs, rangeStartTs);

		const oneHour = 3600000;

		for (let t = startTime; t <= endTime; t += oneHour) {
			if (dateMap[t]) {
				const point = { ...dateMap[t] };
				metrics.forEach((m) => {
					if (point[m] !== undefined) {
						point[`${m}_original`] = point[m] as number;
					}

					[`${m}_p50`, `${m}_p75`, `${m}_p90`, `${m}_range`].forEach((pKey) => {
						if (point[pKey] === undefined) point[pKey] = undefined;
					});
				});
				fullChartData.push(point);
			} else {
				// Gap filling: insert a null point for the missing hour
				const dateObj = new Date(t);
				const nullPoint: ChartDataPoint = {
					appVersion: undefined,
					displayDate: dateFormatter.format(dateObj),
					hour: hourFormatter.format(dateObj),
					timestamp: t,
				};
				metrics.forEach((m) => {
					nullPoint[m] = undefined;
					nullPoint[`${m}_original`] = undefined;
					[`${m}_p50`, `${m}_p75`, `${m}_p90`, `${m}_range`].forEach((pKey) => {
						nullPoint[pKey] = undefined;
					});
				});
				fullChartData.push(nullPoint);
			}
		}
	}

	// Calculate SMA and overall scores on the ABSOLUTE FULL unsampled dataset
	// to ensure summary cards reflect the absolute last hour and trend
	// vs. the prior hour, independent of chart sub-sampling or user range selection.
	metrics.forEach((m) => {
		const p75Values = fullChartData.map((p) => p[`${m}_p75`] as number | undefined);
		const p75SmaValues = calculateSMA(p75Values, smaPeriod, true);
		const p75TrendSmaValues = calculateSMA(p75Values, smaPeriod, false);

		const config = LIGHTHOUSE_CONFIG[m];

		fullChartData.forEach((p, i) => {
			p[`${m}_p75_sma`] = p75SmaValues[i];
			p[`${m}_p75_trend_sma`] = p75TrendSmaValues[i];

			if (config && p[`${m}_p75`] !== undefined) {
				const score = computeLogNormalScore(
					p[`${m}_p75`] as number,
					config.p90,
					config.p50,
				);
				// Individual metrics use DEFICIT (0 is best, at bottom)
				p[`${m}_deficit`] = 100 - score;
			}
		});

		const deficitValues = fullChartData.map((p) => p[`${m}_deficit`] as number | undefined);
		const deficitSmaValues = calculateSMA(deficitValues, smaPeriod, true);

		fullChartData.forEach((p, i) => {
			p[`${m}_deficit_sma`] = deficitSmaValues[i];
		});
	});

	// Calculate overall weighted scores for the "Ceiling" view (100 is best, at top).
	// On active (non-gap) hours where at least one metric was reported in `raw`, carry
	// forward the most recent prior valid hourly reading for any missing metric so
	// `totalWeight` remains stable across partial-metric hours while leaving empty
	// gap-filled hours `undefined`.
	const lastValidByMetric: Record<string, { p50: number; p75: number; p90: number }> = {};

	fullChartData.forEach((p) => {
		const isActiveHour = dateMap[p.timestamp] !== undefined;

		let totalP50 = 0,
			totalP75 = 0,
			totalP90 = 0,
			totalWeight = 0;

		METRIC_DISPLAY_ORDER.forEach((m) => {
			const config = LIGHTHOUSE_CONFIG[m];
			if (!config) return;

			const directP50 = (p[`${m}_p50`] ?? p[`${m}_original`]) as number | undefined;
			const directP75 = (p[`${m}_p75`] ?? p[`${m}_original`]) as number | undefined;
			const directP90 = (p[`${m}_p90`] ?? p[`${m}_original`]) as number | undefined;

			if (directP75 !== undefined) {
				lastValidByMetric[m] = {
					p50: directP50 ?? directP75,
					p75: directP75,
					p90: directP90 ?? directP75,
				};
			}

			if (!isActiveHour) return;

			const reading = lastValidByMetric[m];

			if (reading !== undefined) {
				totalWeight += config.weight;

				const s50 = computeLogNormalScore(reading.p50, config.p90, config.p50);
				const s75 = computeLogNormalScore(reading.p75, config.p90, config.p50);
				const s90 = computeLogNormalScore(reading.p90, config.p90, config.p50);

				totalP50 += s50 * config.weight;
				totalP75 += s75 * config.weight;
				totalP90 += s90 * config.weight;
			}
		});

		if (isActiveHour && totalWeight > 0) {
			p.overall_p50 = totalP50 / totalWeight;
			p.overall_p75 = totalP75 / totalWeight;
			p.overall_p90 = totalP90 / totalWeight;
			// The overall score range for top-ceiling bars
			p.overall_score_range = [p.overall_p90, p.overall_p50];
		}
	});

	// Apply SMA to the overall p75 score trend
	const overallP75Values = fullChartData.map((p) => p.overall_p75 as number | undefined);
	const overallP75SmaValues = calculateSMA(overallP75Values, smaPeriod, true);
	const overallP75TrendSmaValues = calculateSMA(overallP75Values, smaPeriod, false);

	fullChartData.forEach((p, i) => {
		const score = overallP75SmaValues[i];
		p.overall_score_p75_sma = score;
		p.overall_score_p75_trend_sma = overallP75TrendSmaValues[i];
		// Add deficit for unified chart plotting (0 is perfect)
		p.overall_deficit_p75_sma = score !== undefined ? 100 - score : undefined;
	});

	// Extract high-resolution summary from the ABSOLUTE full dataset.
	const summary = getPerformanceSummary(fullChartData);

	// Slice the full dataset down to the user's requested range for the chart view,
	// cloning points so view-scoped tags ("LIVE", version averages) do not mutate `fullChartData`.
	let slicedData = fullChartData.map((p) => ({ ...p }));

	if (rangeDays !== undefined && rangeDays > 0 && slicedData.length > 0) {
		const latestTs = slicedData[slicedData.length - 1].timestamp;
		const startTs = latestTs - rangeDays * 24 * 3600000;
		slicedData = slicedData.filter((p) => p.timestamp >= startTs);
	}

	// Create a virtual "LIVE" version for the final plot point before computing
	// contiguous version segments so the latest reading forms its own terminal segment.
	if (slicedData.length > 0) {
		const lastPoint = slicedData[slicedData.length - 1];

		if (lastPoint.displayDate) {
			lastPoint.originalVersion = lastPoint.appVersion;
			lastPoint.appVersion = "LIVE";
		}
	}

	// Compute per-version averages across contiguous chronological runs of `appVersion`
	// on the unsampled range slice so sub-sampling does not skew segment means and
	// non-adjacent reappearances of an older version are never merged.
	const contiguousSegments: Array<{ indices: number[]; version: string }> = [];

	slicedData.forEach((p, i) => {
		if (!p.appVersion) return;

		const lastSegment = contiguousSegments[contiguousSegments.length - 1];

		if (lastSegment && lastSegment.version === p.appVersion) {
			lastSegment.indices.push(i);
		} else {
			contiguousSegments.push({ indices: [i], version: p.appVersion });
		}
	});

	contiguousSegments.forEach(({ indices }) => {
		const startIdx = indices[0];

		metrics.forEach((m) => {
			let sum = 0;
			let count = 0;

			for (const i of indices) {
				const val = slicedData[i][`${m}_p75`] as number | undefined;

				if (val !== undefined) {
					sum += val;
					count++;
				}
			}

			slicedData[startIdx][`${m}_version_avg`] = count > 0 ? sum / count : undefined;
		});

		let overallSum = 0;
		let overallCount = 0;

		for (const i of indices) {
			const val = slicedData[i].overall_p75;

			if (val !== undefined) {
				overallSum += val;
				overallCount++;
			}
		}

		slicedData[startIdx].overall_version_avg =
			overallCount > 0 ? overallSum / overallCount : undefined;
	});

	let chartData = slicedData;

	if (slicedData.length > 0) {
		const sampledIndices = new Set<number>();

		// Always include the first and last points
		sampledIndices.add(0);
		sampledIndices.add(slicedData.length - 1);

		// Always include every point where the version changes
		for (let i = 1; i < slicedData.length; i++) {
			if (slicedData[i].appVersion !== slicedData[i - 1].appVersion) {
				sampledIndices.add(i);
			}
		}

		// Linearly sample more points until we have exactly maxPoints or reach the raw length
		if (slicedData.length > maxPoints) {
			const step = (slicedData.length - 1) / (maxPoints - 1);

			for (let i = 0; i < maxPoints; i++) {
				sampledIndices.add(Math.round(i * step));
			}

			// If we still have more than maxPoints (due to version changes),
			// we must prune the non-version-change points to keep the count EXACT.
			if (sampledIndices.size > maxPoints) {
				const indices = Array.from(sampledIndices).sort((a, b) => a - b);
				const toKeep = new Set<number>();

				// Always keep first, last, and version changes
				toKeep.add(indices[0]);
				toKeep.add(indices[indices.length - 1]);

				for (let i = 1; i < slicedData.length; i++) {
					if (slicedData[i].appVersion !== slicedData[i - 1].appVersion) {
						toKeep.add(i);
					}
				}

				// Fill remaining slots from the sampled set
				for (const idx of indices) {
					if (toKeep.size >= maxPoints) break;
					toKeep.add(idx);
				}

				chartData = Array.from(toKeep)
					.sort((a, b) => a - b)
					.map((index) => slicedData[index]);
			} else {
				chartData = Array.from(sampledIndices)
					.sort((a, b) => a - b)
					.map((index) => slicedData[index]);
			}
		} else {
			// Data is shorter than maxPoints. To keep width consistent, we must pad
			// the beginning with "empty" data points so the total array length is EXACT.
			chartData = slicedData;

			const paddingCount = maxPoints - slicedData.length;

			if (paddingCount > 0) {
				const firstPoint = slicedData[0];
				const hourMs = 3600000;
				const padding: ChartDataPoint[] = [];

				for (let i = paddingCount; i > 0; i--) {
					const ts = firstPoint.timestamp - i * hourMs;
					padding.push({
						appVersion: "",
						displayDate: "", // Empty so they don't show on X-axis
						hour: "",
						timestamp: ts,
					});
				}

				chartData = [...padding, ...slicedData];
			}
		}
	}

	return { chartData, summary, uniqueMetrics: Array.from(metrics) };
};

/**
 * Calculates a complete, range-independent performance summary from transformed chart data.
 *
 * @remarks
 * Resolves `OVERALL` and each metric in `METRIC_DISPLAY_ORDER` from that metric's own most
 * recent valid hourly bucket and compares symmetric unanchored SMA windows against its
 * preceding valid bucket (using `5` thousandths = `0.005` CLS as the `CLS` noise floor).
 *
 * @param chartData - The transformed unsampled performance timeseries.
 *
 * @returns Summary data for dashboard cards and trend arrows, or `null` when `chartData` is empty.
 *
 * @see {@link ChartDataPoint}
 * @see {@link RawPerformanceSummary}
 * @see {@link ./PerformanceUtils.test.ts Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const summary = getPerformanceSummary(chartData);
 * // returns { metrics: { OVERALL: { score: 90, value: 90 } }, timestamp: 1619370000000, trends: { OVERALL: "neutral" } }
 * ```
 */
export const getPerformanceSummary = (
	chartData: ChartDataPoint[],
): null | RawPerformanceSummary => {
	if (!chartData || chartData.length === 0) return null;

	const latest = chartData[chartData.length - 1];

	const summary: RawPerformanceSummary = {
		metrics: {},
		timestamp: latest.timestamp,
		trends: {},
	};

	// Helper to find the most recent point index at or before `fromIndex` matching `checkFn`
	const findValidPointIndex = (
		fromIndex: number,
		checkFn: (p: ChartDataPoint) => boolean,
	): number => {
		for (let i = fromIndex; i >= 0; i--) {
			if (checkFn(chartData[i])) return i;
		}

		return -1;
	};

	// 1. Overall Metric and Trend (using SMA smoothed values)
	const latestOverallIdx = findValidPointIndex(
		chartData.length - 1,
		(p) => p.overall_p75 !== undefined,
	);
	const latestOverall = latestOverallIdx >= 0 ? chartData[latestOverallIdx] : latest;
	const previousOverallIdx =
		latestOverallIdx > 0 ?
			findValidPointIndex(latestOverallIdx - 1, (p) => p.overall_p75 !== undefined)
		:	-1;
	const previousOverall = previousOverallIdx >= 0 ? chartData[previousOverallIdx] : null;

	const latestScore =
		latestOverall.overall_score_p75_trend_sma
		?? latestOverall.overall_score_p75_sma
		?? latestOverall.overall_p75
		?? 0;
	const previousScore =
		previousOverall?.overall_score_p75_trend_sma
		?? previousOverall?.overall_score_p75_sma
		?? previousOverall?.overall_p75
		?? 0;

	summary.metrics.OVERALL = {
		score: latestOverall.overall_p75 ?? 0,
		value: latestOverall.overall_p75 ?? 0,
	};

	if (previousOverall) {
		const diff = latestScore - previousScore;

		if (Math.abs(diff) < 0.01) {
			summary.trends.OVERALL = "neutral";
		} else if (diff > 0) {
			summary.trends.OVERALL = "improvement";
		} else {
			summary.trends.OVERALL = "regression";
		}
	} else {
		summary.trends.OVERALL = "neutral";
	}

	// 2. Individual Metrics (resolving each metric's own latest and preceding valid buckets)
	METRIC_DISPLAY_ORDER.forEach((m) => {
		const latestMetricIdx = findValidPointIndex(
			chartData.length - 1,
			(p) => p[`${m}_p75`] !== undefined,
		);
		if (latestMetricIdx < 0) return;

		const latestMetric = chartData[latestMetricIdx];
		const previousMetricIdx =
			latestMetricIdx > 0 ?
				findValidPointIndex(latestMetricIdx - 1, (p) => p[`${m}_p75`] !== undefined)
			:	-1;
		const previousMetric = previousMetricIdx >= 0 ? chartData[previousMetricIdx] : null;

		const val1 = latestMetric[`${m}_p75`] as number | undefined;
		const sma1 = (latestMetric[`${m}_p75_trend_sma`] ?? latestMetric[`${m}_p75_sma`]) as
			number | undefined;

		const val2 =
			previousMetric ? (previousMetric[`${m}_p75`] as number | undefined) : undefined;
		const sma2 =
			previousMetric ?
				((previousMetric[`${m}_p75_trend_sma`] ?? previousMetric[`${m}_p75_sma`]) as
					number | undefined)
			:	undefined;

		if (val1 !== undefined) {
			const config = LIGHTHOUSE_CONFIG[m];
			summary.metrics[m] = {
				score: computeLogNormalScore(val1, config.p90, config.p50),
				value: val1,
			};

			if (val2 !== undefined && sma1 !== undefined && sma2 !== undefined) {
				const sDiff = sma1 - sma2;
				const threshold = Math.max(sma2 * 0.01, m === "CLS" ? 5 : 1);

				if (Math.abs(sDiff) <= threshold) {
					summary.trends[m] = "neutral";
				} else {
					summary.trends[m] = sDiff < 0 ? "improvement" : "regression";
				}
			} else {
				summary.trends[m] = "neutral";
			}
		}
	});

	return summary;
};

/**
 * Stable range-independent performance summary powering the summary cards row.
 *
 * @category Interfaces
 */
export interface RawPerformanceSummary {
	/** Latest resolved raw value and Lighthouse score (`0–100`) keyed by metric name (`OVERALL`, `LCP`, etc.). */
	metrics: Record<string, { score: number; value: number }>;
	/** Unix timestamp in milliseconds of the latest hourly bucket in the dataset. */
	timestamp: number;
	/** Symmetric SMA trend direction keyed by metric name. */
	trends: Record<string, "improvement" | "neutral" | "regression">;
}

/**
 * Identifies version change points in the timeseries for reference markers.
 *
 * @remarks
 * This utility helps visualize performance trends across application releases.
 * It enforces a minimum gap between markers to prevent overlapping labels.
 *
 * @param chartData - The transformed timeseries data.
 *
 * @returns A list of version change events.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const changes = getVersionChanges(chartData);
 * ```
 */
export const getVersionChanges = (
	chartData: ChartDataPoint[],
): { timestamp: number; version: string }[] => {
	const versionChanges: { timestamp: number; version: string }[] = [];

	if (chartData.length < 2) return [];

	let lastVersion = chartData[0].appVersion;
	let lastPushedIndex = -1;
	// Minimum gap between markers to prevent label collision.
	// 4 points is roughly enough space for a 'v1.2.3' label at 10px font.
	const minGap = 4;

	for (let i = 1; i < chartData.length; i++) {
		const point = chartData[i];

		if (point.appVersion && point.appVersion !== lastVersion) {
			// Enforce minimum gap to prevent label collision
			const sinceLastMarker = i - lastPushedIndex;

			// Skip ticks at the very start to avoid layout pressure against Y-axis.
			// Always allow the "LIVE" marker at the very end regardless of gap.
			const isLive = point.appVersion === "LIVE";

			if (!isLive && i > 3 && (lastPushedIndex === -1 || sinceLastMarker >= minGap)) {
				versionChanges.push({ timestamp: point.timestamp, version: point.appVersion });
				lastPushedIndex = i;
			}

			lastVersion = point.appVersion;
		}
	}

	return versionChanges;
};
