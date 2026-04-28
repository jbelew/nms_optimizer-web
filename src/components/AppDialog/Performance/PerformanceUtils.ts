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
 * Returns a consistent color for a given performance metric.
 *
 * @remarks
 * Maps Core Web Vital metric names to Radix UI color tokens.
 *
 * @param {string} name - The name of the performance metric (e.g., `LCP`).
 * @param {10 | 11} [weight=10] - The Radix color weight (10 for fills, 11 for borders/text).
 *
 * @returns {string} A CSS variable reference to the Radix color.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const color = getMetricColor("LCP", 11); // returns "var(--red-11)"
 * ```
 */
export const getMetricColor = (name: string, weight: 10 | 11 = 10): string => {
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
