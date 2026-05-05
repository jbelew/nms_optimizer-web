import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import { ChartDataPoint } from "./PerformanceTypes";

/**
 * Formats a metric value for display, handling metric-specific scaling (like CLS).
 *
 * @remarks
 * This utility ensures that Core Web Vitals are displayed in their standard units.
 * For CLS, values are scaled from thousands (raw telemetry) to the 0.00-1.00 range.
 * All other metrics are rounded to the nearest integer.
 *
 * @param {string} metric - The name of the metric (e.g., `LCP`, `CLS`).
 * @param {number} value - The raw numeric value from telemetry.
 * @param {boolean} [includeUnit=true] - Whether to include the unit suffix (e.g., "ms").
 *
 * @returns {string} The formatted string suitable for UI display.
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
	LCP: 8000,
	FCP: 4000,
	INP: 1000,
	TTFB: 2500,
	CLS: 1000,
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
	/** Standard height for performance charts across the dashboard. */
	CHART_HEIGHT: 260,
	/** Standard bottom margin for performance charts. */
	CHART_MARGIN_BOTTOM: 0,
	/** Approximate height of the summary cards row. */
	SUMMARY_CARDS_HEIGHT: 72,
	/** Gap between the summary cards and the range selector row. */
	CARDS_TO_RANGE_GAP: 12,
	/** Height of the range selector row. */
	RANGE_HEIGHT: 24,
	/** Gap between the range selector and the chart. */
	RANGE_TO_CHART_GAP: 0,
	/** Approximate height of the description text + its margin. */
	DESCRIPTION_AREA_HEIGHT: 60,
	/** Vertical padding applied to the content container. */
	CONTAINER_PADDING_Y: 0,
	/** Approximate height of the dialog footer (Close button area). */
	FOOTER_HEIGHT: 52,
	/** Maximum number of data points rendered on the chart X-axis. */
	MAX_CHART_POINTS: 73,
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
	padding: "8px",
	borderRadius: "8px",
	color: "var(--gray-12)",
	fontSize: "12px",
	fontWeight: 500,
	boxShadow: "var(--shadow-3)",
};

/**
 * Total height of the performance content (including description, cards, and chart).
 * Used for the top-level dialog skeleton to prevent CLS.
 * @category Constants
 */
export const FULL_DASHBOARD_HEIGHT =
	PERFORMANCE_LAYOUT.CONTAINER_PADDING_Y +
	PERFORMANCE_LAYOUT.DESCRIPTION_AREA_HEIGHT +
	PERFORMANCE_LAYOUT.SUMMARY_CARDS_HEIGHT +
	PERFORMANCE_LAYOUT.CARDS_TO_RANGE_GAP +
	PERFORMANCE_LAYOUT.RANGE_HEIGHT +
	PERFORMANCE_LAYOUT.RANGE_TO_CHART_GAP +
	PERFORMANCE_LAYOUT.CHART_HEIGHT +
	PERFORMANCE_LAYOUT.CHART_MARGIN_BOTTOM;

/**
 * Maps Core Web Vital metric names to Radix UI color names.
 * @internal
 */
const METRIC_COLOR_MAP: Record<string, string> = {
	TTFB: "cyan",
	FCP: "purple",
	LCP: "red",
	CLS: "orange",
	INP: "amber",
	OVERALL: "green",
};

/**
 * Returns a consistent color for a given performance metric.
 *
 * @remarks
 * Maps Core Web Vital metric names to Radix UI color tokens.
 *
 * @param {string} name - The name of the performance metric (e.g., `LCP`).
 * @param {number | string} [weight=10] - The Radix color weight or alpha token (e.g., 11, "a3").
 *
 * @returns {string} A CSS variable reference to the Radix color.
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
 * @param {string} metric - The name of the metric (e.g., `LCP`, `FCP`).
 * @param {number | undefined | null} value - The actual metric value.
 *
 * @returns {string} A CSS variable reference to a green, amber, or red color.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const color = getStatusColor("LCP", 1200);
 * // returns "var(--green-11)"
 * ```
 */
