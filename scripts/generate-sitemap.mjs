import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../server/config.js";

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
	userstats: "src/components/AppDialog/UserStatsDialog.tsx",
};

/** SEO priorities for different pages */
const PRIORITIES = {
	root: "1.0",
	about: "1.0",
	instructions: "0.9",
	userstats: "0.8",
	changelog: "0.7",
	translation: "0.6",
};

const pages = [
	{ path: null, url: `${baseUrl}/`, priority: PRIORITIES.root, lastmod: today },
	...KNOWN_DIALOGS.map((page) => ({
		path: PAGE_TO_FILE_MAPPING[page],
		url: `${baseUrl}/${page}`,
		priority: PRIORITIES[page] || "0.5",
	})),
];

const languages = SUPPORTED_LANGUAGES;

const urlEntries = pages.flatMap((page) => {
	const lastmod = page.lastmod || fs.statSync(path.join(__dirname, "..", page.path)).mtime.toISOString().split("T")[0];

	// 1. Generate all alternate URLs for this page
	const alternateUrls = languages.map((lang) => {
		const url = new URL(page.url);
		if (lang !== "en") {
			url.pathname = `/${lang}${url.pathname === "/" ? "" : url.pathname}`;
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
    <changefreq>weekly</changefreq>
  </url>`;
	});
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);

console.log("Sitemap generated successfully!");
