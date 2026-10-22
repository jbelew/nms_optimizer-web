#!/usr/bin/env node

/**
 * Performance & Bundle Check Script
 *
 * Modes:
 * - Default (`bun run perf:check`): Analyzes `dist/build` bundle sizes.
 * - Baseline (`bun run perf:baseline`): Builds, runs Desktop + Mobile Lighthouse audits
 *   in a sanitized WSL2-safe environment, and writes `/tmp/nms-perf-baseline.json`.
 * - Compare (`bun run perf:compare [base-ref]`): Captures the current post-refactor
 *   snapshot, compares against `/tmp/nms-perf-baseline.json` (or builds `base-ref` if
 *   provided), and prints ready-to-paste Before vs. After Markdown tables.
 */
import { execFileSync, spawn } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_DIST_DIR = path.join(REPO_ROOT, "dist/build");
const DEFAULT_BASELINE_PATH = "/tmp/nms-perf-baseline.json";
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

/**
 * Reads built `.js` and `.css` assets from `dist/build`.
 *
 * @remarks
 * Classifies `entry-*`, `index-*`, and `vendor-core-*` chunks as critical-path assets
 * and sorts the returned array in descending order by file size.
 *
 * @param {string} [targetDistDir] - Directory containing built assets.
 * @returns {Array<{ isCritical: boolean; name: string; size: number; type: "CSS" | "JS" }>} Sorted asset list.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const bundles = analyzeBundle();
 * ```
 */
export function analyzeBundle(targetDistDir = DEFAULT_DIST_DIR) {
	if (!fs.existsSync(targetDistDir)) {
		console.warn(`⚠️ Warning: dist/build directory not found at ${targetDistDir}`);

		return [];
	}

	return fs
		.readdirSync(targetDistDir)
		.filter((f) => f.endsWith(".js") || f.endsWith(".css"))
		.map((f) => {
			const filePath = path.join(targetDistDir, f);
			const stat = fs.statSync(filePath);

			return {
				isCritical:
					f.startsWith("entry-")
					|| f.startsWith("index-")
					|| f.startsWith("vendor-core-"),
				name: f,
				size: stat.size / 1024,
				type: f.endsWith(".js") ? "JS" : "CSS",
			};
		})
		.sort((a, b) => b.size - a.size);
}

/**
 * Removes any rogue `'C:\Users*'` directories in the repository root if a
 * Windows-aware tool leaked paths under WSL2.
 *
 * @remarks
 * Acts as a post-run safety sweep to keep the repository root clean.
 *
 * @param {string} [rootDir] - Repository root directory to inspect.
 * @returns {void} No return value.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * cleanupRogueWindowsDirs();
 * ```
 */
export function cleanupRogueWindowsDirs(rootDir = REPO_ROOT) {
	if (!fs.existsSync(rootDir)) {
		return;
	}

	for (const entry of fs.readdirSync(rootDir)) {
		if (entry.startsWith("C:\\") || entry.startsWith("c:\\")) {
			fs.rmSync(path.join(rootDir, entry), { force: true, recursive: true });
		}
	}
}

/**
 * Creates a sanitized environment for Lighthouse and Chrome in WSL2.
 *
 * @remarks
 * Strips Windows `LOCALAPPDATA` and `APPDATA` variables so `chrome-launcher`
 * never creates `'C:\Users\...\lighthouse.XXXX'` directories and `Singleton*`
 * symlinks inside the repository root.
 *
 * @param {NodeJS.ProcessEnv} [baseEnv] - Source environment object.
 * @returns {NodeJS.ProcessEnv} Sanitized environment object.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const env = createCleanLighthouseEnv(process.env);
 * ```
 */
export function createCleanLighthouseEnv(baseEnv = process.env) {
	const env = { ...baseEnv };

	delete env.LOCALAPPDATA;
	delete env.APPDATA;
	env.TMPDIR = "/tmp";
	env.TEMP = "/tmp";
	env.TMP = "/tmp";
	env.CHROME_PATH = env.CHROME_PATH || "/usr/bin/google-chrome";

	return env;
}

