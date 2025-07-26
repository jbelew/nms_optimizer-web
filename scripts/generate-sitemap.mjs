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
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
		.map((page) => {
			const stats = fs.statSync(path.join(__dirname, "..", page.path));
			const lastmod = stats.mtime.toISOString().split("T")[0];
			return `<url>
    <loc>${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`;
		})
		.join("\n  ")}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "..", "public", "sitemap.xml"), sitemap);

console.log("Sitemap generated successfully!");
