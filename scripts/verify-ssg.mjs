/**
 * @file Verification script for SSG output
 * Checks that all generated pages have proper SEO tags, localized content, and social metadata.
 *
 * @category Utilities
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES } from "../shared/config.js";
import { PAGE_REGISTRY } from "../shared/page-registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");

/**
 * Set of route slugs (`""` for home, or dialog IDs) that have pre-rendered markdown content,
 * derived from {@link PAGE_REGISTRY}.
 *
 * @type {Set<string>}
 */
const PAGES_WITH_CONTENT = new Set(
	Object.values(PAGE_REGISTRY)
		.filter((page) => page.markdownFileName)
		.map((page) => (page.id === "home" ? "" : page.id)),
);

/**
 * Verifies that a pre-rendered HTML file exists and contains required SEO metadata and fallback content.
 *
 * @remarks
 * Inspects canonical, `hreflang`, Open Graph, and document title tags alongside the Static SEO Fallback
 * body content and site navigation block.
 *
 * @param {string} filePath - Absolute path to the generated `index.html` file.
 * @param {string} pageName - Route slug or display path (e.g., `"/"`, `"about"`).
 * @param {string} lang - Active locale code (e.g., `"en"`, `"es"`).
 * @param {boolean} [expectContent=true] - Whether the route is expected to include pre-rendered markdown content.
 * @returns {boolean} `true` if all verification checks pass, `false` otherwise.
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const ok = checkFile("/path/to/dist/about/index.html", "about", "en", true);
 * // returns true
 * ```
 */
function checkFile(filePath, pageName, lang, expectContent = true) {
	if (!fs.existsSync(filePath)) {
		console.log(`✗ ${filePath} - NOT FOUND`);

		return false;
	}

	const content = fs.readFileSync(filePath, "utf-8");

	// Helper for flexible multiline matching
	const hasTag = (pattern) => new RegExp(pattern, "i").test(content);

	const checks = {
		hasCanonical: hasTag(
			'<link\\s+rel="canonical"\\s+href="https:\\/\\/nms-optimizer\\.app\\/[^"]*?"\\s*\\/?>',
		),
		hasContent: !expectContent || content.includes("<h2") || content.includes("<p"),
		hasDescription: hasTag('<meta\\s+name="description"\\s+content="[^"]+?"\\s*\\/?>'),
		hasHreflang: hasTag(
			'<link\\s+rel="alternate"\\s+hreflang="[^"]+?"\\s+href="https:\\/\\/nms-optimizer\\.app\\/[^"]*?"\\s*\\/?>',
		),
		hasKeywords: hasTag('<meta\\s+name="keywords"\\s+content="[^"]+?"\\s*\\/?>'),
		hasNavigation: content.includes('aria-label="Site navigation"'),
		hasOgDescription: hasTag('<meta\\s+property="og:description"\\s+content="[^"]+?"\\s*\\/?>'),
		hasOgImageAlt: hasTag('<meta\\s+property="og:image:alt"\\s+content="[^"]+?"\\s*\\/?>'),
		hasOgTitle: hasTag('<meta\\s+property="og:title"\\s+content="[^"]+?"\\s*\\/?>'),
		hasOgUrl: hasTag(
			'<meta\\s+property="og:url"\\s+content="https:\\/\\/nms-optimizer\\.app\\/[^"]*?"\\s*\\/?>',
		),
		hasRoot: content.includes('id="root"'),
		hasTitle: hasTag("<title>[\\s\\S]*?<\\/title>"),
	};

	// Specific check for the userstats title fix we made
	if (lang === "en" && pageName === "userstats") {
		checks.correctUserStatsLabel = content.includes("User Statistics");
	}

	const failedChecks = Object.entries(checks)
		.filter(([_, v]) => !v)
		.map(([k]) => k);

	if (failedChecks.length > 0) {
		console.log(`✗ /${pageName} (${lang}): ${failedChecks.join(", ")}`);

		return false;
	}

	return true;
}

console.log("🚀 Verifying SSG Output and SEO parity...\n");

let totalPages = 0;
let passedPages = 0;

// 1. Check Root Pages
SUPPORTED_LANGUAGES.forEach((lang) => {
	const rootPath = lang === "en" ? "" : lang;
	const filePath = path.join(DIST_DIR, rootPath, "index.html");
	totalPages++;

	if (checkFile(filePath, lang === "en" ? "/" : `/${lang}`, lang, PAGES_WITH_CONTENT.has(""))) {
		passedPages++;
		console.log(`✓ ${lang === "en" ? "/" : "/" + lang}`);
	}
});

// 2. Check Dialog Pages
SUPPORTED_LANGUAGES.forEach((lang) => {
	KNOWN_DIALOGS.forEach((dialog) => {
		const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
		const filePath = path.join(DIST_DIR, pagePath, "index.html");
		totalPages++;

		const hasContent = PAGES_WITH_CONTENT.has(dialog);

		if (checkFile(filePath, dialog, lang, hasContent)) {
			passedPages++;
			console.log(`✓ /${pagePath}`);
		}
	});
});

console.log(
	`\n${passedPages === totalPages ? "✅" : "⚠️"} ${passedPages}/${totalPages} pages verified`,
);

if (passedPages !== totalPages) {
	process.exit(1);
}
