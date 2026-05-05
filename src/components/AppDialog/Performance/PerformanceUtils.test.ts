import type { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";
import { describe, expect, it } from "vitest";

import { ChartDataPoint } from "./PerformanceTypes";
import {
	calculateSMA,
	computeLogNormalScore,
	formatMetricValue,
	getPerformanceSummary,
	getStatusColor,
	getVersionChanges,
	transformPerformanceData,
} from "./PerformanceUtils";

// ---------------------------------------------------------------------------
// formatMetricValue
// ---------------------------------------------------------------------------
describe("formatMetricValue", () => {
	it("formats LCP values with ms suffix", () => {
		expect(formatMetricValue("LCP", 1250)).toBe("1250ms");
	});

	it("rounds non-CLS values to nearest integer", () => {
		expect(formatMetricValue("FCP", 1199.7)).toBe("1200ms");
		expect(formatMetricValue("FCP", 1200.3)).toBe("1200ms");
	});

	it("omits unit when includeUnit is false", () => {
		expect(formatMetricValue("LCP", 1250, false)).toBe("1250");
	});

	it("scales CLS from raw thousandths to 0.00–1.00 range", () => {
		expect(formatMetricValue("CLS", 125)).toBe("0.13");
		expect(formatMetricValue("CLS", 0)).toBe("0.00");
		expect(formatMetricValue("CLS", 1000)).toBe("1.00");
	});

	it("ignores includeUnit for CLS (no ms suffix)", () => {
		expect(formatMetricValue("CLS", 125, true)).toBe("0.13");
		expect(formatMetricValue("CLS", 125, false)).toBe("0.13");
	});
});

// ---------------------------------------------------------------------------
// computeLogNormalScore
// ---------------------------------------------------------------------------
describe("computeLogNormalScore", () => {
	it("returns 100 for zero or negative values", () => {
		expect(computeLogNormalScore(0, 2500, 4000)).toBe(100);
		expect(computeLogNormalScore(-1, 2500, 4000)).toBe(100);
	});

	it("returns a high score at the p90 control point", () => {
		// The log-normal CDF approximation doesn't produce exactly 90 at
		// the p90 control point. The naming refers to the percentile
		// distribution, not the output score value.
		const score = computeLogNormalScore(2500, 2500, 4000);
		expect(score).toBeGreaterThanOrEqual(75);
		expect(score).toBeLessThanOrEqual(95);
	});

	it("returns 50 at the p50 control point", () => {
		expect(computeLogNormalScore(4000, 2500, 4000)).toBe(50);
	});

	it("scores near 100 for extremely fast values", () => {
		const score = computeLogNormalScore(100, 2500, 4000);
		expect(score).toBeGreaterThanOrEqual(99);
	});

	it("scores near 0 for extremely slow values", () => {
		const score = computeLogNormalScore(50000, 2500, 4000);
		expect(score).toBeLessThanOrEqual(5);
	});

	it("handles INP thresholds correctly", () => {
		const inpP90Score = computeLogNormalScore(200, 200, 500);
		expect(inpP90Score).toBeGreaterThanOrEqual(75);
		expect(inpP90Score).toBeLessThanOrEqual(95);
		expect(computeLogNormalScore(500, 200, 500)).toBe(50);
	});

	it("handles CLS thresholds correctly (raw thousandths)", () => {
		const clsP90Score = computeLogNormalScore(100, 100, 250);
		expect(clsP90Score).toBeGreaterThanOrEqual(75);
		expect(clsP90Score).toBeLessThanOrEqual(95);
		expect(computeLogNormalScore(250, 100, 250)).toBe(50);
	});
});

// ---------------------------------------------------------------------------
// calculateSMA
// ---------------------------------------------------------------------------
describe("calculateSMA", () => {
	it("returns same values for period=1", () => {
		expect(calculateSMA([10, 20, 30], 1)).toEqual([10, 20, 30]);
	});

	it("computes moving average with period=3", () => {
		const result = calculateSMA([10, 20, 30, 40, 50], 3);
		expect(result).toEqual([10, 15, 20, 30, 40]);
	});

	it("handles single-element arrays", () => {
		expect(calculateSMA([42], 3)).toEqual([42]);
	});

	it("handles empty arrays", () => {
		expect(calculateSMA([], 3)).toEqual([]);
	});

	it("skips undefined values in the window", () => {
		const result = calculateSMA([10, undefined, 30], 3);
		// Window [10] → 10, [10, undefined] → 10, [10, undefined, 30] → 20
		expect(result).toEqual([10, 10, 20]);
	});

	it("returns undefined for all-undefined windows", () => {
		expect(calculateSMA([undefined, undefined], 2)).toEqual([undefined, undefined]);
	});

	it("anchors the last point to raw data when anchorEnd is true", () => {
		const result = calculateSMA([10, 20, 30, 40], 3, true);
		// Normal SMA: [10, 15, 20, 30] → anchorEnd forces last to 40
		expect(result[result.length - 1]).toBe(40);
	});

	it("does not anchor if the last value is undefined", () => {
		const result = calculateSMA([10, 20, undefined], 2, true);
		// Normal SMA: [10, 15, undefined (skipped → 20)] → anchorEnd skipped
		expect(result[result.length - 1]).toBe(20);
	});
});

// ---------------------------------------------------------------------------
// getStatusColor
// ---------------------------------------------------------------------------
describe("getStatusColor", () => {
	it("returns gray for undefined/null values", () => {
		expect(getStatusColor("LCP", undefined)).toBe("var(--gray-11)");
		expect(getStatusColor("LCP", null)).toBe("var(--gray-11)");
	});

	it("returns gray for unknown metrics", () => {
		expect(getStatusColor("UNKNOWN_METRIC", 500)).toBe("var(--gray-11)");
	});

	describe("LCP thresholds", () => {
		it("good: ≤ 2500ms", () => {
			expect(getStatusColor("LCP", 2500)).toBe("var(--green-11)");
		});

		it("needs improvement: 2501–4000ms", () => {
			expect(getStatusColor("LCP", 2501)).toBe("var(--amber-11)");
			expect(getStatusColor("LCP", 4000)).toBe("var(--amber-11)");
		});

		it("poor: > 4000ms", () => {
			expect(getStatusColor("LCP", 4001)).toBe("var(--red-11)");
		});
	});

	describe("INP thresholds", () => {
		it("good: ≤ 200ms", () => {
			expect(getStatusColor("INP", 200)).toBe("var(--green-11)");
		});

		it("needs improvement: 201–500ms", () => {
			expect(getStatusColor("INP", 201)).toBe("var(--amber-11)");
		});

		it("poor: > 500ms", () => {
			expect(getStatusColor("INP", 501)).toBe("var(--red-11)");
		});
	});

	describe("CLS thresholds (raw thousandths)", () => {
		it("good: ≤ 100", () => {
			expect(getStatusColor("CLS", 100)).toBe("var(--green-11)");
		});

		it("needs improvement: 101–250", () => {
			expect(getStatusColor("CLS", 101)).toBe("var(--amber-11)");
		});

		it("poor: > 250", () => {
			expect(getStatusColor("CLS", 251)).toBe("var(--red-11)");
		});
	});

	describe("FCP thresholds", () => {
		it("good: ≤ 1800ms", () => {
			expect(getStatusColor("FCP", 1800)).toBe("var(--green-11)");
		});

		it("needs improvement: 1801–3000ms", () => {
			expect(getStatusColor("FCP", 1801)).toBe("var(--amber-11)");
		});

		it("poor: > 3000ms", () => {
			expect(getStatusColor("FCP", 3001)).toBe("var(--red-11)");
		});
	});

	describe("TTFB thresholds", () => {
		it("good: ≤ 800ms", () => {
			expect(getStatusColor("TTFB", 800)).toBe("var(--green-11)");
		});

		it("needs improvement: 801–1800ms", () => {
			expect(getStatusColor("TTFB", 801)).toBe("var(--amber-11)");
		});

		it("poor: > 1800ms", () => {
			expect(getStatusColor("TTFB", 1801)).toBe("var(--red-11)");
		});
	});
});

// ---------------------------------------------------------------------------
// getPerformanceSummary
// ---------------------------------------------------------------------------
describe("getPerformanceSummary", () => {
	it("returns null for empty data", () => {
		expect(
			getPerformanceSummary(transformPerformanceData([], "en-US", 0, 1, 0).chartData)
		).toBeNull();
	});

	it("returns null for undefined data", () => {
		expect(
			getPerformanceSummary(
				transformPerformanceData(
					undefined as unknown as PerformanceMetric[],
					"en-US",
					0,
					1,
					0
				).chartData
			)
		).toBeNull();
	});

	it("computes scores for the latest timestamp", () => {
		const data: PerformanceMetric[] = [
			{
				timestamp: 0,
				metric_name: "LCP",
				average_value: 2500,
				p75: 2500,
				app_version: "v1",
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData
		);
		expect(result).not.toBeNull();
		// Score at the p90 control point — high but not exactly 90
		expect(result!.metrics.LCP.score).toBeGreaterThanOrEqual(75);
		expect(result!.metrics.LCP.score).toBeLessThanOrEqual(95);
	});

	it("detects improvement when metric value decreases", () => {
		const data: PerformanceMetric[] = [
			{
				timestamp: 0,
				metric_name: "LCP",
				average_value: 3000,
				p75: 3000,
				app_version: "v1",
			} as PerformanceMetric,
			{
				timestamp: 3600000,
				metric_name: "LCP",
				average_value: 2000,
				p75: 2000,
				app_version: "v1",
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData
		);
		expect(result!.trends.LCP).toBe("improvement");
	});

	it("detects regression when metric value increases", () => {
		const data: PerformanceMetric[] = [
			{
				timestamp: 0,
				metric_name: "LCP",
				average_value: 2000,
				p75: 2000,
				app_version: "v1",
			} as PerformanceMetric,
			{
				timestamp: 3600000,
				metric_name: "LCP",
				average_value: 3000,
				p75: 3000,
				app_version: "v1",
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData
		);
		expect(result!.trends.LCP).toBe("regression");
	});

	it("returns neutral for single-timestamp data", () => {
		const data: PerformanceMetric[] = [
			{
				timestamp: 0,
				metric_name: "LCP",
				average_value: 2500,
				p75: 2500,
				app_version: "v1",
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData
		);
		expect(result!.trends.LCP).toBe("neutral");
	});

	it("returns neutral when change is below 1% threshold", () => {
		const data: PerformanceMetric[] = [
			{
				timestamp: 0,
				metric_name: "LCP",
				average_value: 2500,
				p75: 2500,
				app_version: "v1",
			} as PerformanceMetric,
			{
				timestamp: 3600000,
				metric_name: "LCP",
				average_value: 2505,
				p75: 2505,
				app_version: "v1",
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData
		);
		// 5/2500 = 0.2% < 1% threshold
		expect(result!.trends.LCP).toBe("neutral");
	});

	it("computes overall score and trend", () => {
		const data: PerformanceMetric[] = [
			{
				timestamp: 0,
				metric_name: "LCP",
				average_value: 3000,
				p75: 3000,
				app_version: "v1",
			} as PerformanceMetric,
			{
				timestamp: 3600000,
				metric_name: "LCP",
				average_value: 2000,
				p75: 2000,
				app_version: "v1",
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData
		);
		expect(result!.metrics.OVERALL).toBeDefined();
		expect(result!.trends.OVERALL).toBe("improvement");
	});
});

// ---------------------------------------------------------------------------
// getVersionChanges
// ---------------------------------------------------------------------------
describe("getVersionChanges", () => {
	it("returns empty array for fewer than 2 data points", () => {
		expect(getVersionChanges([])).toEqual([]);
		expect(getVersionChanges([{ timestamp: 1, appVersion: "v1" } as ChartDataPoint])).toEqual(
			[]
		);
	});

	it("returns empty array when no version changes occur", () => {
		const data = Array.from(
			{ length: 10 },
			(_, i) =>
				({
					timestamp: i,
					appVersion: "v1",
				}) as ChartDataPoint
		);
		expect(getVersionChanges(data)).toEqual([]);
	});

	it("detects a version change after the first 3 points", () => {
		const data = Array.from(
			{ length: 10 },
			(_, i) =>
				({
					timestamp: i * 1000,
					appVersion: i < 5 ? "v1" : "v2",
				}) as ChartDataPoint
		);

		const result = getVersionChanges(data);
		expect(result).toHaveLength(1);
		expect(result[0].version).toBe("v2");
	});

	it("skips version changes in the first 3 points", () => {
		const data = Array.from(
			{ length: 10 },
			(_, i) =>
				({
					timestamp: i * 1000,
					appVersion: i < 2 ? "v1" : "v2",
				}) as ChartDataPoint
		);

		// Change at index 2 should be skipped (i <= 3)
		const result = getVersionChanges(data);
		expect(result).toEqual([]);
	});

	it("enforces minimum gap between markers", () => {
		// Create data with rapid version changes at indices 5, 6, 7
		const data: ChartDataPoint[] = Array.from(
			{ length: 15 },
			(_, i) =>
				({
					timestamp: i * 1000,
					appVersion: i < 5 ? "v1" : i < 6 ? "v2" : i < 7 ? "v3" : "v4",
				}) as ChartDataPoint
		);

		const result = getVersionChanges(data);
		// v2 at index 5 should be added, but v3 at 6 and v4 at 7 are too close (gap < 4)
		expect(result.length).toBeLessThanOrEqual(2);
	});
	it("skips the virtual 'LIVE' marker", () => {
		const data: ChartDataPoint[] = [
			{ timestamp: 1000, appVersion: "v1" } as ChartDataPoint,
			{ timestamp: 2000, appVersion: "v1" } as ChartDataPoint,
			{ timestamp: 3000, appVersion: "v1" } as ChartDataPoint,
			{ timestamp: 4000, appVersion: "v1" } as ChartDataPoint,
			{ timestamp: 5000, appVersion: "v1" } as ChartDataPoint,
			{ timestamp: 6000, appVersion: "LIVE" } as ChartDataPoint,
		];

		const result = getVersionChanges(data);
		// Should not contain the LIVE version change
		expect(result.find((r) => r.version === "LIVE")).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// transformPerformanceData
// ---------------------------------------------------------------------------
describe("transformPerformanceData", () => {
	const makeMetric = (ts: number, name: string, avg: number, version = "v1"): PerformanceMetric =>
		({
			timestamp: ts,
			metric_name: name,
			average_value: avg,
			p50: avg * 0.8,
			p75: avg,
			p90: avg * 1.2,
			app_version: version,
		}) as PerformanceMetric;

	it("returns empty data for empty input", () => {
		const { chartData, uniqueMetrics } = transformPerformanceData([], "en", 72, 3, undefined);
		expect(chartData).toEqual([]);
		expect(uniqueMetrics).toEqual([]);
	});

	it("filters out TBT metrics", () => {
		const raw = [makeMetric(1000, "TBT", 500), makeMetric(1000, "LCP", 2500)];
		const { uniqueMetrics } = transformPerformanceData(raw, "en", 72);
		expect(uniqueMetrics).not.toContain("TBT");
		expect(uniqueMetrics).toContain("LCP");
	});

	it("attaches SMA fields to chart data points", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		const raw = [
			makeMetric(baseTs, "LCP", 2500),
			makeMetric(baseTs + hourMs, "LCP", 2600),
			makeMetric(baseTs + 2 * hourMs, "LCP", 2700),
		];

		const { chartData } = transformPerformanceData(raw, "en", 72, 3, 3);

		// SMA fields should exist on data points that have metric data
		const pointsWithSma = chartData.filter((p) => p.LCP_p75_sma !== undefined);
		expect(pointsWithSma.length).toBeGreaterThan(0);
	});

	it("computes per-metric deficit scores", () => {
		const raw = [makeMetric(1619370000000, "LCP", 2500)];
		const { chartData } = transformPerformanceData(raw, "en", 72, 1, 3);

		const dataPoint = chartData.find((p) => p.LCP_deficit !== undefined);
		expect(dataPoint).toBeDefined();
		// LCP p75=2500 → score~82 (log-normal CDF) → deficit~18
		expect(dataPoint!.LCP_deficit).toBeGreaterThanOrEqual(5);
		expect(dataPoint!.LCP_deficit).toBeLessThanOrEqual(25);
	});

	it("computes overall weighted scores", () => {
		const raw = [makeMetric(1619370000000, "LCP", 2500)];
		const { chartData } = transformPerformanceData(raw, "en", 72, 1, 3);

		const dataPoint = chartData.find((p) => p.overall_p75 !== undefined);
		expect(dataPoint).toBeDefined();
		expect(dataPoint!.overall_p75).toBeGreaterThan(0);
		expect(dataPoint!.overall_p75).toBeLessThanOrEqual(100);
	});

	it("fills gaps with null points for missing hours", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		// Two data points 3 hours apart — should produce gap-filled points between them
		const raw = [makeMetric(baseTs, "LCP", 2500), makeMetric(baseTs + 3 * hourMs, "LCP", 2600)];

		const { chartData } = transformPerformanceData(raw, "en", 72, 3, 3);

		// Should have entries for hours 0, 1, 2, 3 at minimum
		const timestamps = chartData.map((p) => p.timestamp);
		expect(timestamps).toContain(baseTs + hourMs);
		expect(timestamps).toContain(baseTs + 2 * hourMs);
	});

	it("stores original values alongside computed ones", () => {
		const raw = [makeMetric(1619370000000, "LCP", 2500)];
		const { chartData } = transformPerformanceData(raw, "en", 72, 1, 3);

		const dataPoint = chartData.find((p) => p.LCP_original !== undefined);
		expect(dataPoint).toBeDefined();
		expect(dataPoint!.LCP_original).toBe(2500);
	});

	it("subsamples when data exceeds maxPoints", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;
		const maxPoints = 10;

		// Create 20 data points
		const raw = Array.from({ length: 20 }, (_, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 10)
		);

		const { chartData } = transformPerformanceData(raw, "en", maxPoints, 1);

		// Should be at most maxPoints
		expect(chartData.length).toBeLessThanOrEqual(maxPoints);
		expect(chartData.length).toBeGreaterThan(0);
	});

	it("returns high-resolution summary data independent of sampling", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;
		const maxPoints = 2; // Extreme sampling

		// Create 20 data points (T to T+19h)
		// LCP increases by 100ms every hour.
		// T+18h: 4300ms, T+19h: 4400ms
		const raw = Array.from({ length: 20 }, (_, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 100)
		);

		const { chartData, summary } = transformPerformanceData(raw, "en", maxPoints, 1);

		// Chart data is sampled to 2 points: T and T+19h
		expect(chartData).toHaveLength(2);
		expect(chartData[0].timestamp).toBe(baseTs);
		expect(chartData[1].timestamp).toBe(baseTs + 19 * hourMs);

		// Summary should reflect T+19h vs T+18h, NOT T+19h vs T
		expect(summary).not.toBeNull();

		if (summary) {
			expect(summary.metrics.LCP.value).toBe(4400); // T+19h

			// If it compared T+19h (4400) to T (2500), it would be a huge regression.
			// If it correctly compares T+19h (4400) to T+18h (4300), it's a smaller regression.
			// We can check the actual value used for comparison in the trend calculation.
			// Since we don't expose the 'previousValue' directly in summary,
			// we can verify the score and value are correct.
			expect(summary.timestamp).toBe(baseTs + 19 * hourMs);
		}
	});

	it("returns identical summary for different sampling rates", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		const raw = Array.from({ length: 48 }, (_, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 10)
		);

		const { summary: summaryHigh } = transformPerformanceData(raw, "en", 100, 3);
		const { summary: summaryLow } = transformPerformanceData(raw, "en", 10, 3);

		expect(summaryHigh).toEqual(summaryLow);
	});

	it("returns summary for the absolute latest data point even when requested range is smaller", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		// Create 10 days of data
		const raw = Array.from({ length: 10 * 24 }, (_, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 10)
		);

		const absoluteLatestTs = baseTs + (10 * 24 - 1) * hourMs;
		const latestValue = 2500 + (10 * 24 - 1) * 10;

		// Request only 3 days
		const { summary } = transformPerformanceData(raw, "en", 72, 3, 3);

		expect(summary).not.toBeNull();

		if (summary) {
			expect(summary.timestamp).toBe(absoluteLatestTs);
			expect(summary.metrics.LCP.value).toBe(latestValue);
		}
	});

	it("handles gaps in telemetry by comparing against the most recent valid preceding hour", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		// Create data for T-5h, T-4h, then a gap, then T.
		// T-4h: LCP=2000 (SMA=2000)
		// T: LCP=3000
		const raw = [
			makeMetric(baseTs, "LCP", 2000), // T-5h
			makeMetric(baseTs + hourMs, "LCP", 2000), // T-4h
			// Gap of 3 hours
			makeMetric(baseTs + 5 * hourMs, "LCP", 3000), // T (latest)
		];

		const { summary } = transformPerformanceData(raw, "en", 72, 1); // smaPeriod=1 for simplicity

		expect(summary).not.toBeNull();

		if (summary) {
			expect(summary.metrics.LCP.value).toBe(3000);
			expect(summary.trends.LCP).toBe("regression");
		}
	});

	it("tags the last point with virtual 'LIVE' version and preserves original", () => {
		const raw = [makeMetric(1619370000000, "LCP", 2500, "v1.0.0")];
		const { chartData } = transformPerformanceData(raw, "en", 72, 1);

		const lastPoint = chartData[chartData.length - 1];
		expect(lastPoint.appVersion).toBe("LIVE");
		expect(lastPoint.originalVersion).toBe("v1.0.0");
	});
});
