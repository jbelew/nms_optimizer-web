import { describe, expect, it } from "vitest";

import type { ChartDataPoint, PerformanceMetric } from "./PerformanceUtils";
import {
	calculateSMA,
	computeLogNormalScore,
	formatMetricValue,
	getFormatter,
	getMetricColor,
	getPerformanceSummary,
	getStatusColor,
	getVersionChanges,
	LIGHTHOUSE_CONFIG,
	transformPerformanceData,
} from "./PerformanceUtils";

// ---------------------------------------------------------------------------
// getMetricColor
// ---------------------------------------------------------------------------
describe("getMetricColor", () => {
	it("returns correct color for known metrics with default weight", () => {
		expect(getMetricColor("LCP")).toBe("var(--red-10)");
		expect(getMetricColor("FCP")).toBe("var(--purple-10)");
	});

	it("returns correct color for known metrics with custom weight", () => {
		expect(getMetricColor("LCP", 11)).toBe("var(--red-11)");
		expect(getMetricColor("INP", "a3")).toBe("var(--amber-a3)");
	});

	it("returns fallback color for unknown metrics", () => {
		expect(getMetricColor("UNKNOWN_METRIC")).toBe("var(--accent-10)");
		expect(getMetricColor("UNKNOWN_METRIC", 5)).toBe("var(--accent-5)");
	});
});

// ---------------------------------------------------------------------------
// getFormatter
// ---------------------------------------------------------------------------
describe("getFormatter", () => {
	it("returns an Intl.DateTimeFormat instance", () => {
		const formatter = getFormatter("en-US", { month: "short" });
		expect(formatter).toBeInstanceOf(Intl.DateTimeFormat);
		expect(formatter.format(new Date(2023, 0, 1))).toMatch(/Jan/);
	});

	it("caches formatter instances for the same locale and options", () => {
		const f1 = getFormatter("en-US", { month: "short" });
		const f2 = getFormatter("en-US", { month: "short" });
		expect(f1).toBe(f2);
	});

	it("creates new instances for different options", () => {
		const f1 = getFormatter("en-US", { month: "short" });
		const f2 = getFormatter("en-US", { month: "long" });
		expect(f1).not.toBe(f2);
	});
});

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

	it("returns 90 at p90 and 50 at p50 across all LIGHTHOUSE_CONFIG metrics", () => {
		expect(computeLogNormalScore(2500, 2500, 4000)).toBe(90);
		expect(computeLogNormalScore(4000, 2500, 4000)).toBe(50);

		for (const { p50, p90 } of Object.values(LIGHTHOUSE_CONFIG)) {
			expect(computeLogNormalScore(p90, p90, p50)).toBe(90);
			expect(computeLogNormalScore(p50, p90, p50)).toBe(50);
		}
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
		expect(computeLogNormalScore(200, 200, 500)).toBe(90);
		expect(computeLogNormalScore(500, 200, 500)).toBe(50);
	});

	it("handles CLS thresholds correctly (raw thousandths)", () => {
		expect(computeLogNormalScore(100, 100, 250)).toBe(90);
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
			getPerformanceSummary(transformPerformanceData([], "en-US", 0, 1, 0).chartData),
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
					0,
				).chartData,
			),
		).toBeNull();
	});

	it("computes scores for the latest timestamp", () => {
		const data: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 2500,
				metric_name: "LCP",
				p75: 2500,
				timestamp: 0,
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData,
		);
		expect(result).not.toBeNull();
		expect(result!.metrics.LCP.score).toBe(90);
	});

	it("detects improvement when metric value decreases", () => {
		const data: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 3000,
				metric_name: "LCP",
				p75: 3000,
				timestamp: 0,
			} as PerformanceMetric,
			{
				app_version: "v1",
				average_value: 2000,
				metric_name: "LCP",
				p75: 2000,
				timestamp: 3600000,
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData,
		);
		expect(result!.trends.LCP).toBe("improvement");
	});

	it("detects regression when metric value increases", () => {
		const data: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 2000,
				metric_name: "LCP",
				p75: 2000,
				timestamp: 0,
			} as PerformanceMetric,
			{
				app_version: "v1",
				average_value: 3000,
				metric_name: "LCP",
				p75: 3000,
				timestamp: 3600000,
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData,
		);
		expect(result!.trends.LCP).toBe("regression");
	});

	it("returns neutral for single-timestamp data", () => {
		const data: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 2500,
				metric_name: "LCP",
				p75: 2500,
				timestamp: 0,
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData,
		);
		expect(result!.trends.LCP).toBe("neutral");
	});

	it("returns neutral when change is below 1% threshold", () => {
		const data: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 2500,
				metric_name: "LCP",
				p75: 2500,
				timestamp: 0,
			} as PerformanceMetric,
			{
				app_version: "v1",
				average_value: 2505,
				metric_name: "LCP",
				p75: 2505,
				timestamp: 3600000,
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData,
		);
		// 5/2500 = 0.2% < 1% threshold
		expect(result!.trends.LCP).toBe("neutral");
	});

	it("computes overall score and trend", () => {
		const data: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 3000,
				metric_name: "LCP",
				p75: 3000,
				timestamp: 0,
			} as PerformanceMetric,
			{
				app_version: "v1",
				average_value: 2000,
				metric_name: "LCP",
				p75: 2000,
				timestamp: 3600000,
			} as PerformanceMetric,
		];

		const result = getPerformanceSummary(
			transformPerformanceData(data, "en-US", 0, 1, 0).chartData,
		);
		expect(result!.metrics.OVERALL).toBeDefined();
		expect(result!.trends.OVERALL).toBe("improvement");
	});

	it("uses 5 (0.005 CLS in thousandths) as the minimum CLS trend noise threshold", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		const microShift: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 1,
				metric_name: "CLS",
				p75: 1,
				timestamp: baseTs,
			},
			{
				app_version: "v1",
				average_value: 4,
				metric_name: "CLS",
				p75: 4,
				timestamp: baseTs + hourMs,
			},
		];

		const microSummary = transformPerformanceData(microShift, "en-US", 72, 1).summary;
		expect(microSummary!.trends.CLS).toBe("neutral");

		const realShift: PerformanceMetric[] = [
			{
				app_version: "v1",
				average_value: 10,
				metric_name: "CLS",
				p75: 10,
				timestamp: baseTs,
			},
			{
				app_version: "v1",
				average_value: 20,
				metric_name: "CLS",
				p75: 20,
				timestamp: baseTs + hourMs,
			},
		];

		const realSummary = transformPerformanceData(realShift, "en-US", 72, 1).summary;
		expect(realSummary!.trends.CLS).toBe("regression");
	});

	it("compares symmetric unanchored SMA windows for metric and OVERALL trends rather than raw latest vs 3-hour prior SMA", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		// LCP sequence [2000, 3000, 2000, 2300] with smaPeriod=3:
		// T2 3h SMA = (2000 + 3000 + 2000) / 3 = 2333.33
		// T3 3h SMA = (3000 + 2000 + 2300) / 3 = 2433.33 -> regression (+100ms)
		// (Asymmetric raw T3=2300 vs T2 SMA=2333.33 would falsely report improvement)
		const data: PerformanceMetric[] = [2000, 3000, 2000, 2300].map((val, i) => ({
			app_version: "v1",
			average_value: val,
			metric_name: "LCP",
			p75: val,
			timestamp: baseTs + i * hourMs,
		}));

		const { chartData, summary } = transformPerformanceData(data, "en-US", 72, 3);
		expect(summary!.trends.LCP).toBe("regression");
		expect(summary!.trends.OVERALL).toBe("regression");
		// Visual chart line still anchors the final point to the latest raw p75
		expect(chartData[chartData.length - 1].LCP_p75_sma).toBe(2300);
	});
});

