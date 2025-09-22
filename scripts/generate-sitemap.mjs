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

	return languages.map((lang) => {
		const url = new URL(page.url);
		if (lang !== "en") {
			// Prepend the language code to the path
			url.pathname = `/${lang}${url.pathname === "/" ? "" : url.pathname}`;
		}

		return `  <url>
    <loc>${url.href}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`;
	});
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);

console.log("Sitemap generated successfully!");
