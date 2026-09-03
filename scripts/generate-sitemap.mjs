import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../shared/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const today = new Date().toISOString().split("T")[0];
const baseUrl = `https://${TARGET_HOST}`;

/** Mapping of route names to their source files for lastmod calculation */
const PAGE_TO_FILE_MAPPING = {
	about: "public/assets/locales/en/about.md",
	changelog: "public/assets/locales/en/changelog.md",
	instructions: "public/assets/locales/en/instructions.md",
	privacy: "public/assets/locales/en/privacy.md",
	translation: "public/assets/locales/en/translation-request.md",
	userstats: "src/components/AppDialog/UserStats/UserStatsDialog.tsx",
};

/** SEO priorities for different pages */
const PRIORITIES = {
	about: "0.8",
	changelog: "0.5",
	instructions: "0.8",
	privacy: "0.5",
	root: "1.0",
	translation: "0.5",
	userstats: "0.5",
};

/** Crawl frequencies — shift static docs to monthly to reduce noise */
const CHANGE_FREQUENCIES = {
	about: "monthly",
	changelog: "monthly",
	instructions: "monthly",
	privacy: "monthly",
	translation: "monthly",
	userstats: "monthly",
};

/** Route key to screenshot image mapping for Google Image Sitemap indexing */
const PAGE_IMAGES = {
	about: {
		caption: "No Man's Sky technology layout optimization algorithms and architecture.",
		loc: `${baseUrl}/assets/img/screenshots/screenshot_desktop.png`,
		title: "NMS Optimizer: Engine Architecture",
	},
	instructions: {
		caption: "How to use the grid, manage supercharged slots, and place technology modules.",
		loc: `${baseUrl}/assets/img/screenshots/screenshot_desktop.png`,
		title: "NMS Optimizer: Instructions & Layout Strategy",
	},
	root: {
		caption: "A detailed screenshot of the NMS Optimizer application showing an optimized technology grid with high adjacency bonuses.",
		loc: `${baseUrl}/assets/img/screenshots/screenshot.png`,
		title: "NMS Optimizer: Tech Layout & Adjacency Bonus Calculator",
	},
	userstats: {
		caption: "Community statistics and supercharged slot tech meta for No Man's Sky.",
		loc: `${baseUrl}/assets/img/screenshots/screenshot_desktop.png`,
		title: "NMS Optimizer: Community Meta Stats",
	},
};

/**
 * Escapes XML special characters for sitemap output.
 *
 * @param {string} str - Input string.
 * @returns {string} XML-safe string.
 */
const escapeXml = (str) =>
	str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");

/**
 * Resolves the last modification date using git log if available,
 * falling back to filesystem stat mtime or today's date.
 *
 * @param {string} relPath - Relative file path to check.
 * @returns {string} ISO date string (YYYY-MM-DD).
 */
const getFileLastMod = (relPath) => {
	if (!relPath) return today;

	const fullPath = path.join(__dirname, "..", relPath);

	try {
		const gitDate = execSync(`git log -1 --format="%cs" -- "${fullPath}"`, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "ignore"],
		}).trim();

		if (gitDate && /^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
			return gitDate;
		}
	} catch {
		// Git command unavailable or file uncommitted
	}

	try {
		return fs.statSync(fullPath).mtime.toISOString().split("T")[0];
	} catch (error) {
		console.warn(`Warning: Could not get lastmod for ${relPath}: ${error.message}`);

		return today;
	}
};

// Routes excluded from the sitemap. These are either disallowed in robots.txt
// or are client-only utility routes that should not be indexed.
const EXCLUDED_FROM_SITEMAP = new Set(["performance"]);

const pages = [
	{
		changefreq: "weekly",
		key: "root",
		path: "public/assets/locales/en/home.md",
		priority: PRIORITIES.root,
		url: `${baseUrl}/`,
	},
	...KNOWN_DIALOGS.filter((page) => !EXCLUDED_FROM_SITEMAP.has(page)).map((page) => ({
		changefreq: CHANGE_FREQUENCIES[page] || "weekly",
		key: page,
		path: PAGE_TO_FILE_MAPPING[page],
		priority: PRIORITIES[page] || "0.5",
		url: `${baseUrl}/${page}`,
	})),
];

const languages = SUPPORTED_LANGUAGES;

const urlEntries = pages.flatMap((page) => {
	const lastmod = page.lastmod || getFileLastMod(page.path);

	// 1. Generate all alternate URLs for this page
	const alternateUrls = languages.map((lang) => {
		const url = new URL(page.url);
		const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);

		if (lang !== "en") {
			url.pathname = `/${lang}${normalizePath(url.pathname === "/" ? "" : url.pathname)}`;
		} else {
			url.pathname = normalizePath(url.pathname);
		}

		return { href: url.href, lang };
	});

	const image = PAGE_IMAGES[page.key];
	const imageXml = image
		? `    <image:image>\n      <image:loc>${image.loc}</image:loc>\n      <image:title>${escapeXml(image.title)}</image:title>\n      <image:caption>${escapeXml(image.caption)}</image:caption>\n    </image:image>\n`
		: "";

	// 2. For each alternate URL, create a <url> entry
	return alternateUrls.map(({ href }) => {
		// 3. Inside each <url> entry, list all other alternates
		const hreflangLinks = alternateUrls
			.map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`)
			.join("\n");

		// Add x-default pointing to the 'en' version
		const enUrl = alternateUrls.find((alt) => alt.lang === "en").href;
		const xDefaultLink = `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`;

		return `  <url>
    <loc>${href}</loc>
${hreflangLinks}
${xDefaultLink}
${imageXml}    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`;
	});
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);

console.log("Sitemap generated successfully!");