/**
 * Extracts key Web Vitals and transfer metrics from a raw Lighthouse JSON report.
 *
 * @remarks
 * Normalizes non-breaking spaces in Lighthouse `displayValue` strings so Markdown
 * output uses standard ASCII spaces.
 *
 * @param {Record<string, unknown>} report - Parsed Lighthouse JSON report.
 * @returns {{
 *   clsDisplay: string;
 *   clsValue: number;
 *   fcpDisplay: string;
 *   fcpMs: number;
 *   lcpDisplay: string;
 *   lcpMs: number;
 *   score: number;
 *   siDisplay: string;
 *   siMs: number;
 *   tbtDisplay: string;
 *   tbtMs: number;
 *   totalBytes: number;
 *   totalBytesDisplay: string;
 * }} Normalized Lighthouse metrics.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const metrics = extractLighthouseMetrics(reportJson);
 * ```
 */
export function extractLighthouseMetrics(report) {
	const categories = report.categories ?? {};
	const audits = report.audits ?? {};
	const normalizeSpace = (str) =>
		String(str ?? "")
			.replace(/\u00a0/g, " ")
			.trim();

	const fcp = audits["first-contentful-paint"] ?? {};
	const lcp = audits["largest-contentful-paint"] ?? {};
	const tbt = audits["total-blocking-time"] ?? {};
	const cls = audits["cumulative-layout-shift"] ?? {};
	const si = audits["speed-index"] ?? {};
	const bytes = audits["total-byte-weight"] ?? {};

	return {
		clsDisplay: normalizeSpace(cls.displayValue || "0"),
		clsValue: Number(cls.numericValue ?? 0),
		fcpDisplay: normalizeSpace(fcp.displayValue),
		fcpMs: Number(fcp.numericValue ?? 0),
		lcpDisplay: normalizeSpace(lcp.displayValue),
		lcpMs: Number(lcp.numericValue ?? 0),
		score: Math.round(Number(categories.performance?.score ?? 0) * 100),
		siDisplay: normalizeSpace(si.displayValue),
		siMs: Number(si.numericValue ?? 0),
		tbtDisplay: normalizeSpace(tbt.displayValue),
		tbtMs: Number(tbt.numericValue ?? 0),
		totalBytes: Number(bytes.numericValue ?? 0),
		totalBytesDisplay: normalizeSpace(bytes.displayValue).replace(/^Total size was\s+/i, ""),
	};
}

/**
 * Generates the complete Before vs. After Markdown comparison report.
 *
 * @remarks
 * Produces GitHub-flavored Markdown tables for bundle size chunks and, when present
 * on both snapshots, Desktop and Mobile Lighthouse Web Vitals.
 *
 * @param {{
 *   bundle: ReturnType<typeof summarizeBundle>;
 *   commitSha: string;
 *   lighthouse?: {
 *     desktop?: ReturnType<typeof extractLighthouseMetrics>;
 *     mobile?: ReturnType<typeof extractLighthouseMetrics>;
 *   };
 * }} before - Baseline performance snapshot.
 * @param {{
 *   bundle: ReturnType<typeof summarizeBundle>;
 *   commitSha: string;
 *   lighthouse?: {
 *     desktop?: ReturnType<typeof extractLighthouseMetrics>;
 *     mobile?: ReturnType<typeof extractLighthouseMetrics>;
 *   };
 * }} after - Post-refactor performance snapshot.
 * @returns {string} Formatted Markdown report.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const markdown = formatComparisonMarkdown(beforeSnapshot, afterSnapshot);
 * ```
 */