export const getStatusColor = (metric: string, value: number | undefined | null): string => {
	if (value === undefined || value === null) return "var(--gray-11)";

	const config = LIGHTHOUSE_CONFIG[metric];
	if (!config) return "var(--gray-11)";

	if (value <= config.p90) return "var(--green-11)";
	if (value <= config.p50) return "var(--amber-11)";

	return "var(--red-11)";
};

/**
 * Calculates a Lighthouse-style score (0-100) using a log-normal distribution.
 *
 * @remarks
 * Approximates the Lighthouse v10 scoring curve using a log-normal CDF with
 * a Horner-form erf polynomial. The `p90` and `p50` parameters are
 * distribution control points that anchor the curve shape; they do **not**
 * produce output scores of exactly 90 or 50. At the `p90` control point the
 * erf approximation yields ~82, and at `p50` it yields exactly 50.
 *
 * @param {number} value - The actual metric value (e.g., milliseconds for LCP).
 * @param {number} p90 - The "Good" threshold control point for the log-normal curve.
 * @param {number} p50 - The median control point for the log-normal curve.
 *
 * @returns {number} An integer score between 0 and 100.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * computeLogNormalScore(2500, 2500, 4000); // ~82
 * computeLogNormalScore(4000, 2500, 4000); // 50
 * ```
 */
