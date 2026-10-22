import { describe, expect, it } from "bun:test";

import {
	createCleanLighthouseEnv,
	extractLighthouseMetrics,
	formatComparisonMarkdown,
	summarizeBundle,
} from "./performance-check.mjs";

describe("performance-check.mjs", () => {
	describe("createCleanLighthouseEnv", () => {
		it("strips Windows LOCALAPPDATA and APPDATA and forces /tmp paths", () => {
			const dirtyEnv = {
				APPDATA: "C:\\Users\\John Belew\\AppData\\Roaming",
				LOCALAPPDATA: "C:\\Users\\John Belew\\AppData\\Local",
				PATH: "/usr/bin",
			};

			const cleaned = createCleanLighthouseEnv(dirtyEnv);

			expect(cleaned.LOCALAPPDATA).toBeUndefined();
			expect(cleaned.APPDATA).toBeUndefined();
			expect(cleaned.TMPDIR).toBe("/tmp");
			expect(cleaned.TEMP).toBe("/tmp");
			expect(cleaned.TMP).toBe("/tmp");
			expect(cleaned.CHROME_PATH).toBe("/usr/bin/google-chrome");
		});
	});

	describe("summarizeBundle", () => {
		it("aggregates critical JS, lazy JS, and stylesheet sizes accurately", () => {
			const summary = summarizeBundle([
				{ isCritical: true, name: "vendor-core-abc.js", size: 216.0, type: "JS" },
				{ isCritical: true, name: "entry-xyz.js", size: 132.3, type: "JS" },
				{ isCritical: false, name: "vendor-charts-123.js", size: 1024.0, type: "JS" },
				{ isCritical: true, name: "index-css.css", size: 51.1, type: "CSS" },
				{ isCritical: false, name: "vendor-ui-themes-css.css", size: 231.4, type: "CSS" },
			]);

			expect(summary.criticalTotalKb).toBeCloseTo(348.3, 1);
			expect(summary.entryKb).toBeCloseTo(132.3, 1);
			expect(summary.vendorCoreKb).toBeCloseTo(216.0, 1);
			expect(summary.lazyTotalKb).toBeCloseTo(1024.0, 1);
			expect(summary.totalJsKb).toBeCloseTo(1372.3, 1);
			expect(summary.indexCssKb).toBeCloseTo(51.1, 1);
			expect(summary.vendorUiThemesCssKb).toBeCloseTo(231.4, 1);
		});
	});

	describe("extractLighthouseMetrics", () => {
		it("normalizes non-breaking spaces and extracts core web vitals", () => {
			const metrics = extractLighthouseMetrics({
				audits: {
					"cumulative-layout-shift": { displayValue: "0", numericValue: 0 },
					"first-contentful-paint": { displayValue: "0.7\u00a0s", numericValue: 700 },
					"largest-contentful-paint": { displayValue: "1.0\u00a0s", numericValue: 1000 },
					"speed-index": { displayValue: "1.1\u00a0s", numericValue: 1100 },
					"total-blocking-time": { displayValue: "40\u00a0ms", numericValue: 40 },
					"total-byte-weight": {
						displayValue: "Total size was 535\u00a0KiB",
						numericValue: 535 * 1024,
					},
				},
				categories: {
					performance: { score: 0.98 },
				},
			});

			expect(metrics).toEqual({
				clsDisplay: "0",
				clsValue: 0,
				fcpDisplay: "0.7 s",
				fcpMs: 700,
				lcpDisplay: "1.0 s",
				lcpMs: 1000,
				score: 98,
				siDisplay: "1.1 s",
				siMs: 1100,
				tbtDisplay: "40 ms",
				tbtMs: 40,
				totalBytes: 547840,
				totalBytesDisplay: "535 KiB",
			});
		});
	});

	describe("formatComparisonMarkdown", () => {
		it("renders Before vs. After bundle and Lighthouse tables with deltas", () => {
			const before = {
				bundle: {
					criticalTotalKb: 349.9,
					entryKb: 133.9,
					indexCssKb: 51.2,
					lazyTotalKb: 1638.4,
					totalJsKb: 1988.3,
					vendorCoreKb: 216.0,
					vendorUiThemesCssKb: 231.4,
				},
				commitSha: "523833a2",
				lighthouse: {
					desktop: {
						clsDisplay: "0",
						clsValue: 0,
						fcpDisplay: "0.7 s",
						fcpMs: 700,
						lcpDisplay: "1.0 s",
						lcpMs: 1000,
						score: 98,
						siDisplay: "1.0 s",
						siMs: 1000,
						tbtDisplay: "40 ms",
						tbtMs: 40,
						totalBytes: 535 * 1024,
						totalBytesDisplay: "535 KiB",
					},
				},
			};

			const after = {
				bundle: {
					criticalTotalKb: 348.3,
					entryKb: 132.3,
					indexCssKb: 51.1,
					lazyTotalKb: 1638.4,
					totalJsKb: 1986.7,
					vendorCoreKb: 216.0,
					vendorUiThemesCssKb: 231.4,
				},
				commitSha: "e164c82b",
				lighthouse: {
					desktop: {
						clsDisplay: "0",
						clsValue: 0,
						fcpDisplay: "0.7 s",
						fcpMs: 700,
						lcpDisplay: "1.0 s",
						lcpMs: 1000,
						score: 98,
						siDisplay: "1.0 s",
						siMs: 1000,
						tbtDisplay: "40 ms",
						tbtMs: 40,
						totalBytes: 534 * 1024,
						totalBytesDisplay: "534 KiB",
					},
				},
			};

			const md = formatComparisonMarkdown(before, after);

			expect(md).toContain(
				"| Metric / Chunk | Before (`523833a2`) | After (`e164c82b`) | Delta |",
			);
			expect(md).toContain(
				"| **Critical Path Total** | `349.9 KB` | `348.3 KB` | **-1.6 KB (-0.46%)** |",
			);
			expect(md).toContain(
				"| `entry-*.js` | `133.9 KB` | `132.3 KB` | **-1.6 KB (-1.19%)** |",
			);
			expect(md).toContain("#### Desktop (`--preset=desktop`)");
			expect(md).toContain(
				"| **Total Transfer Size** | `535 KiB` | `534 KiB` | **-1 KiB** |",
			);
		});
	});
});