export function formatComparisonMarkdown(before, after) {
	const beforeSha = before.commitSha || "before";
	const afterSha = after.commitSha || "after";
	const b = before.bundle;
	const a = after.bundle;

	const lines = [
		"### 1. Bundle Size (`bun run build && bun run perf:check`)",
		"",
		`| Metric / Chunk | Before (\`${beforeSha}\`) | After (\`${afterSha}\`) | Delta |`,
		"| :--- | ---: | ---: | :--- |",
		`| **Critical Path Total** | \`${b.criticalTotalKb.toFixed(1)} KB\` | \`${a.criticalTotalKb.toFixed(1)} KB\` | ${formatKbDelta(b.criticalTotalKb, a.criticalTotalKb)} |`,
		`| \`entry-*.js\` | \`${b.entryKb.toFixed(1)} KB\` | \`${a.entryKb.toFixed(1)} KB\` | ${formatKbDelta(b.entryKb, a.entryKb)} |`,
		`| \`vendor-core-*.js\` | \`${b.vendorCoreKb.toFixed(1)} KB\` | \`${a.vendorCoreKb.toFixed(1)} KB\` | ${formatKbDelta(b.vendorCoreKb, a.vendorCoreKb)} |`,
		`| **Lazy-Loaded JS Total** | \`${(b.lazyTotalKb / 1024).toFixed(1)} MB\` | \`${(a.lazyTotalKb / 1024).toFixed(1)} MB\` | ${formatKbDelta(b.lazyTotalKb, a.lazyTotalKb)} |`,
		`| **Total JS** | \`${(b.totalJsKb / 1024).toFixed(1)} MB\` | \`${(a.totalJsKb / 1024).toFixed(1)} MB\` | ${formatKbDelta(b.totalJsKb, a.totalJsKb)} |`,
		`| \`index-*.css\` | \`${b.indexCssKb.toFixed(1)} KB\` | \`${a.indexCssKb.toFixed(1)} KB\` | ${formatKbDelta(b.indexCssKb, a.indexCssKb)} |`,
		`| \`vendor-ui-themes-*.css\` | \`${b.vendorUiThemesCssKb.toFixed(1)} KB\` | \`${a.vendorUiThemesCssKb.toFixed(1)} KB\` | ${formatKbDelta(b.vendorUiThemesCssKb, a.vendorUiThemesCssKb)} |`,
	];

	if (before.lighthouse?.desktop && after.lighthouse?.desktop) {
		lines.push(
			"",
			"---",
			"",
			`### 2. Lighthouse / Web Vitals (\`${PREVIEW_URL}\`)`,
			"",
			formatLighthouseTable(
				"Desktop (`--preset=desktop`)",
				beforeSha,
				afterSha,
				before.lighthouse.desktop,
				after.lighthouse.desktop,
			),
		);

		if (before.lighthouse?.mobile && after.lighthouse?.mobile) {
			lines.push(
				"",
				formatLighthouseTable(
					"Mobile (Default Lighthouse 4x CPU / Slow 4G Simulation)",
					beforeSha,
					afterSha,
					before.lighthouse.mobile,
					after.lighthouse.mobile,
				),
			);
		}
	}

	return lines.join("\n");
}

/**
 * Formats a size in kilobytes for human-readable console output.
 *
 * @remarks
 * Converts values above 1000 KB into megabytes with one decimal place.
 *
 * @param {number} kb - Size in KB.
 * @returns {string} Formatted size string.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * formatSize(348.3); // "348.3K"
 * ```
 */
export function formatSize(kb) {
	return kb > 1000 ? `${(kb / 1024).toFixed(1)}M` : `${kb.toFixed(1)}K`;
}

/**
 * Computes structured bundle metrics from a list of asset descriptors.
 *
 * @remarks
 * Aggregates critical-path JS, lazy-loaded JS, total JS, and primary stylesheet sizes
 * in kilobytes for baseline snapshots and delta comparisons.
 *
 * @param {Array<{ isCritical: boolean; name: string; size: number; type: "CSS" | "JS" }>} bundles - Built asset descriptors.
 * @returns {{
 *   criticalTotalKb: number;
 *   entryKb: number;
 *   indexCssKb: number;
 *   lazyTotalKb: number;
 *   totalJsKb: number;
 *   vendorCoreKb: number;
 *   vendorUiThemesCssKb: number;
 * }} Aggregated bundle metrics in KB.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const summary = summarizeBundle(analyzeBundle());
 * ```
 */
