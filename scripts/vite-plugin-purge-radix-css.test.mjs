/**
 * @file Unit tests for the purgeRadixCss Vite plugin.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "bun:test";

import { purgeRadixCss } from "./vite-plugin-purge-radix-css.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("purgeRadixCss plugin", () => {
	it("purges unused Radix component rules and unused responsive breakpoint selectors while preserving used ones", () => {
		const plugin = purgeRadixCss();
		plugin.configResolved({ root: ROOT });

		const sampleCss = [
			".rt-Button{cursor:pointer}",
			".rt-TableRoot{display:table}",
			".rt-r-fd-column{flex-direction:column}",
			"@media (width>=520px){.xs\\:rt-r-p-1{padding:4px}.rt-Text:where(.xs\\:rt-r-size-3){font-size:16px}}",
			"@media (width>=768px){.rt-Text:where(.sm\\:rt-r-size-3){font-size:16px}.sm\\:rt-r-gtc-3{grid-template-columns:repeat(3,1fr)}}",
			"@media (width>=1024px){.md\\:rt-r-fd-row{flex-direction:row}.md\\:rt-r-ai-start{align-items:flex-start}.md\\:rt-r-pb-0{padding-bottom:0}.md\\:rt-r-gap-1{gap:4px}.md\\:rt-r-ml-5{margin-left:24px}.md\\:rt-r-fs-0{flex-shrink:0}.md\\:rt-r-p-9{padding:64px}}",
			"@media (width>=1640px){.xl\\:rt-r-m-2{margin:8px}}",
		].join("");

		const bundle = {
			"build/vendor-ui-themes.css": {
				source: sampleCss,
				type: "asset",
			},
		};

		plugin.generateBundle({}, bundle);

		const output = bundle["build/vendor-ui-themes.css"].source.toString();

		// Preserves used component and non-responsive utility rules
		expect(output).toContain(".rt-Button{cursor:pointer}");
		expect(output).toContain(".rt-r-fd-column{flex-direction:column}");

		// Purges unused component rules
		expect(output).not.toContain(".rt-TableRoot");

		// Purges unused responsive breakpoint rules and drops empty @media blocks
		expect(output).not.toContain("xs\\:rt-r-p-1");
		expect(output).not.toContain("xs\\:rt-r-size-3");
		expect(output).not.toContain("@media (width>=520px)");
		expect(output).not.toContain("sm\\:rt-r-gtc-3");
		expect(output).not.toContain("md\\:rt-r-p-9");
		expect(output).not.toContain("xl\\:rt-r-m-2");
		expect(output).not.toContain("@media (width>=1640px)");

		// Preserves used responsive breakpoint rules (sm:size, md:direction/align/pb/gap/ml/flexShrink)
		expect(output).toContain(".rt-Text:where(.sm\\:rt-r-size-3){font-size:16px}");
		expect(output).toContain(".md\\:rt-r-fd-row{flex-direction:row}");
		expect(output).toContain(".md\\:rt-r-ai-start{align-items:flex-start}");
		expect(output).toContain(".md\\:rt-r-pb-0{padding-bottom:0}");
		expect(output).toContain(".md\\:rt-r-gap-1{gap:4px}");
		expect(output).toContain(".md\\:rt-r-ml-5{margin-left:24px}");
		expect(output).toContain(".md\\:rt-r-fs-0{flex-shrink:0}");
	});
});

describe("Production Bundle CSS & Radix Chunking", () => {
	const distBuildDir = path.join(ROOT, "dist", "build");
	const distIndexHtml = path.join(ROOT, "dist", "index.html");
	const itWhenBuilt = fs.existsSync(distBuildDir) ? it : it.skip;

	itWhenBuilt("consolidates CSS into exactly two bundles (vendor-ui-themes and index)", () => {
		const cssFiles = fs
			.readdirSync(distBuildDir)
			.filter((file) => file.endsWith(".css"))
			.sort();

		expect(cssFiles.length).toBe(2);
		expect(cssFiles.some((file) => file.startsWith("vendor-ui-themes-"))).toBe(true);
		expect(cssFiles.some((file) => file.startsWith("index-"))).toBe(true);

		const html = fs.readFileSync(distIndexHtml, "utf-8");
		const stylesheetLinks = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)];
		expect(stylesheetLinks.length).toBe(2);
	});

	itWhenBuilt("purges unused responsive breakpoints from built vendor-ui-themes.css", () => {
		const vendorCssFile = fs
			.readdirSync(distBuildDir)
			.find((file) => file.startsWith("vendor-ui-themes-") && file.endsWith(".css"));
		expect(vendorCssFile).toBeDefined();

		const vendorCss = fs.readFileSync(path.join(distBuildDir, vendorCssFile), "utf-8");
		expect(vendorCss).not.toContain("xs\\:rt-r-");
		expect(vendorCss).not.toContain("lg\\:rt-r-");
		expect(vendorCss).not.toContain("xl\\:rt-r-");
		expect(vendorCss.length).toBeLessThan(260 * 1024);
	});

	itWhenBuilt("excludes dialog-only Radix Themes components from the eager vendor-ui-themes.js chunk", () => {
		const vendorJsFile = fs
			.readdirSync(distBuildDir)
			.find((file) => file.startsWith("vendor-ui-themes-") && file.endsWith(".js"));
		expect(vendorJsFile).toBeDefined();

		const vendorJs = fs.readFileSync(path.join(distBuildDir, vendorJsFile), "utf-8");
		const dialogOnlyDisplayNames = [
			"SegmentedControl.Root",
			"CheckboxGroup.Root",
			"DataList.Root",
			"TextField.Root",
			"TextArea",
			"Blockquote",
			"Card",
			"Badge",
			"Kbd",
		];

		for (const displayName of dialogOnlyDisplayNames) {
			expect(vendorJs).not.toContain(`displayName=\`${displayName}\``);
			expect(vendorJs).not.toContain(`displayName="${displayName}"`);
		}
	});

	itWhenBuilt("never emits ad-blocker-targeted chunk filenames (monitoring, sentry, analytics, events)", () => {
		const jsFiles = fs
			.readdirSync(distBuildDir)
			.filter((file) => file.endsWith(".js"));
		expect(jsFiles.length).toBeGreaterThan(0);

		for (const file of jsFiles) {
			expect(file.toLowerCase()).not.toMatch(/monitoring|sentry|analytics|events/);
		}
	});

	itWhenBuilt("matches every .size-limit.json path pattern against built dist/build assets", () => {
		const sizeLimitPath = path.resolve(ROOT, ".size-limit.json");
		const sizeLimits = JSON.parse(fs.readFileSync(sizeLimitPath, "utf-8"));
		const builtFiles = fs.readdirSync(distBuildDir);

		for (const entry of sizeLimits) {
			const fileGlob = path.basename(entry.path);
			const regex = new RegExp(
				"^" + fileGlob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$",
			);
			const matches = builtFiles.filter((f) => regex.test(f));
			expect(matches.length).toBeGreaterThan(0);
		}
	});
});

