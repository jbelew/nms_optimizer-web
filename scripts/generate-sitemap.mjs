import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
	{ path: "src/components/MainAppContent/MainAppContent.tsx", url: "https://nms-optimizer.app/", priority: "1.0" },
	{ path: "src/assets/locales/en/about.md", url: "https://nms-optimizer.app/about", priority: "1.0" },
	{ path: "public/assets/locales/en/changelog.md", url: "https://nms-optimizer.app/changelog", priority: "0.7" },
	{
		path: "public/assets/locales/en/instructions.md",
		url: "https://nms-optimizer.app/instructions",
		priority: "0.9"
	},
	{
		path: "public/assets/locales/en/translation-request.md",
		url: "https://nms-optimizer.app/translation",
		priority: "0.6"
	},
	{
		path: "src/components/AppDialog/UserStatsDialog.tsx",
		url: "https://nms-optimizer.app/userstats",
		priority: "0.8"
	},
];

const languages = ["en", "es", "fr", "de", "pt"];

const urlEntries = pages.flatMap((page) => {
	const stats = fs.statSync(path.join(__dirname, "..", page.path));
	const lastmod = stats.mtime.toISOString().split("T")[0];

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