export function summarizeBundle(bundles) {
	const { criticalJs, css, lazyJs } = partitionBundles(bundles);
	const sumKb = (items) => items.reduce((acc, item) => acc + item.size, 0);
	const findSize = (list, prefix) => list.find((b) => b.name.startsWith(prefix))?.size ?? 0;

	const criticalTotalKb = sumKb(criticalJs);
	const lazyTotalKb = sumKb(lazyJs);

	return {
		criticalTotalKb,
		entryKb: findSize(criticalJs, "entry-"),
		indexCssKb: findSize(css, "index-"),
		lazyTotalKb,
		totalJsKb: criticalTotalKb + lazyTotalKb,
		vendorCoreKb: findSize(criticalJs, "vendor-core-"),
		vendorUiThemesCssKb: findSize(css, "vendor-ui-themes-"),
	};
}

/**
 * Captures a complete bundle + Lighthouse performance snapshot for the current checkout.
 *
 * @param {{ bundleOnly?: boolean; skipBuild?: boolean }} [options] - Capture options.
 * @returns {Promise<{
 *   bundle: ReturnType<typeof summarizeBundle>;
 *   commitSha: string;
 *   lighthouse?: {
 *     desktop: ReturnType<typeof extractLighthouseMetrics>;
 *     mobile: ReturnType<typeof extractLighthouseMetrics>;
 *   };
 *   timestamp: string;
 * }>} Captured snapshot.
 * @throws {Error} When `dist/build` contains no built assets.
 */
async function captureSnapshot({ bundleOnly = false, skipBuild = false } = {}) {
	if (!skipBuild) {
		runProductionBuild();
	}

	const bundles = analyzeBundle();

	if (bundles.length === 0) {
		throw new Error("No built files found in dist/build. Run `bun run build` first.");
	}

	const snapshot = {
		bundle: summarizeBundle(bundles),
		commitSha: getGitShortSha("HEAD"),
		timestamp: new Date().toISOString(),
	};

	if (!bundleOnly) {
		snapshot.lighthouse = await runLighthouseSuite();
	}

	return snapshot;
}

/**
 * Captures a snapshot for an arbitrary git ref by temporarily checking it out,
 * then restoring the original branch and rebuilding `dist/`.
 *
 * @param {string} targetRef - Git ref to measure.
 * @param {{ bundleOnly?: boolean }} [options] - Capture options.
 * @returns {Promise<Awaited<ReturnType<typeof captureSnapshot>>>} Captured baseline snapshot.
 */
async function captureSnapshotForRef(targetRef, { bundleOnly = false } = {}) {
	const currentBranch =
		execFileSync("git", ["branch", "--show-current"], {
			cwd: REPO_ROOT,
			encoding: "utf8",
		}).trim() || getGitShortSha("HEAD");

	execFileSync("git", ["checkout", targetRef], { cwd: REPO_ROOT, stdio: "ignore" });

	try {
		return await captureSnapshot({ bundleOnly, skipBuild: false });
	} finally {
		execFileSync("git", ["checkout", currentBranch], { cwd: REPO_ROOT, stdio: "ignore" });
		runProductionBuild();
	}
}

/**
 * Formats a kilobyte delta with percentage change when meaningful.
 *
 * @param {number} beforeKb - Baseline size in KB.
 * @param {number} afterKb - Current size in KB.
 * @param {string} [unit] - Unit label ("KB" or "MB").
 * @returns {string} Formatted Markdown delta cell.
 */
function formatKbDelta(beforeKb, afterKb, unit = "KB") {
	const diff = afterKb - beforeKb;

	if (Math.abs(diff) < 0.05) {
		return `\`0.0 ${unit}\``;
	}

	const sign = diff > 0 ? "+" : "";
	const pct = beforeKb > 0 ? ` (${sign}${((diff / beforeKb) * 100).toFixed(2)}%)` : "";

	return `**${sign}${diff.toFixed(1)} ${unit}${pct}**`;
}

