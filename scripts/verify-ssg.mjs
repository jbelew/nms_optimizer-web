/**
 * @file Verification script for SSG output
 * Checks that all generated pages have proper SEO tags, localized content, and social metadata.
 *
 * @category Utilities
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../shared/config.js";
import { PAGE_REGISTRY } from "../shared/page-registry.js";
import { isDockerBuild } from "./generate-ssg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const BASE_URL = `https://${TARGET_HOST}`;
const IS_DOCKER = isDockerBuild();

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
 * Verifies that a synthesized `index.md` Agent Markdown Document exists and satisfies
 * frontmatter, heading, sanitization, canonical URL, and localized navigation invariants.
 *
 * @param {string} mdFilePath - Absolute path to the generated `index.md` file.
 * @param {string} expectedCanonicalUrl - Expected canonical URL for the route.
 * @param {string} lang - Active locale code (e.g., `"en"`, `"es"`).
 * @returns {string[]} List of failed check identifiers (empty when valid).
 */
function checkAgentMarkdownFile(mdFilePath, expectedCanonicalUrl, lang) {
	if (!fs.existsSync(mdFilePath)) {
		return ["mdExists"];
	}

	const mdContent = fs.readFileSync(mdFilePath, "utf-8");
	const parsed = parseAgentMarkdownFrontmatter(mdContent);

	if (!parsed) {
		return ["mdValidFrontmatter"];
	}

	const { body, fields } = parsed;
	const expectedHomeUrl = lang === "en" ? `${BASE_URL}/` : `${BASE_URL}/${lang}/`;
	const bodyWithoutInlineCode = body.replace(/(`+)(?:(?!\1)[\s\S])*\1/g, "");

	const mdChecks = {
		mdFrontmatterDescription: Boolean(fields.description && fields.description.trim()),
		mdFrontmatterImage: Boolean(fields.image && fields.image.startsWith(`${BASE_URL}/`)),
		mdFrontmatterLang: fields.lang === lang,
		mdFrontmatterTitle: Boolean(fields.title && fields.title.trim()),
		mdFrontmatterUrl: fields.url === expectedCanonicalUrl,
		mdHasLocalizedNavigation:
			/\n## [^\n]+\n\n- \[[^\]]+\]\(https:\/\/nms-optimizer\.app\//.test(body)
			&& body.includes(`](${expectedHomeUrl}) - `),
		mdHasNormalizedTopHeading:
			/^# [^\n]+/.test(body) && !/^# [^\n]*\|\s*NMS Optimizer\s*$/m.test(body),
		mdNoJsonLd: !mdContent.includes("application/ld+json"),
		mdNoRadixIcons: !/<\/?radix-icon\b/i.test(mdContent),
		mdNoRootRelativeLinks: !/\]\(\/(?!\/)/.test(bodyWithoutInlineCode),
		mdNoYoutubeShortcodes: !/\[youtube:[^\]]+\]/.test(bodyWithoutInlineCode),
	};

	return Object.entries(mdChecks)
		.filter(([_, ok]) => !ok)
		.map(([name]) => name);
}

/**
 * Verifies that a pre-rendered HTML file and its sibling `index.md` Agent Markdown Document
 * exist and contain required SEO metadata, fallback content, and sanitized Markdown.
 *
 * @remarks
 * Inspects canonical, `hreflang`, `text/markdown` alternate, Open Graph, and document title tags
 * alongside the Static SEO Fallback body content, site navigation block, and sibling `index.md`.
 *
 * @param {string} filePath - Absolute path to the generated `index.html` file.
 * @param {string} routeSlug - Route slug (`""` for home, or dialog ID such as `"about"`).
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
function checkFile(filePath, routeSlug, lang, expectContent = true) {
	if (!fs.existsSync(filePath)) {
		console.log(`✗ ${filePath} - NOT FOUND`);

		return false;
	}

	const content = fs.readFileSync(filePath, "utf-8");
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const canonicalPath =
		routeSlug === "" ?
			langPrefix ? `${langPrefix}/`
			:	"/"
		:	`${langPrefix}/${routeSlug}/`;
	const expectedCanonicalUrl = `${BASE_URL}${canonicalPath}`;
	const escapedExpectedMdUrl = `${expectedCanonicalUrl}index.md`.replace(
		/[.*+?^${}()|[\]\\]/g,
		"\\$&",
	);

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
		hasMarkdownAlternate: hasTag(
			`<link\\s+rel="alternate"\\s+type="text\\/markdown"\\s+href="${escapedExpectedMdUrl}"\\s*\\/?>`,
		),
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
	if (lang === "en" && routeSlug === "userstats") {
		checks.correctUserStatsLabel = content.includes("User Statistics");
	}

	const failedChecks = Object.entries(checks)
		.filter(([_, v]) => !v)
		.map(([k]) => k);

	if (expectContent) {
		const mdFilePath = path.join(path.dirname(filePath), "index.md");
		failedChecks.push(...checkAgentMarkdownFile(mdFilePath, expectedCanonicalUrl, lang));
	}

	if (failedChecks.length > 0) {
		console.log(`✗ ${canonicalPath} (${lang}): ${failedChecks.join(", ")}`);

		return false;
	}

	return true;
}

/**
 * Parses and validates the YAML frontmatter block at the top of an Agent Markdown Document.
 *
 * @param {string} mdContent - Complete Agent Markdown Document string.
 * @returns {{ body: string, fields: Record<string, string> } | null} Parsed frontmatter fields and remaining body, or `null` if invalid.
 */
function parseAgentMarkdownFrontmatter(mdContent) {
	const match = mdContent.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);

	if (!match) {
		return null;
	}

	const [, rawBlock, body] = match;
	const fields = {};

	for (const line of rawBlock.split("\n")) {
		const lineMatch = line.match(/^([a-z]+):\s+(".*")$/);

		if (!lineMatch) {
			return null;
		}

		const [, key, rawJsonScalar] = lineMatch;

		try {
			const parsedValue = JSON.parse(rawJsonScalar);

			if (typeof parsedValue !== "string") {
				return null;
			}

			fields[key] = parsedValue;
		} catch {
			return null;
		}
	}

	return { body, fields };
}

console.log("🚀 Verifying SSG Output, Agent Markdown Documents, and SEO parity...\n");

let totalPages = 0;
let passedPages = 0;

// 1. Check Root Pages
SUPPORTED_LANGUAGES.forEach((lang) => {
	const rootPath = lang === "en" ? "" : lang;
	const filePath = path.join(DIST_DIR, rootPath, "index.html");
	totalPages++;

	if (checkFile(filePath, "", lang, PAGES_WITH_CONTENT.has(""))) {
		passedPages++;
		console.log(`✓ ${lang === "en" ? "/" : "/" + lang} (+ index.md)`);
	}
});

// 2. Check Dialog Pages
SUPPORTED_LANGUAGES.forEach((lang) => {
	KNOWN_DIALOGS.forEach((dialog) => {
		if (IS_DOCKER && dialog === "userstats") {
			return;
		}

		const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
		const filePath = path.join(DIST_DIR, pagePath, "index.html");
		totalPages++;

		const hasContent = PAGES_WITH_CONTENT.has(dialog);

		if (checkFile(filePath, dialog, lang, hasContent)) {
			passedPages++;
			console.log(`✓ /${pagePath} (+ index.md)`);
		}
	});
});

console.log(
	`\n${passedPages === totalPages ? "✅" : "⚠️"} ${passedPages}/${totalPages} pages verified`,
);

if (passedPages !== totalPages) {
	process.exit(1);
}
