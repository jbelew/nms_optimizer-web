/**
 * @file Static Site Generation script
 * Pre-renders all markdown pages as static HTML for better SEO.
 * Generates one HTML file per language/page combination.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";

import { BASE_KNOWN_PATHS, KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../server/config.js";
import { seoMetadata } from "../shared/seo-metadata.js";
import { createMarkdownProcessor } from "./markdown-processor.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

// Configuration is now imported from server/config.js

// Map route names to markdown filenames when they differ
const PAGE_TO_MARKDOWN_MAPPING = {
	translation: "translation-request",
	"": "home",
};

/**
 * Read markdown file from the locales directory
 */
function readMarkdownFile(lang, fileName) {
	const filePath = path.join(LOCALES_DIR, lang, `${fileName}.md`);
	if (!fs.existsSync(filePath)) {
		// Fallback to English
		const enPath = path.join(LOCALES_DIR, "en", `${fileName}.md`);
		if (fs.existsSync(enPath)) {
			return fs.readFileSync(enPath, "utf-8");
		}
		return "";
	}
	return fs.readFileSync(filePath, "utf-8");
}

/**
 * Generate SEO tags for a page
 */
function generateSeoTags(pathname, lang, baseUrl) {
	const tags = [];

	// Canonical URL
	const canonicalPath = lang === "en" ? pathname : `/${lang}${pathname}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;
	tags.push(`<link rel="canonical" href="${canonicalUrl}" />`);
	tags.push(`<meta property="og:url" content="${canonicalUrl}" />`);

	// Hreflang tags
	const cleanPath = pathname === "/" ? "" : pathname;

	// English (and x-default)
	const enUrl = new URL(cleanPath || "/", baseUrl).href;
	tags.push(`<link rel="alternate" hreflang="en" href="${enUrl}" />`);
	tags.push(`<link rel="alternate" hreflang="x-default" href="${enUrl}" />`);

	// Other languages
	SUPPORTED_LANGUAGES.filter((l) => l !== "en").forEach((langCode) => {
		const langUrl = new URL(`/${langCode}${cleanPath}`, baseUrl).href;
		tags.push(`<link rel="alternate" hreflang="${langCode}" href="${langUrl}" />`);
	});

	return tags;
}

/**
 * Generate internal navigation links for SEO
 */
function generateNavigationLinks(lang, currentPage, t) {
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const pages = [
		{ path: "/", key: "seo.nav.home", descKey: "seo.navDescriptions.home" },
		{
			path: "/instructions",
			key: "seo.nav.instructions",
			descKey: "seo.navDescriptions.instructions",
		},
		{
			path: "/about",
			key: "seo.nav.about",
			descKey: "seo.navDescriptions.about",
		},
		{
			path: "/changelog",
			key: "seo.nav.changelog",
			descKey: "seo.navDescriptions.changelog",
		},
		{
			path: "/userstats",
			key: "seo.nav.userstats",
			descKey: "seo.navDescriptions.userstats",
		},
		{
			path: "/translation",
			key: "seo.nav.translation",
			descKey: "seo.navDescriptions.translation",
		},
	];

	const links = pages
		.map(({ path, key, descKey }) => {
			const href = path === "/" ? langPrefix || "/" : `${langPrefix}${path}`;
			const label = t(key, { defaultValue: path.slice(1) || "Home" });
			const desc = t(descKey, { defaultValue: "" });
			const currentPath = currentPage === "" ? "/" : `/${currentPage}`;
			const isCurrent = path === currentPath;

			return `<li${isCurrent ? ' aria-current="page"' : ""}><a href="${href}">${label}</a> - ${desc}</li>`;
		})
		.join("\n          ");

	return `
    <nav aria-label="Site navigation">
      <h2>Navigation</h2>
      <ul>
        ${links}
      </ul>
    </nav>`;
}

/**
 * Generate a page with markdown content
 */
function generatePage(indexHtml, lang, pageName, baseUrl, mdProcessor, t) {
	let html = indexHtml.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
	const pathname = pageName === "" ? "/" : `/${pageName}`;
	const isRootPage = pageName === "";

	// Remove ALL noscript blocks from the template (there might be multiple)
	html = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, "");

	// --- SEO Title & Description Injection ---
	const metadata = seoMetadata[pathname === "/" ? "/" : pathname];

	if (metadata) {
		const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });
		const pageDescription = t(metadata.descriptionKey);

		// Replace title and meta description placeholders
		html = html
			.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
			.replace(
				/<meta name="description"[\s\S]*?\/>/,
				`<meta name="description" content="${pageDescription}" />`
			);
	}

	// Generate SEO tags (canonical, hreflang)
	const seoTags = generateSeoTags(pathname, lang, baseUrl);

	// Inject SEO tags before closing </head>
	html = html.replace("</head>", `  ${seoTags.join("\n  ")}\n</head>`);

	// Read and render markdown content for pre-rendering
	if (pageName !== null) {
		const markdownFileName = PAGE_TO_MARKDOWN_MAPPING[pageName] || pageName;
		const markdownContent = readMarkdownFile(lang, markdownFileName);

		if (markdownContent) {
			// Render markdown to HTML
			const renderedHtml = mdProcessor(markdownContent);

			// Generate navigation links
			const navigationHtml = generateNavigationLinks(lang, pageName, t);

			// Create a noscript block with the rendered markdown
			const contentBlock = `<noscript>
    <style>
      [data-prerendered-markdown="true"] { color: #fff; padding: 2rem; font-family: Raleway, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      [data-prerendered-markdown="true"] h1 { color: #0ba5e9; margin: 1.5rem 0 1rem 0; font-size: 1.5rem; font-weight: bold; }
      [data-prerendered-markdown="true"] h2 { color: #0ba5e9; margin: 1.5rem 0 1rem 0; font-size: 1.125rem; font-weight: bold; }
      [data-prerendered-markdown="true"] h3 { color: #0ba5e9; margin: 1rem 0 0.75rem 0; font-size: 1rem; font-weight: bold; }
      [data-prerendered-markdown="true"] p { margin-bottom: 0.5rem; line-height: 1.6; }
      [data-prerendered-markdown="true"] ul { list-style: disc; margin: 0.5rem 0 0.5rem 1.5rem; }
      [data-prerendered-markdown="true"] ol { list-style: decimal; margin: 0.5rem 0 0.5rem 1.5rem; }
      [data-prerendered-markdown="true"] li { margin-bottom: 0.25rem; }
      [data-prerendered-markdown="true"] a { color: #0ba5e9; text-decoration: underline; }
      [data-prerendered-markdown="true"] code { background-color: rgba(0, 162, 199, 0.1); padding: 0.125rem 0.25rem; border-radius: 0.25rem; color: #0ba5e9; }
      [data-prerendered-markdown="true"] blockquote { border-left: 4px solid #0ba5e9; padding-left: 1rem; margin: 0.5rem 0; font-style: italic; color: #cbd5e1; }
      [data-prerendered-markdown="true"] nav { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(11, 165, 233, 0.3); }
      [data-prerendered-markdown="true"] nav h2 { font-size: 1rem; margin-bottom: 0.5rem; }
      [data-prerendered-markdown="true"] nav ul { margin-top: 0.5rem; }
      [data-prerendered-markdown="true"] nav li[aria-current="page"] a { font-weight: bold; color: #fff; }
    </style>
    <div data-prerendered-markdown="true">
      ${renderedHtml}
      ${navigationHtml}
    </div>
  </noscript>`;

			// Insert the noscript block before closing body tag
			html = html.replace("</body>", `${contentBlock}\n</body>`);
		}
	}

	return html;
}

/**
 * Generate all static pages
 */
async function generateSsg() {
	// Read the base index.html
	const indexPath = path.join(DIST_DIR, "index.html");
	if (!fs.existsSync(indexPath)) {
		console.error(
			`Error: index.html not found at ${indexPath}. Please run 'npm run build' first.`
		);
		process.exit(1);
	}

	const baseIndexHtml = fs.readFileSync(indexPath, "utf-8");
	const baseUrl = `https://${TARGET_HOST}`;

	// Create markdown processor
	const mdProcessor = createMarkdownProcessor();

	// Initialize i18next for translations
	await i18next.use(i18nextFsBackend).init({
		supportedLngs: SUPPORTED_LANGUAGES,
		preload: SUPPORTED_LANGUAGES,
		fallbackLng: "en",
		ns: ["translation"],
		defaultNS: "translation",
		backend: {
			loadPath: path.join(DIST_DIR, "assets/locales/{{lng}}/{{ns}}.json"),
		},
	});

	let generatedCount = 0;

	// Generate pages for each language
	for (const lang of SUPPORTED_LANGUAGES) {
		// Get translation function for this language
		const t = i18next.getFixedT(lang);

		// Root path
		const rootPath = lang === "en" ? "" : lang;
		const rootPageHtml = generatePage(baseIndexHtml, lang, "", baseUrl, mdProcessor, t);
		const rootDir = path.join(DIST_DIR, rootPath);
		fs.mkdirSync(rootDir, { recursive: true });
		fs.writeFileSync(path.join(rootDir, "index.html"), rootPageHtml);
		console.log(`✓ Generated ${lang === "en" ? "/" : "/" + lang}`);
		generatedCount++;

		// Generate dialog/page routes
		for (const dialog of KNOWN_DIALOGS) {
			const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
			const pageDir = path.join(DIST_DIR, pagePath);
			fs.mkdirSync(pageDir, { recursive: true });

			const pageHtml = generatePage(baseIndexHtml, lang, dialog, baseUrl, mdProcessor, t);
			fs.writeFileSync(path.join(pageDir, "index.html"), pageHtml);
			console.log(`✓ Generated /${pagePath}`);
			generatedCount++;
		}
	}

	console.log(`\n✅ Generated ${generatedCount} static pages`);
}

generateSsg().catch((err) => {
	console.error("Error generating SSG:", err);
	process.exit(1);
});