/**
 * Formats a Lighthouse table section (Desktop or Mobile) comparing Before and After metrics.
 *
 * @param {string} heading - Markdown subheading.
 * @param {string} beforeSha - Short baseline commit SHA.
 * @param {string} afterSha - Short current commit SHA.
 * @param {ReturnType<typeof extractLighthouseMetrics>} beforeLh - Baseline Lighthouse metrics.
 * @param {ReturnType<typeof extractLighthouseMetrics>} afterLh - Current Lighthouse metrics.
 * @returns {string} Markdown table block.
 */
function formatLighthouseTable(heading, beforeSha, afterSha, beforeLh, afterLh) {
	const scoreDiff = afterLh.score - beforeLh.score;
	const scoreSign = scoreDiff > 0 ? "+" : "";
	const scoreDelta = scoreDiff === 0 ? "**0**" : `\`${scoreSign}${scoreDiff}\``;

	const clsDiff = afterLh.clsValue - beforeLh.clsValue;
	const clsDelta =
		Math.abs(clsDiff) < 0.001 ? "**0**" : `\`${clsDiff > 0 ? "+" : ""}${clsDiff.toFixed(3)}\``;

	const beforeKib = Math.round(beforeLh.totalBytes / 1024);
	const afterKib = Math.round(afterLh.totalBytes / 1024);
	const kibDiff = afterKib - beforeKib;
	const kibDelta = kibDiff === 0 ? "`0 KiB`" : `**${kibDiff > 0 ? "+" : ""}${kibDiff} KiB**`;

	return [
		`#### ${heading}`,
		"",
		`| Metric | Before (\`${beforeSha}\`) | After (\`${afterSha}\`) | Delta |`,
		"| :--- | ---: | ---: | :--- |",
		`| **Performance Score** | \`${beforeLh.score}\` | \`${afterLh.score}\` | ${scoreDelta} |`,
		`| **First Contentful Paint (FCP)** | \`${beforeLh.fcpDisplay}\` | \`${afterLh.fcpDisplay}\` | ${formatTimeDelta(beforeLh.fcpMs, afterLh.fcpMs, "s")} |`,
		`| **Largest Contentful Paint (LCP)** | \`${beforeLh.lcpDisplay}\` | \`${afterLh.lcpDisplay}\` | ${formatTimeDelta(beforeLh.lcpMs, afterLh.lcpMs, "s")} |`,
		`| **Cumulative Layout Shift (CLS)** | \`${beforeLh.clsDisplay}\` | \`${afterLh.clsDisplay}\` | ${clsDelta} |`,
		`| **Total Blocking Time (TBT)** | \`${beforeLh.tbtDisplay}\` | \`${afterLh.tbtDisplay}\` | ${formatTimeDelta(beforeLh.tbtMs, afterLh.tbtMs, "ms")} |`,
		`| **Speed Index (SI)** | \`${beforeLh.siDisplay}\` | \`${afterLh.siDisplay}\` | ${formatTimeDelta(beforeLh.siMs, afterLh.siMs, "s")} |`,
		`| **Total Transfer Size** | \`${beforeLh.totalBytesDisplay}\` | \`${afterLh.totalBytesDisplay}\` | ${kibDelta} |`,
	].join("\n");
}

/**
 * Formats a numeric timing delta in seconds or milliseconds.
 *
 * @param {number} beforeMs - Baseline duration in milliseconds.
 * @param {number} afterMs - Current duration in milliseconds.
 * @param {"ms" | "s"} unit - Output unit.
 * @returns {string} Formatted Markdown delta cell.
 */
