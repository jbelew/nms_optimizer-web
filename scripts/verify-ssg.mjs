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
import { getPageMetadata } from "../shared/page-metadata.js";
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
 * Verifies that a pre-rendered HTML file and its sibling `index.md` Agent Markdown Document
 * exist and contain required SEO metadata, fallback content, and sanitized Markdown.
 *
 * @remarks
 * Derives expected canonical URL, Open Graph URL, Agent Markdown Document `alternate` link,
 * `hreflang` cluster, and `robots` directive directly from {@link getPageMetadata}.
 *
 * @param {string} filePath - Absolute path to the generated `index.html` file.
 * @param {string} routeSlug - Route slug (`""` for home, or dialog ID such as `"about"`).
 * @param {string} lang - Active locale code (e.g., `"en"`, `"es"`).
 * @param {boolean} [expectContent=true] - Whether the route is expected to include pre-rendered markdown content.
 * @param {{ log: (...args: unknown[]) => void }} [logger=console] - Logger used for failure diagnostics.
 * @returns {boolean} `true` if all verification checks pass, `false` otherwise.
 *
 * @see {@link getPageMetadata}
 * @see {@link ./verify-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const ok = checkFile("/path/to/dist/about/index.html", "about", "en", true);
 * // returns true
 * ```
 */
export function checkFile(filePath, routeSlug, lang, expectContent = true, logger = console) {
	if (!fs.existsSync(filePath)) {
		logger.log(`✗ ${filePath} - NOT FOUND`);

		return false;
	}

	const content = fs.readFileSync(filePath, "utf-8");
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const routeDisplayPath =
		routeSlug === "" ?
			langPrefix ? `${langPrefix}/`
			:	"/"
		:	`${langPrefix}/${routeSlug}/`;
	const pathname = routeSlug === "" ? "/" : `/${routeSlug}/`;
	const {
		canonicalUrl: expectedCanonicalUrl,
		hreflangUrls: expectedHreflangUrls,
		robots: expectedRobots,
	} = getPageMetadata({
		baseUrl: BASE_URL,
		lang,
		pathname,
	});
	const escapedExpectedCanonicalUrl = escapeRegex(expectedCanonicalUrl);
	const escapedExpectedMdUrl = escapeRegex(`${expectedCanonicalUrl}index.md`);

	// Helper for flexible multiline matching
	const hasTag = (pattern) => new RegExp(pattern, "i").test(content);

	const checks = {
		hasCanonical: hasTag(
			`<link\\s+rel="canonical"\\s+href="${escapedExpectedCanonicalUrl}"\\s*\\/?>`,
		),
		hasContent: !expectContent || content.includes("<h2") || content.includes("<p"),
		hasDescription: hasTag('<meta\\s+name="description"\\s+content="[^"]+?"\\s*\\/?>'),
		hasHreflang: matchesHreflangContract(content, expectedHreflangUrls),
		hasKeywords: hasTag('<meta\\s+name="keywords"\\s+content="[^"]+?"\\s*\\/?>'),
		hasMarkdownAlternate: hasTag(
			`<link\\s+rel="alternate"\\s+type="text\\/markdown"\\s+href="${escapedExpectedMdUrl}"\\s*\\/?>`,
		),
		hasNavigation: content.includes('aria-label="Site navigation"'),
		hasOgDescription: hasTag('<meta\\s+property="og:description"\\s+content="[^"]+?"\\s*\\/?>'),
		hasOgImageAlt: hasTag('<meta\\s+property="og:image:alt"\\s+content="[^"]+?"\\s*\\/?>'),
		hasOgTitle: hasTag('<meta\\s+property="og:title"\\s+content="[^"]+?"\\s*\\/?>'),
		hasOgUrl: hasTag(
			`<meta\\s+property="og:url"\\s+content="${escapedExpectedCanonicalUrl}"\\s*\\/?>`,
		),
		hasRoot: content.includes('id="root"'),
		hasTitle: hasTag("<title>[\\s\\S]*?<\\/title>"),
		hasValidRobots: matchesRobotsContract(content, expectedRobots),
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
		logger.log(`✗ ${routeDisplayPath} (${lang}): ${failedChecks.join(", ")}`);

		return false;
	}

	return true;
}

/**
 * Verifies all pre-rendered SSG HTML pages and Agent Markdown Documents under `distDir`.
 *
 * @param {Object} [options] - Verification options.
 * @param {string} [options.distDir=DIST_DIR] - Directory containing generated SSG artifacts.
 * @param {boolean} [options.isDocker=IS_DOCKER] - Whether Docker `userstats` exclusion is active.
 * @param {{ log: (...args: unknown[]) => void }} [options.logger=console] - Diagnostic logger.
 * @returns {{ ok: boolean, passedPages: number, totalPages: number }} Verification summary.
 */
export function verifySsg({ distDir = DIST_DIR, isDocker = IS_DOCKER, logger = console } = {}) {
	logger.log("🚀 Verifying SSG Output, Agent Markdown Documents, and SEO parity...\n");

	let totalPages = 0;
	let passedPages = 0;

	// 1. Check Root Pages
	SUPPORTED_LANGUAGES.forEach((lang) => {
		const rootPath = lang === "en" ? "" : lang;
		const filePath = path.join(distDir, rootPath, "index.html");
		totalPages++;

		if (checkFile(filePath, "", lang, PAGES_WITH_CONTENT.has(""), logger)) {
			passedPages++;
			logger.log(`✓ ${lang === "en" ? "/" : "/" + lang} (+ index.md)`);
		}
	});

	// 2. Check Dialog Pages
	SUPPORTED_LANGUAGES.forEach((lang) => {
		KNOWN_DIALOGS.forEach((dialog) => {
			if (isDocker && dialog === "userstats") {
				return;
			}

			const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
			const filePath = path.join(distDir, pagePath, "index.html");
			totalPages++;

			const hasContent = PAGES_WITH_CONTENT.has(dialog);

			if (checkFile(filePath, dialog, lang, hasContent, logger)) {
				passedPages++;
				logger.log(`✓ /${pagePath} (+ index.md)`);
			}
		});
	});

	logger.log(
		`\n${passedPages === totalPages ? "✅" : "⚠️"} ${passedPages}/${totalPages} pages verified`,
	);

	return {
		ok: passedPages === totalPages,
		passedPages,
		totalPages,
	};
}

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
 * Escapes special regular-expression metacharacters in a literal string.
 *
 * @param {string} value - Raw string to escape.
 * @returns {string} Escaped regex-safe string.
 */
function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks whether all `<link rel="alternate" hreflang="...">` tags in `html` match
 * `expectedHreflangUrls` with no missing, mismatched, or extraneous alternate links.
 *
 * @param {string} html - Rendered HTML string.
 * @param {Record<string, string>} expectedHreflangUrls - Expected map of `hreflang` to `href`.
 * @returns {boolean} `true` when the emitted `hreflang` cluster matches the contract.
 */
function matchesHreflangContract(html, expectedHreflangUrls) {
	const linkMatches = [
		...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/?>/gi),
	];
	const expectedEntries = Object.entries(expectedHreflangUrls);

	if (linkMatches.length !== expectedEntries.length) {
		return false;
	}

	const actualMap = new Map(linkMatches.map((match) => [match[1], match[2]]));

	if (actualMap.size !== expectedEntries.length) {
		return false;
	}

	return expectedEntries.every(([hreflang, href]) => actualMap.get(hreflang) === href);
}

/**
 * Checks whether `<meta name="robots">` tags in `html` match `expectedRobots`.
 *
 * @param {string} html - Rendered HTML string.
 * @param {string | null} expectedRobots - Expected `robots` content or `null` when none should exist.
 * @returns {boolean} `true` when the `robots` meta directive matches the contract.
 */
function matchesRobotsContract(html, expectedRobots) {
	const robotsTags = [...html.matchAll(/<meta\b[^>]*\bname="robots"[^>]*>/gi)];

	if (!expectedRobots) {
		return robotsTags.length === 0;
	}

	if (robotsTags.length !== 1) {
		return false;
	}

	return new RegExp(`\\bcontent="${escapeRegex(expectedRobots)}"`, "i").test(robotsTags[0][0]);
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

if (import.meta.main) {
	const { ok } = verifySsg();

	if (!ok) {
		process.exit(1);
	}
}