// ---------------------------------------------------------------------------
// getVersionChanges
// ---------------------------------------------------------------------------
describe("getVersionChanges", () => {
	it("returns empty array for fewer than 2 data points", () => {
		expect(getVersionChanges([])).toEqual([]);
		expect(getVersionChanges([{ appVersion: "v1", timestamp: 1 } as ChartDataPoint])).toEqual(
			[],
		);
	});

	it("returns empty array when no version changes occur", () => {
		const data = Array.from(
			{ length: 10 },
			(_, i) =>
				({
					appVersion: "v1",
					timestamp: i,
				}) as ChartDataPoint,
		);
		expect(getVersionChanges(data)).toEqual([]);
	});

	it("detects a version change after the first 3 points", () => {
		const data = Array.from(
			{ length: 10 },
			(_, i) =>
				({
					appVersion: i < 5 ? "v1" : "v2",
					timestamp: i * 1000,
				}) as ChartDataPoint,
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
					appVersion: i < 2 ? "v1" : "v2",
					timestamp: i * 1000,
				}) as ChartDataPoint,
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
					appVersion:
						i < 5 ? "v1"
						: i < 6 ? "v2"
						: i < 7 ? "v3"
						: "v4",
					timestamp: i * 1000,
				}) as ChartDataPoint,
		);

		const result = getVersionChanges(data);
		// v2 at index 5 should be added, but v3 at 6 and v4 at 7 are too close (gap < 4)
		expect(result.length).toBeLessThanOrEqual(2);
	});
	it("skips the virtual 'LIVE' marker", () => {
		const data: ChartDataPoint[] = [
			{ appVersion: "v1", timestamp: 1000 } as ChartDataPoint,
			{ appVersion: "v1", timestamp: 2000 } as ChartDataPoint,
			{ appVersion: "v1", timestamp: 3000 } as ChartDataPoint,
			{ appVersion: "v1", timestamp: 4000 } as ChartDataPoint,
			{ appVersion: "v1", timestamp: 5000 } as ChartDataPoint,
			{ appVersion: "LIVE", timestamp: 6000 } as ChartDataPoint,
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
			app_version: version,
			average_value: avg,
			metric_name: name,
			p50: avg * 0.8,
			p75: avg,
			p90: avg * 1.2,
			timestamp: ts,
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
		// LCP p75=2500 → score=90 → deficit=10
		expect(dataPoint!.LCP_deficit).toBe(10);
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
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 10),
		);

		const { chartData } = transformPerformanceData(raw, "en", maxPoints, 1);

		// Should be at most maxPoints
		expect(chartData.length).toBeLessThanOrEqual(maxPoints);
		expect(chartData.length).toBeGreaterThan(0);
	});

	it("preserves version changes even when drastically subsampling", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;
		const maxPoints = 5;

		// Create 20 data points with rapid version changes
		const raw = Array.from({ length: 20 }, (_, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", 2500, `v${Math.floor(i / 2)}`),
		);

		const { chartData } = transformPerformanceData(raw, "en", maxPoints, 1);

		// The logic forces keeping first, last, and version changes.
		// Since there are 10 versions, there are 9 version changes + first/last.
		// Even though maxPoints is 5, it should keep all version changes.
		expect(chartData.length).toBeGreaterThanOrEqual(10);
	});

	it("returns high-resolution summary data independent of sampling", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;
		const maxPoints = 2; // Extreme sampling

		// Create 20 data points (T to T+19h)
		// LCP increases by 100ms every hour.
		// T+18h: 4300ms, T+19h: 4400ms
		const raw = Array.from({ length: 20 }, (_, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 100),
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
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 10),
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
			makeMetric(baseTs + i * hourMs, "LCP", 2500 + i * 10),
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

	it("computes overall weighted scores using fallback for p50/p90 if missing", () => {
		// Specifically omitting p50 and p90 to trigger the fallback to p75 (or original)
		const raw = [
			{
				app_version: "v1",
				average_value: 2500,
				metric_name: "LCP",
				p75: 2500,
				timestamp: 1619370000000,
			} as PerformanceMetric,
		];
		const { chartData } = transformPerformanceData(raw, "en", 72, 1, 3);

		const dataPoint = chartData.find((p) => p.overall_p75 !== undefined);
		expect(dataPoint).toBeDefined();
		expect(dataPoint!.overall_p50).toBeDefined();
		expect(dataPoint!.overall_p90).toBeDefined();
	});

	it("creates virtual LIVE version only if displayDate exists", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;
		const raw = [
			makeMetric(baseTs, "LCP", 2000), // T-5h
			makeMetric(baseTs + hourMs, "LCP", 2000), // T-4h
			// Gap of 3 hours
			makeMetric(baseTs + 5 * hourMs, "LCP", 3000), // T (latest)
		];

		const { chartData } = transformPerformanceData(raw, "en", 72, 1);

		// The last point has valid data, so it gets the LIVE tag
		const lastPoint = chartData[chartData.length - 1];
		expect(lastPoint.appVersion).toBe("LIVE");
	});

	it("carries forward missing metrics in summary cards and active-hour overall_p75 while leaving empty gap hours undefined", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		const raw: PerformanceMetric[] = [
			// T0: TTFB=800 (score 90, w=0.05), CLS=250 (score 50, w=0.25), INP=500 (score 50, w=0.30)
			{
				app_version: "v1.0.0",
				average_value: 800,
				metric_name: "TTFB",
				p50: 800,
				p75: 800,
				p90: 800,
				timestamp: baseTs,
			},
			{
				app_version: "v1.0.0",
				average_value: 250,
				metric_name: "CLS",
				p50: 250,
				p75: 250,
				p90: 250,
				timestamp: baseTs,
			},
			{
				app_version: "v1.0.0",
				average_value: 500,
				metric_name: "INP",
				p50: 500,
				p75: 500,
				p90: 500,
				timestamp: baseTs,
			},
			// T1: TTFB=800 (score 90), CLS improves to 100 (score 90), INP omitted (<5 samples)
			{
				app_version: "v1.0.0",
				average_value: 800,
				metric_name: "TTFB",
				p50: 800,
				p75: 800,
				p90: 800,
				timestamp: baseTs + hourMs,
			},
			{
				app_version: "v1.0.0",
				average_value: 100,
				metric_name: "CLS",
				p50: 100,
				p75: 100,
				p90: 100,
				timestamp: baseTs + hourMs,
			},
			// T2: completely empty gap hour (no raw records)
			// T3: only TTFB=800 reported; CLS and INP both omitted
			{
				app_version: "v1.0.0",
				average_value: 800,
				metric_name: "TTFB",
				p50: 800,
				p75: 800,
				p90: 800,
				timestamp: baseTs + 3 * hourMs,
			},
		];

		const { chartData, summary } = transformPerformanceData(raw, "en", 72, 1);

		expect(summary).not.toBeNull();
		expect(summary!.metrics.TTFB).toEqual({ score: 90, value: 800 });
		expect(summary!.metrics.CLS).toEqual({ score: 90, value: 100 });
		expect(summary!.trends.CLS).toBe("improvement");
		expect(summary!.metrics.INP).toEqual({ score: 50, value: 500 });
		expect(summary!.trends.INP).toBe("neutral");

		// Weighted active-hour overall_p75 at T1 and T3:
		// (90*0.05 + 90*0.25 + 50*0.30) / (0.05 + 0.25 + 0.30) = 42 / 0.60 = 70
		const pointT1 = chartData.find((p) => p.timestamp === baseTs + hourMs);
		const pointT2Gap = chartData.find((p) => p.timestamp === baseTs + 2 * hourMs);
		const pointT3 = chartData.find((p) => p.timestamp === baseTs + 3 * hourMs);

		expect(pointT1?.overall_p75).toBeCloseTo(70, 5);
		expect(pointT2Gap?.overall_p50).toBeUndefined();
		expect(pointT2Gap?.overall_p75).toBeUndefined();
		expect(pointT2Gap?.overall_p90).toBeUndefined();
		expect(pointT2Gap?.overall_score_range).toBeUndefined();
		expect(pointT3?.overall_p75).toBeCloseTo(70, 5);
		expect(summary!.metrics.OVERALL.score).toBeCloseTo(70, 5);
	});

	it("computes contiguous version-average segments from unsampled range data without merging non-adjacent reappearances", () => {
		const hourMs = 3600000;
		const baseTs = 1619370000000;

		const schedule: Array<{ lcp: number; version: string }> = [
			// Run 1 (v1.0): unsampled mean = (1000 + 2000 + 2000 + 3000) / 4 = 2000
			{ lcp: 1000, version: "v1.0" },
			{ lcp: 2000, version: "v1.0" },
			{ lcp: 2000, version: "v1.0" },
			{ lcp: 3000, version: "v1.0" },
			// Run 2 (v1.1): unsampled mean = (2500 + 3500) / 2 = 3000
			{ lcp: 2500, version: "v1.1" },
			{ lcp: 3500, version: "v1.1" },
			// Run 3 (v1.0 reappearance): unsampled mean = (4000 + 4000) / 2 = 4000 (score 50)
			{ lcp: 4000, version: "v1.0" },
			{ lcp: 4000, version: "v1.0" },
			// Run 4 (v1.1 resumed before final LIVE point): mean = 1500
			{ lcp: 1500, version: "v1.1" },
			// Run 5 (final point -> virtual LIVE): mean = 1800
			{ lcp: 1800, version: "v1.1" },
		];

		const raw = schedule.map((entry, i) =>
			makeMetric(baseTs + i * hourMs, "LCP", entry.lcp, entry.version),
		);

		// Subsample to maxPoints=5 so interior points (1,2,3,5,7) are dropped from chartData
		const { chartData } = transformPerformanceData(raw, "en", 5, 1);

		const byTs = new Map(chartData.map((p) => [p.timestamp, p]));

		expect(byTs.get(baseTs)?.LCP_version_avg).toBe(2000);
		expect(byTs.get(baseTs + 4 * hourMs)?.LCP_version_avg).toBe(3000);
		expect(byTs.get(baseTs + 6 * hourMs)?.LCP_version_avg).toBe(4000);
		expect(byTs.get(baseTs + 6 * hourMs)?.overall_version_avg).toBe(50);
		expect(byTs.get(baseTs + 8 * hourMs)?.LCP_version_avg).toBe(1500);

		const livePoint = byTs.get(baseTs + 9 * hourMs);
		expect(livePoint?.appVersion).toBe("LIVE");
		expect(livePoint?.originalVersion).toBe("v1.1");
		expect(livePoint?.LCP_version_avg).toBe(1800);
	});
});