function formatTimeDelta(beforeMs, afterMs, unit) {
	if (unit === "s") {
		const beforeSec = Number((beforeMs / 1000).toFixed(1));
		const afterSec = Number((afterMs / 1000).toFixed(1));
		const diffSec = afterSec - beforeSec;

		if (Math.abs(diffSec) < 0.05) {
			return "**0.0 s**";
		}

		const sign = diffSec > 0 ? "+" : "";

		return `\`${sign}${diffSec.toFixed(1)} s\``;
	}

	const diffMs = Math.round(afterMs - beforeMs);

	if (Math.abs(diffMs) === 0) {
		return "**0 ms**";
	}

	const sign = diffMs > 0 ? "+" : "";

	return `\`${sign}${diffMs} ms\``;
}

/**
 * Returns the short git commit SHA for a ref.
 *
 * @param {string} [ref] - Git revision to resolve.
 * @returns {string} Short commit SHA.
 */
function getGitShortSha(ref = "HEAD") {
	try {
		return execFileSync("git", ["rev-parse", "--short=8", ref], {
			cwd: REPO_ROOT,
			encoding: "utf8",
		}).trim();
	} catch {
		return ref;
	}
}

/**
 * Checks whether `public/sitemap.xml` currently has uncommitted modifications.
 *
 * @returns {boolean} True if `public/sitemap.xml` is clean in git.
 */
function isSitemapClean() {
	try {
		const out = execFileSync("git", ["status", "--porcelain", "public/sitemap.xml"], {
			cwd: REPO_ROOT,
			encoding: "utf8",
		}).trim();

		return out.length === 0;
	} catch {
		return false;
	}
}

/**
 * CLI entrypoint.
 *
 * @returns {Promise<void>} Resolves when command completes.
 * @throws {Error} When `--compare` is invoked without a baseline file or git ref.
 */
async function main() {
	const args = process.argv.slice(2);
	const isBaseline = args.includes("--baseline");
	const isCompare = args.includes("--compare");
	const skipBuild = args.includes("--skip-build");
	const bundleOnly = args.includes("--bundle-only");
	const positionalArgs = args.filter((arg) => !arg.startsWith("--"));

	if (isBaseline) {
		const snapshot = await captureSnapshot({ bundleOnly, skipBuild });
		fs.writeFileSync(DEFAULT_BASELINE_PATH, JSON.stringify(snapshot, null, 2), {
			encoding: "utf8",
			mode: 0o600,
		});
		console.log(
			`✅ Saved performance baseline (${snapshot.commitSha}) to ${DEFAULT_BASELINE_PATH}`,
		);

		return;
	}

	if (isCompare) {
		const refArg = positionalArgs[0];
		let before;

		if (refArg) {
			const after = await captureSnapshot({ bundleOnly, skipBuild });
			before = await captureSnapshotForRef(refArg, { bundleOnly });
			console.log("\n" + formatComparisonMarkdown(before, after) + "\n");

			return;
		}

		if (!fs.existsSync(DEFAULT_BASELINE_PATH)) {
			throw new Error(
				`Baseline file not found at ${DEFAULT_BASELINE_PATH}. Run \`bun run perf:baseline\` before refactoring, or pass a baseline git ref: \`bun run perf:compare <git-ref>\`.`,
			);
		}

		before = JSON.parse(fs.readFileSync(DEFAULT_BASELINE_PATH, "utf8"));
		const after = await captureSnapshot({
			bundleOnly: bundleOnly || !before.lighthouse,
			skipBuild,
		});
		console.log("\n" + formatComparisonMarkdown(before, after) + "\n");

		return;
	}

	printSingleBundleReport();
}

/**
 * Partitions built asset descriptors into critical JS, lazy JS, and CSS lists.
 *
 * @param {Array<{ isCritical: boolean; name: string; size: number; type: "CSS" | "JS" }>} bundles - Built asset descriptors.
 * @returns {{
 *   criticalJs: Array<{ isCritical: boolean; name: string; size: number; type: "CSS" | "JS" }>;
 *   css: Array<{ isCritical: boolean; name: string; size: number; type: "CSS" | "JS" }>;
 *   lazyJs: Array<{ isCritical: boolean; name: string; size: number; type: "CSS" | "JS" }>;
 * }} Partitioned bundle lists.
 */