export const computeLogNormalScore = (value: number, p90: number, p50: number): number => {
	if (value <= 0) return 100;

	const logValue = Math.log(value);
	const logP50 = Math.log(p50);
	const logP90 = Math.log(p90);

	const sigma = (logP50 - logP90) / 0.90619;
	const z = (logP50 - logValue) / (Math.sqrt(2) * sigma);

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
export const LIGHTHOUSE_CONFIG: Record<string, { weight: number; p90: number; p50: number }> = {
	LCP: { weight: 0.3, p90: 2500, p50: 4000 },
	INP: { weight: 0.3, p90: 200, p50: 500 },
	CLS: { weight: 0.25, p90: 100, p50: 250 },
	FCP: { weight: 0.1, p90: 1800, p50: 3000 },
	TTFB: { weight: 0.05, p90: 800, p50: 1800 },
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
 * @param {string} locale - The user locale (e.g., `en-US`).
 * @param {Intl.DateTimeFormatOptions} options - Standard Intl formatting options.
 *
 * @returns {Intl.DateTimeFormat} A cached or new formatter instance.
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
	options: Intl.DateTimeFormatOptions
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
 * @param {(number | undefined)[]} data - The sequence of numeric values.
 * @param {number} period - The window size (e.g., 5).
 * @param {boolean} [anchorEnd=false] - Whether to force the last point to match the raw data.
 *
 * @returns {(number | undefined)[]} The smoothed timeseries.
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
	anchorEnd = false
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
 * This function performs several data preparation steps:
 * 1. Groups metrics by timestamp.
 * 2. Filters out irrelevant metrics like `TBT`.
 * 3. Formats timestamps into human-readable strings.
 * 4. Sub-samples data if it exceeds `maxPoints`.
 * 5. Calculates 3-point SMAs for all active metrics.
 *
 * @param {PerformanceMetric[]} raw - The raw array of metric records from the API.
 * @param {string} locale - The user locale for date formatting.
 * @param {number} maxPoints - Maximum number of points (e.g., 168 for 7 days or 72 for 3 days).
 * @param {number} [smaPeriod=3] - The window size for SMA smoothing.
 *
 * @returns {{ chartData: ChartDataPoint[]; summary: RawPerformanceSummary | null; uniqueMetrics: string[] }} Transformed data, decoupled summary, and active metric names.
 *
 * @see {@link ChartDataPoint}
 * @see {@link calculateSMA}
 * @see {@link getPerformanceSummary}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const { chartData, summary, uniqueMetrics } = transformPerformanceData(raw, "en-US", 48);
 * ```
 */
export const transformPerformanceData = (
	raw: PerformanceMetric[],
	locale: string,
	maxPoints: number,
	smaPeriod = 3,
	rangeDays?: number
): {
	chartData: ChartDataPoint[];
	summary: RawPerformanceSummary | null;
	uniqueMetrics: string[];
} => {
	if (!raw || !Array.isArray(raw)) {
		return { chartData: [], summary: null, uniqueMetrics: [] };
	}

	const dateMap: Record<number, ChartDataPoint> = {};
	const metrics = new Set<string>();

	const dateFormatter = getFormatter(locale, {
		month: "numeric",
		day: "numeric",
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
				timestamp: item.timestamp,
				displayDate: formattedDate,
				hour: formattedHour,
				appVersion: item.app_version,
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
					timestamp: t,
					displayDate: dateFormatter.format(dateObj),
					hour: hourFormatter.format(dateObj),
					appVersion: undefined,
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

		const config = LIGHTHOUSE_CONFIG[m];

		fullChartData.forEach((p, i) => {
			p[`${m}_p75_sma`] = p75SmaValues[i];

			if (config && p[`${m}_p75`] !== undefined) {
				const score = computeLogNormalScore(
					p[`${m}_p75`] as number,
					config.p90,
					config.p50
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

	// Calculate overall weighted scores for the "Ceiling" view (100 is best, at top)
	fullChartData.forEach((p) => {
		let totalP50 = 0,
			totalP75 = 0,
			totalP90 = 0,
			totalWeight = 0;

		METRIC_DISPLAY_ORDER.forEach((m) => {
			const config = LIGHTHOUSE_CONFIG[m];
			if (!config) return;

			const p50 = (p[`${m}_p50`] ?? p[`${m}_original`]) as number | undefined;
			const p75 = (p[`${m}_p75`] ?? p[`${m}_original`]) as number | undefined;
			const p90 = (p[`${m}_p90`] ?? p[`${m}_original`]) as number | undefined;

			if (p75 !== undefined) {
				totalWeight += config.weight;

				const s50 = computeLogNormalScore(p50 ?? p75, config.p90, config.p50);
				const s75 = computeLogNormalScore(p75, config.p90, config.p50);
				const s90 = computeLogNormalScore(p90 ?? p75, config.p90, config.p50);

				totalP50 += s50 * config.weight;
				totalP75 += s75 * config.weight;
				totalP90 += s90 * config.weight;
			}
		});

		if (totalWeight > 0) {
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

	fullChartData.forEach((p, i) => {
		const score = overallP75SmaValues[i];
		p.overall_score_p75_sma = score;
		// Add deficit for unified chart plotting (0 is perfect)
		p.overall_deficit_p75_sma = score !== undefined ? 100 - score : undefined;
	});

	// Extract high-resolution summary from the ABSOLUTE full dataset.
	const summary = getPerformanceSummary(fullChartData);

	// Slice the full dataset down to the user's requested range for the chart view.
	let slicedData = fullChartData;

	if (rangeDays !== undefined && rangeDays > 0 && fullChartData.length > 0) {
		const latestTs = fullChartData[fullChartData.length - 1].timestamp;
		const startTs = latestTs - rangeDays * 24 * 3600000;
		slicedData = fullChartData.filter((p) => p.timestamp >= startTs);
	}

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
						timestamp: ts,
						displayDate: "", // Empty so they don't show on X-axis
						hour: "",
						appVersion: "",
					});
				}

				chartData = [...padding, ...slicedData];
			}
		}
	}

	// Create a virtual "LIVE" version for the final plot point.
	// This forces the version grouping logic below to treat the current live value
	// as its own segment, creating a sloping connection from the current version's
	// period average to the latest telemetry.
	if (chartData.length > 0) {
		const lastPoint = chartData[chartData.length - 1];

		if (lastPoint.displayDate) {
			lastPoint.originalVersion = lastPoint.appVersion;
			lastPoint.appVersion = "LIVE";
		}
	}

	// Compute per-version averages for version-to-version trend lines.
	// Groups data points by appVersion, computes the mean p75 for each metric
	// and the mean overall score, then stamps every point with the average
	// for its version segment.
	const versionSegments: Map<string, number[]> = new Map();
	chartData.forEach((p, i) => {
		const v = p.appVersion || "__unknown__";
		if (!versionSegments.has(v)) versionSegments.set(v, []);
		versionSegments.get(v)!.push(i);
	});

	const allSegments = Array.from(versionSegments.values());

	allSegments.forEach((indices) => {
		const startIdx = indices[0];

		// Per-metric version averages
		metrics.forEach((m) => {
			let sum = 0;
			let count = 0;

			for (const i of indices) {
				const val = chartData[i][`${m}_p75`] as number | undefined;

				if (val !== undefined) {
					sum += val;
					count++;
				}
			}

			const avg = count > 0 ? sum / count : undefined;

			chartData[startIdx][`${m}_version_avg`] = avg;
		});

		let overallSum = 0;
		let overallCount = 0;

		for (const i of indices) {
			const val = chartData[i].overall_p75 as number | undefined;

			if (val !== undefined) {
				overallSum += val;
				overallCount++;
			}
		}

		const overallAvg = overallCount > 0 ? overallSum / overallCount : undefined;

		chartData[startIdx].overall_version_avg = overallAvg;
	});

	return { chartData, summary, uniqueMetrics: Array.from(metrics) };
};

/**
 * Calculates a complete, range-independent performance summary from transformed chart data.
 *
 * @remarks
 * This function extracts the most recent point's smoothed values and compares them
 * to the previous point's data to determine trends. By using the transformed data,
 * it ensures that summary cards and trend arrows stay synchronized with the visual chart.
 *
 * @param {ChartDataPoint[]} chartData - The transformed performance data used for the chart.
 *
 * @returns {RawPerformanceSummary | null} Summary data for cards and arrows.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const summary = getPerformanceSummary(chartData);
 * ```
 */
export const getPerformanceSummary = (
	chartData: ChartDataPoint[]
): RawPerformanceSummary | null => {
	if (!chartData || chartData.length === 0) return null;

	const latest = chartData[chartData.length - 1];

	const summary: RawPerformanceSummary = {
		timestamp: latest.timestamp,
		metrics: {},
		trends: {},
	};

	// Helper to find the most recent preceding point with valid data
	const findPreviousValidPoint = (checkFn: (p: ChartDataPoint) => boolean) => {
		for (let i = chartData.length - 2; i >= 0; i--) {
			if (checkFn(chartData[i])) return chartData[i];
		}

		return null;
	};

	// 1. Overall Metric and Trend (using SMA smoothed values)
	const previousOverall = findPreviousValidPoint((p) => p.overall_p75 !== undefined);

	const latestScore = latest.overall_score_p75_sma ?? latest.overall_p75 ?? 0;
	const previousScore =
		previousOverall?.overall_score_p75_sma ?? previousOverall?.overall_p75 ?? 0;

	summary.metrics.OVERALL = {
		value: latest.overall_p75 || 0,
		score: latest.overall_p75 || 0,
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

	// 2. Individual Metrics
	METRIC_DISPLAY_ORDER.forEach((m) => {
		const val1 = latest[`${m}_p75`] as number | undefined;
		const sma1 = latest[`${m}_p75_sma`] as number | undefined;

		const previousMetric = findPreviousValidPoint((p) => p[`${m}_p75`] !== undefined);

		const val2 = previousMetric
			? (previousMetric[`${m}_p75`] as number | undefined)
			: undefined;
		const sma2 = previousMetric
			? (previousMetric[`${m}_p75_sma`] as number | undefined)
			: undefined;

		if (val1 !== undefined) {
			const config = LIGHTHOUSE_CONFIG[m];
			summary.metrics[m] = {
				value: val1,
				score: computeLogNormalScore(val1, config.p90, config.p50),
			};

			if (val2 !== undefined && sma1 !== undefined && sma2 !== undefined) {
				const sDiff = sma1 - sma2;
				const threshold = Math.max(sma2 * 0.01, m === "CLS" ? 0.005 : 1);

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
 * Interface for the stable raw performance summary.
 */
export interface RawPerformanceSummary {
	timestamp: number;
	metrics: Record<string, { value: number; score: number }>;
	trends: Record<string, "improvement" | "regression" | "neutral">;
}

/**
 * Identifies version change points in the timeseries for reference markers.
 *
 * @remarks
 * This utility helps visualize performance trends across application releases.
 * It enforces a minimum gap between markers to prevent overlapping labels.
 *
 * @param {ChartDataPoint[]} chartData - The transformed timeseries data.
 *
 * @returns {{ timestamp: number; version: string }[]} A list of version change events.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const changes = getVersionChanges(chartData);
 * ```
 */
export const getVersionChanges = (
	chartData: ChartDataPoint[]
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
