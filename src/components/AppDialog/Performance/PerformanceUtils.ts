import { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";

import { ChartDataPoint } from "./PerformanceTypes";

/**
 * Formats a metric value for display, handling metric-specific scaling (like CLS).
 *
 * @param {string} metric - The name of the metric.
 * @param {number} value - The numeric value.
 * @param {boolean} [includeUnit=true] - Whether to include the unit suffix (e.g., "ms").
 *
 * @returns {string} The formatted string.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const formatted = formatMetricValue("LCP", 1250); // returns "1250ms"
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
 * Maximum number of data points to display in the performance charts.
 *
 * @remarks
 * If the number of points exceeds this value, they will be sub-sampled
 * to maintain chart readability and performance.
 *
 * @category Constants
 */
export const MAX_CHART_POINTS = 48;

/**
 * Standard height for performance charts across the dashboard.
 *
 * @remarks
 * Centralizing this value ensures that loading skeletons perfectly match
 * the rendered charts, preventing layout shift (CLS).
 *
 * @category Constants
 */
export const CHART_HEIGHT = 342;

/**
 * Standard bottom margin for performance charts.
 * @category Constants
 */
export const CHART_MARGIN_BOTTOM = 8;

/**
 * Approximate height of the summary cards row.
 * Used for skeleton alignment.
 * @category Constants
 */
export const SUMMARY_CARDS_HEIGHT = 80;

/**
 * Standard gap between dashboard elements (corresponds to Radix gap="4").
 * @category Constants
 */
export const DASHBOARD_GAP = 16;

/**
 * Approximate height of the description text row (line height + margin).
 * @category Constants
 */
export const DESCRIPTION_ROW_HEIGHT = 40;

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
export const FULL_DASHBOARD_HEIGHT = 502;

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
 * const color = getMetricColor("LCP", "a3"); // returns "var(--red-a3)"
 * ```
 */
export const getMetricColor = (name: string, weight: number | string = 10): string => {
	const base = (() => {
		switch (name) {
			case "TTFB":
				return "cyan";
			case "FCP":
				return "purple";
			case "LCP":
				return "red";
			case "CLS":
				return "orange";
			case "INP":
				return "amber";
			default:
				return "accent";
		}
	})();

	return `var(--${base}-${weight})`;
};

/**
 * Calculates a Lighthouse-style status color based on thresholds.
 *
 * @remarks
 * Uses standard "Good", "Needs Improvement", and "Poor" ranges for each CWV metric.
 *
 * @param {string} metric - The name of the metric.
 * @param {number | undefined | null} value - The actual metric value.
 *
 * @returns {string} A CSS variable reference to a green, amber, or red color.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const color = getStatusColor("LCP", 1200); // returns "var(--green-11)"
 * ```
 */
export const getStatusColor = (metric: string, value: number | undefined | null): string => {
	if (value === undefined || value === null) return "var(--gray-11)";

	switch (metric) {
		case "LCP":
			return value <= 2500
				? "var(--green-11)"
				: value <= 4000
					? "var(--amber-11)"
					: "var(--red-11)";
		case "INP":
			return value <= 200
				? "var(--green-11)"
				: value <= 500
					? "var(--amber-11)"
					: "var(--red-11)";
		case "CLS":
			return value <= 100
				? "var(--green-11)"
				: value <= 250
					? "var(--amber-11)"
					: "var(--red-11)";
		case "FCP":
			return value <= 1800
				? "var(--green-11)"
				: value <= 3000
					? "var(--amber-11)"
					: "var(--red-11)";
		case "TTFB":
			return value <= 800
				? "var(--green-11)"
				: value <= 1800
					? "var(--amber-11)"
					: "var(--red-11)";
		default:
			return "var(--gray-11)";
	}
};

/**
 * Calculates a Lighthouse-style score (0-100) using a log-normal distribution.
 *
 * @remarks
 * This replicates the actual scoring logic used by PageSpeed Insights and Lighthouse.
 * It uses a cumulative distribution function to map values to a score curve.
 *
 * @param {number} value - The actual metric value.
 * @param {number} p90 - The value that should result in a score of 90 (the "Good" threshold).
 * @param {number} p50 - The value that should result in a score of 50 (the "Median" threshold).
 *
 * @returns {number} An integer score between 0 and 100.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const score = computeLogNormalScore(2500, 2500, 4000); // returns 90
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
 * @param {string} locale - The user locale.
 * @param {Intl.DateTimeFormatOptions} options - Formatting options.
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
 *
 * @param {(number | undefined)[]} data - The sequence of numeric values.
 * @param {number} period - The window size (e.g., 5).
 *
 * @returns {(number | undefined)[]} The smoothed timeseries.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const sma = calculateSMA([10, 20, 30, 40], 2); // returns [10, 15, 25, 35]
 * ```
 */
export const calculateSMA = (
	data: (number | undefined)[],
	period: number
): (number | undefined)[] => {
	return data.map((_, index) => {
		const start = Math.max(0, index - period + 1);
		const window = data.slice(start, index + 1);
		const validValues = window.filter((v): v is number => v !== undefined);

		if (validValues.length === 0) return undefined;

		const sum = validValues.reduce((acc, val) => acc + val, 0);

		return sum / validValues.length;
	});
};

/**
 * Transforms flat API records into a timestamp-keyed structure for Recharts.
 *
 * @param {PerformanceMetric[]} raw - The raw array of metric records from the API.
 * @param {string} locale - The user locale for formatting.
 * @param {number} maxPoints - Maximum number of points to include in the output.
 *
 * @returns {{ chartData: ChartDataPoint[], uniqueMetrics: string[] }} The transformed timeseries data.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const { chartData, uniqueMetrics } = transformPerformanceData(raw, "en-US", 48);
 * ```
 */
export const transformPerformanceData = (
	raw: PerformanceMetric[],
	locale: string,
	maxPoints: number
): { chartData: ChartDataPoint[]; uniqueMetrics: string[] } => {
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

	const fullChartData = Object.values(dateMap)
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((point) => {
			const normalizedPoint = { ...point };
			metrics.forEach((m) => {
				if (normalizedPoint[m] === undefined) {
					normalizedPoint[m] = undefined;
				} else {
					const originalValue = normalizedPoint[m] as number;
					normalizedPoint[`${m}_original`] = originalValue;
					// Minimum visual height for aggregate stacked chart
					normalizedPoint[m] = Math.max(originalValue, 80);
				}

				[`${m}_p50`, `${m}_p75`, `${m}_p90`, `${m}_range`].forEach((pKey) => {
					if (normalizedPoint[pKey] === undefined) normalizedPoint[pKey] = undefined;
				});
			});

			return normalizedPoint;
		});

	let chartData = fullChartData;

	if (fullChartData.length > maxPoints) {
		const sampledData: ChartDataPoint[] = [];
		const step = (fullChartData.length - 1) / (maxPoints - 1);

		for (let i = 0; i < maxPoints; i++) {
			const index = Math.round(i * step);
			sampledData.push(fullChartData[index]);
		}

		chartData = sampledData;
	}

	metrics.forEach((m) => {
		const p75Values = chartData.map((p) => p[`${m}_p75`] as number | undefined);
		const p75SmaValues = calculateSMA(p75Values, 5);

		const mainValues = chartData.map((p) => p[`${m}_original`] as number | undefined);
		const mainSmaValues = calculateSMA(mainValues, 5);

		chartData.forEach((p, i) => {
			p[`${m}_p75_sma`] = p75SmaValues[i];
			p[`${m}_sma`] = mainSmaValues[i];
		});
	});

	return { chartData, uniqueMetrics: Array.from(metrics) };
};

/**
 * Identifies version change points in the timeseries for reference markers.
 *
 * @param {ChartDataPoint[]} chartData - The transformed timeseries data.
 * @param {number} maxPoints - Maximum number of points in the chart (used for spacing logic).
 *
 * @returns {{ timestamp: number; version: string }[]} A list of version change events.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const changes = getVersionChanges(chartData, 48);
 * ```
 */
export const getVersionChanges = (
	chartData: ChartDataPoint[],
	maxPoints: number
): { timestamp: number; version: string }[] => {
	const versionChanges: { timestamp: number; version: string }[] = [];
	let lastVersion: string | null = null;
	let lastAddedIndex = -100;

	chartData.forEach((point, i) => {
		if (lastVersion && point.appVersion !== lastVersion) {
			const minGap = Math.max(4, Math.floor(maxPoints * 0.15));

			if (i - lastAddedIndex >= minGap) {
				versionChanges.push({ timestamp: point.timestamp, version: point.appVersion });
				lastAddedIndex = i;
			}
		}

		lastVersion = point.appVersion;
	});

	return versionChanges;
};

/**
 * Retrieves the most recent value for a metric from the timeseries.
 *
 * @remarks
 * Iterates backwards through the `chartData` to find the latest non-null value
 * for the specified metric. It prioritizes the `_original` value if available
 * (which avoids the visual normalization used for stacked charts).
 *
 * @param {ChartDataPoint[]} chartData - The transformed timeseries data.
 * @param {string} metric - The name of the metric (e.g., "LCP", "FCP").
 *
 * @returns {number | null} The latest numeric value or null if not found.
 *
 * @see {@link ChartDataPoint}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const latestLCP = getLatestMetricValue(chartData, "LCP");
 * // returns 1250 (in ms)
 * ```
 */
export const getLatestMetricValue = (
	chartData: ChartDataPoint[],
	metric: string
): number | null => {
	for (let i = chartData.length - 1; i >= 0; i--) {
		const originalVal = chartData[i][`${metric}_original`];
		const val =
			originalVal !== undefined ? (originalVal as number) : (chartData[i][metric] as number);
		if (val !== undefined && val !== null) return val;
	}

	return null;
};

/**
 * Determines the trend direction between the two most recent data points.
 *
 * @remarks
 * Compares the latest value with the previous one in the timeseries.
 * - `improvement`: The value has decreased (better performance).
 * - `regression`: The value has increased (worse performance).
 * - `neutral`: No change or insufficient data.
 *
 * @param {ChartDataPoint[]} chartData - The transformed timeseries data.
 * @param {string} metric - The name of the metric to analyze.
 *
 * @returns {"improvement" | "regression" | "neutral"} The trend status.
 *
 * @see {@link getLatestMetricValue}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const trend = getMetricTrend(chartData, "FCP");
 * // returns "improvement"
 * ```
 */
export const getMetricTrend = (
	chartData: ChartDataPoint[],
	metric: string
): "improvement" | "regression" | "neutral" => {
	const values: number[] = [];

	for (let i = chartData.length - 1; i >= 0; i--) {
		const originalVal = chartData[i][`${metric}_original`];
		const val =
			originalVal !== undefined ? (originalVal as number) : (chartData[i][metric] as number);
		if (val !== undefined && val !== null) values.push(val);
		if (values.length === 2) break;
	}

	if (values.length < 2) return "neutral";

	return values[0] < values[1] ? "improvement" : values[0] > values[1] ? "regression" : "neutral";
};

/**
 * Computes the weighted overall performance score.
 *
 * @remarks
 * Calculates the score by:
 * 1. Fetching the latest value for each active metric using {@link getLatestMetricValue}.
 * 2. Computing the log-normal score for each value using {@link computeLogNormalScore}.
 * 3. Applying weights defined in {@link LIGHTHOUSE_CONFIG}.
 * 4. Returning a weighted average (0-100).
 *
 * @param {ChartDataPoint[]} chartData - The transformed timeseries data.
 * @param {string[]} activeMetrics - List of metrics to include in the score calculation.
 *
 * @returns {number | null} The overall score (0-100) or null if no metrics are available.
 *
 * @see {@link computeLogNormalScore}
 * @see {@link LIGHTHOUSE_CONFIG}
 * @see {@link getLatestMetricValue}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const score = calculateOverallPerformanceScore(chartData, ["LCP", "FCP"]);
 * // returns 92
 * ```
 */
export const calculateOverallPerformanceScore = (
	chartData: ChartDataPoint[],
	activeMetrics: string[]
): number | null => {
	let totalWeight = 0,
		totalScore = 0;
	activeMetrics.forEach((m) => {
		const val = getLatestMetricValue(chartData, m);
		const metricConfig = LIGHTHOUSE_CONFIG[m];

		if (val !== null && metricConfig) {
			totalScore +=
				computeLogNormalScore(val, metricConfig.p90, metricConfig.p50) *
				metricConfig.weight;
			totalWeight += metricConfig.weight;
		}
	});

	return totalWeight > 0 ? Math.round(totalScore / totalWeight) : null;
};

/**
 * Determines the overall trend by averaging individual metric trends.
 *
 * @remarks
 * This heuristic counts the number of improvements vs regressions across all
 * active metrics using {@link getMetricTrend}. The majority trend is returned.
 * If they are equal or zero, it returns `neutral`.
 *
 * @param {ChartDataPoint[]} chartData - The transformed timeseries data.
 * @param {string[]} activeMetrics - List of metrics to analyze.
 *
 * @returns {"improvement" | "regression" | "neutral"} The overall aggregate trend.
 *
 * @see {@link getMetricTrend}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const status = getOverallTrend(chartData, ["LCP", "FCP"]);
 * // returns "improvement"
 * ```
 */
export const getOverallTrend = (
	chartData: ChartDataPoint[],
	activeMetrics: string[]
): "improvement" | "regression" | "neutral" => {
	let improvementCount = 0;
	let regressionCount = 0;

	activeMetrics.forEach((m) => {
		const trend = getMetricTrend(chartData, m);
		if (trend === "improvement") improvementCount++;
		else if (trend === "regression") regressionCount++;
	});

	if (improvementCount > regressionCount) return "improvement";
	if (regressionCount > improvementCount) return "regression";

	return "neutral";
};