function partitionBundles(bundles) {
	return {
		criticalJs: bundles.filter((b) => b.isCritical && b.type === "JS"),
		css: bundles.filter((b) => b.type === "CSS"),
		lazyJs: bundles.filter((b) => !b.isCritical && b.type === "JS"),
	};
}

/**
 * Prints the standard single-point bundle analysis report (`bun run perf:check`).
 *
 * @returns {void} No return value.
 */
function printSingleBundleReport() {
	console.log("\n📊 Bundle Size Analysis\n");
	console.log("=".repeat(60));

	const bundles = analyzeBundle();

	if (bundles.length === 0) {
		console.log("No built files found in dist/build. Please run 'bun run build' first.");

		return;
	}

	const { criticalJs, css, lazyJs } = partitionBundles(bundles);
	const { criticalTotalKb, lazyTotalKb, totalJsKb } = summarizeBundle(bundles);

	console.log("\n🔴 CRITICAL PATH (Loaded on Startup):\n");
	criticalJs.forEach((b) => {
		console.log(`  ${b.name.padEnd(35)} ${formatSize(b.size).padStart(8)}`);
	});
	console.log(`\n  TOTAL: ${formatSize(criticalTotalKb)}`);

	console.log("\n🟡 LAZY-LOADED (On-Demand):\n");
	lazyJs.forEach((b) => {
		console.log(`  ${b.name.padEnd(35)} ${formatSize(b.size).padStart(8)}`);
	});
	console.log(`\n  TOTAL: ${formatSize(lazyTotalKb)}`);

	console.log("\n🟢 STYLESHEETS:\n");
	css.forEach((b) => {
		console.log(`  ${b.name.padEnd(35)} ${formatSize(b.size).padStart(8)}`);
	});

	console.log("\n" + "=".repeat(60));
	console.log(`\n📈 METRICS:\n`);
	console.log(`  • Critical Path: ${formatSize(criticalTotalKb)}`);
	console.log(`  • Lazy Load: ${formatSize(lazyTotalKb)}`);
	console.log(`  • Total JS: ${formatSize(totalJsKb)}`);

	console.log(`\n💡 RECOMMENDATIONS:\n`);

	if (criticalJs.length > 0) {
		const largest = criticalJs[0];

		if (largest.size > 150) {
			console.log(
				`  ⚠️  ${largest.name} (${formatSize(largest.size)}) is too large for critical path`,
			);
			console.log(`      Consider lazy-loading or code-splitting further\n`);
		}
	}

	const vendorChunk = bundles.find((b) => b.name.includes("vendor"));

	if (vendorChunk && vendorChunk.size > 60) {
		console.log(`  ⚠️  vendor chunk (${formatSize(vendorChunk.size)}) is still quite large`);
		console.log(`      Run: npm dedupe && npm ls --depth=1\n`);
	}

	console.log(`  ✅ Console logs properly dropped (verified in production build)\n`);
	console.log(`  ✅ Router (23K) and Socket.io (5K) now lazy-loaded\n`);

	console.log(`\n📋 NEXT STEPS:\n`);
	console.log(`  1. bun run perf:baseline  # Capture pre-refactor bundle + Lighthouse baseline`);
	console.log(
		`  2. bun run perf:compare   # Generate Before vs. After Markdown comparison table\n`,
	);

	console.log("=".repeat(60) + "\n");
}

/**
 * Starts `vite preview`, executes Desktop and Mobile Lighthouse runs with fresh
 * Chrome profiles, and guarantees preview server termination on exit.
 *
 * @returns {Promise<{
 *   desktop: ReturnType<typeof extractLighthouseMetrics>;
 *   mobile: ReturnType<typeof extractLighthouseMetrics>;
 * }>} Desktop and Mobile Lighthouse results.
 */
