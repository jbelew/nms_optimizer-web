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
	translation: "public/assets/locales/en/translation-request.md",
	userstats: "src/components/AppDialog/UserStats/UserStatsDialog.tsx",
	privacy: "public/assets/locales/en/privacy.md",
};

/** SEO priorities for different pages */
const PRIORITIES = {
	root: "1.0",
	about: "1.0",
	instructions: "0.9",
	userstats: "0.8",
	changelog: "0.3",
	translation: "0.6",
};

/** Crawl frequencies — changelog is low-value for search so reduce its frequency */
const CHANGE_FREQUENCIES = {
	changelog: "monthly",
};

// Routes excluded from the sitemap. These are either disallowed in robots.txt
// or are client-only utility routes that should not be indexed.
const EXCLUDED_FROM_SITEMAP = new Set(["performance"]);

const pages = [
	{ path: "public/assets/locales/en/home.md", url: `${baseUrl}/`, priority: PRIORITIES.root, changefreq: "weekly" },
	...KNOWN_DIALOGS.filter((page) => !EXCLUDED_FROM_SITEMAP.has(page)).map((page) => ({
		path: PAGE_TO_FILE_MAPPING[page],
		url: `${baseUrl}/${page}`,
		priority: PRIORITIES[page] || "0.5",
		changefreq: CHANGE_FREQUENCIES[page] || "weekly",
	})),
];

const languages = SUPPORTED_LANGUAGES;

const urlEntries = pages.flatMap((page) => {
	let lastmod = page.lastmod;

	if (!lastmod) {
		if (page.path) {
			try {
				lastmod = fs.statSync(path.join(__dirname, "..", page.path)).mtime.toISOString().split("T")[0];
			} catch (error) {
				console.warn(`Warning: Could not get lastmod for ${page.path}: ${error.message}`);
				lastmod = today;
			}
		} else {
			lastmod = today;
		}
	}

	// 1. Generate all alternate URLs for this page
	const alternateUrls = languages.map((lang) => {
		const url = new URL(page.url);
		const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);

		if (lang !== "en") {
			url.pathname = `/${lang}${normalizePath(url.pathname === "/" ? "" : url.pathname)}`;
		} else {
			url.pathname = normalizePath(url.pathname);
		}

		return { lang, href: url.href };
	});

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
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`;
	});
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);

console.log("Sitemap generated successfully!");
