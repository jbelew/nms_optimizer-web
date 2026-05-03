import { describe, expect, it } from "vitest";

import { ChartDataPoint } from "./PerformanceTypes";
import { getMetricTrend, getOverallTrend } from "./PerformanceUtils";

describe("PerformanceUtils Trend Logic", () => {
	describe("getMetricTrend", () => {
		it("returns 'neutral' if formatted values are identical (rounding)", () => {
			const data = [
				{ timestamp: 1, LCP: 1200.1, LCP_original: 1200.1 },
				{ timestamp: 2, LCP: 1200.4, LCP_original: 1200.4 },
			] as unknown as ChartDataPoint[];
			expect(getMetricTrend(data, "LCP")).toBe("neutral");
		});

		it("returns 'regression' if formatted values differ negatively", () => {
			const data = [
				{ timestamp: 1, LCP: 1200, LCP_original: 1200 },
				{ timestamp: 2, LCP: 1201, LCP_original: 1201 },
			] as unknown as ChartDataPoint[];
			expect(getMetricTrend(data, "LCP")).toBe("regression");
		});

		it("returns 'improvement' if formatted values differ positively", () => {
			const data = [
				{ timestamp: 1, LCP: 1200, LCP_original: 1200 },
				{ timestamp: 2, LCP: 1199, LCP_original: 1199 },
			] as unknown as ChartDataPoint[];
			expect(getMetricTrend(data, "LCP")).toBe("improvement");
		});

		it("handles CLS with 2 decimal places", () => {
			const data = [
				{ timestamp: 1, CLS: 120.1, CLS_original: 120.1 }, // 0.12
				{ timestamp: 2, CLS: 120.4, CLS_original: 120.4 }, // 0.12
			] as unknown as ChartDataPoint[];
			expect(getMetricTrend(data, "CLS")).toBe("neutral");

			const data2 = [
				{ timestamp: 1, CLS: 120, CLS_original: 120 }, // 0.12
				{ timestamp: 2, CLS: 130, CLS_original: 130 }, // 0.13
			] as unknown as ChartDataPoint[];
			expect(getMetricTrend(data2, "CLS")).toBe("regression");
		});
	});

	describe("getOverallTrend", () => {
		// Note: getOverallTrend now uses calculateOverallPerformanceScore, which
		// calculates the score based on the latest available values for each metric.
		it("returns 'neutral' if rounded scores are identical", () => {
			const data = [
				{ timestamp: 1, LCP_original: 2500 }, // Score 90
				{ timestamp: 2, LCP_original: 2501 }, // Score still rounds to 90
			] as unknown as ChartDataPoint[];
			expect(getOverallTrend(data, ["LCP"])).toBe("neutral");
		});

		it("returns 'regression' if rounded score decreases", () => {
			const data = [
				{ timestamp: 1, LCP_original: 2500 }, // Score 90
				{ timestamp: 2, LCP_original: 4000 }, // Score 50
			] as unknown as ChartDataPoint[];
			expect(getOverallTrend(data, ["LCP"])).toBe("regression");
		});

		it("returns 'improvement' if rounded score increases", () => {
			const data = [
				{ timestamp: 1, LCP_original: 4000 }, // Score 50
				{ timestamp: 2, LCP_original: 2500 }, // Score 90
			] as unknown as ChartDataPoint[];
			expect(getOverallTrend(data, ["LCP"])).toBe("improvement");
		});

		it("uses composite latest values for trend (matching the summary card)", () => {
			// This test verifies that we compare the LATEST composite state with the
			// PREVIOUS composite state.
			const data = [
				{ timestamp: 1, LCP_original: 2500, FCP_original: 1800 }, // S1: composite of (2500, 1800)
				{ timestamp: 2, LCP_original: 4000 }, // S2: composite of (4000, 1800) -> regression
			] as unknown as ChartDataPoint[];

			expect(getOverallTrend(data, ["LCP", "FCP"])).toBe("regression");
		});
	});
});