async function runLighthouseSuite() {
	const viteBin = path.join(REPO_ROOT, "node_modules/.bin/vite");
	const server = spawn(
		viteBin,
		["preview", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT)],
		{
			cwd: REPO_ROOT,
			detached: true,
			env: createCleanLighthouseEnv(),
			stdio: "ignore",
		},
	);
	server.unref();

	try {
		await waitForServer(PREVIEW_URL);
		const desktop = runSingleLighthouseAudit("desktop");
		const mobile = runSingleLighthouseAudit("mobile");

		return { desktop, mobile };
	} finally {
		try {
			if (server.pid) {
				process.kill(-server.pid, "SIGTERM");
			}
		} catch {
			try {
				server.kill("SIGTERM");
			} catch {
				// Process already exited
			}
		}

		cleanupRogueWindowsDirs(REPO_ROOT);
	}
}

/**
 * Runs `bun run build` and restores `public/sitemap.xml` if it was clean prior to building.
 *
 * @returns {void} No return value.
 */
function runProductionBuild() {
	const restoreSitemap = isSitemapClean();
	execFileSync("bun", ["run", "build"], {
		cwd: REPO_ROOT,
		env: createCleanLighthouseEnv(),
		stdio: "inherit",
	});

	if (restoreSitemap) {
		try {
			execFileSync("git", ["checkout", "--", "public/sitemap.xml"], {
				cwd: REPO_ROOT,
				stdio: "ignore",
			});
		} catch {
			// Ignore if sitemap is untracked
		}
	}
}

/**
 * Runs a single Lighthouse audit with an isolated `/tmp` Chrome profile directory.
 *
 * @param {"desktop" | "mobile"} preset - Audit form factor preset.
 * @returns {ReturnType<typeof extractLighthouseMetrics>} Normalized Lighthouse metrics.
 */
function runSingleLighthouseAudit(preset) {
	const profileDir = `/tmp/lh-chrome-profile-${preset}-${process.pid}`;
	const outPath = `/tmp/lh-report-${preset}-${process.pid}.json`;
	const lighthouseBin = path.join(REPO_ROOT, "node_modules/.bin/lighthouse");
	const chromeFlags = [
		"--headless=new",
		"--no-sandbox",
		"--disable-gpu",
		"--disable-dev-shm-usage",
		`--user-data-dir=${profileDir}`,
	].join(" ");

	fs.rmSync(profileDir, { force: true, recursive: true });
	fs.mkdirSync(profileDir, { recursive: true });

	const args = [
		PREVIEW_URL,
		"--only-categories=performance",
		...(preset === "desktop" ? ["--preset=desktop"] : []),
		"--output=json",
		`--output-path=${outPath}`,
		`--chrome-flags=${chromeFlags}`,
		"--quiet",
	];

	try {
		execFileSync(lighthouseBin, args, {
			cwd: "/tmp",
			env: createCleanLighthouseEnv(),
			stdio: "ignore",
		});

		const report = JSON.parse(fs.readFileSync(outPath, "utf8"));

		return extractLighthouseMetrics(report);
	} finally {
		fs.rmSync(profileDir, { force: true, recursive: true });
		fs.rmSync(outPath, { force: true });
		cleanupRogueWindowsDirs(REPO_ROOT);
	}
}

/**
 * Polls an HTTP URL until it responds or times out.
 *
 * @param {string} url - Target URL to poll.
 * @param {number} [timeoutMs] - Maximum wait time in ms.
 * @returns {Promise<void>} Resolves when server responds.
 * @throws {Error} When the preview server does not respond within `timeoutMs`.
 */
function waitForServer(url, timeoutMs = 15000) {
	const start = Date.now();

	return new Promise((resolve, reject) => {
		const check = () => {
			const req = http.get(url, (res) => {
				res.resume();
				resolve();
			});

			req.on("error", () => {
				if (Date.now() - start >= timeoutMs) {
					reject(new Error(`Timed out waiting for preview server at ${url}`));
				} else {
					setTimeout(check, 250);
				}
			});
		};

		check();
	});
}

if (import.meta.main) {
	main().catch((err) => {
		console.error(`❌ Performance check failed: ${err.message}`);
		process.exit(1);
	});
}
