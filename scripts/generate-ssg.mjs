/**
 * @file Static Site Generation script
 * Pre-renders all markdown pages as static HTML for better SEO.
 * Generates one HTML file per language/page combination.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createMarkdownProcessor } from "./markdown-processor.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

// Configuration from server/config.js
const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt"];
const KNOWN_DIALOGS = ["about", "instructions", "changelog", "translation", "userstats"];
const BASE_KNOWN_PATHS = ["/"];

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
 * Generate a page with markdown content
 */
function generatePage(indexHtml, lang, pageName, baseUrl, mdProcessor) {
	let html = indexHtml;
	const pathname = pageName === "" ? "/" : `/${pageName}`;
	const isRootPage = pageName === "";

	// For non-root pages, remove the <main> element since they have markdown content
	if (!isRootPage) {
		html = html.replace(/<main[^>]*>[\s\S]*?<\/main>/i, "");
	}

	// Generate SEO tags
	const seoTags = generateSeoTags(pathname, lang, baseUrl);

	// Inject SEO tags before closing </head>
	html = html.replace("</head>", `  ${seoTags.join("\n  ")}\n</head>`);

	// Read and render markdown content for pre-rendering
	if (pageName) {
		const markdownContent = readMarkdownFile(lang, pageName);
		
		if (markdownContent) {
			// Render markdown to HTML
			const renderedHtml = mdProcessor(markdownContent);
			
			// Create a div with the rendered markdown with styling
			const prerenderedContent = `
  <style>
    [data-prerendered-markdown="true"] { color: #fff; padding: 2rem; }
    [data-prerendered-markdown="true"] h2 { color: #0ba5e9; margin: 1.5rem 0 1rem 0; font-size: 1.125rem; font-weight: bold; }
    [data-prerendered-markdown="true"] h3 { color: #0ba5e9; margin: 1rem 0 0.75rem 0; font-size: 1rem; font-weight: bold; }
    [data-prerendered-markdown="true"] p { margin-bottom: 0.5rem; line-height: 1.6; }
    [data-prerendered-markdown="true"] ul { list-style: disc; margin: 0.5rem 0 0.5rem 1.5rem; }
    [data-prerendered-markdown="true"] ol { list-style: decimal; margin: 0.5rem 0 0.5rem 1.5rem; }
    [data-prerendered-markdown="true"] li { margin-bottom: 0.25rem; }
    [data-prerendered-markdown="true"] a { color: #0ba5e9; text-decoration: underline; }
    [data-prerendered-markdown="true"] code { background-color: rgba(0, 162, 199, 0.1); padding: 0.125rem 0.25rem; border-radius: 0.25rem; color: #0ba5e9; }
    [data-prerendered-markdown="true"] blockquote { border-left: 4px solid #0ba5e9; padding-left: 1rem; margin: 0.5rem 0; font-style: italic; color: #cbd5e1; }
  </style>
  <div data-prerendered-markdown="true">
    ${renderedHtml}
  </div>`;

			html = html.replace("</body>", `${prerenderedContent}\n</body>`);
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
	const baseUrl = "https://nms-optimizer.app";
	
	// Create markdown processor
	const mdProcessor = createMarkdownProcessor();

	let generatedCount = 0;

	// Generate pages for each language
	SUPPORTED_LANGUAGES.forEach((lang) => {
		// Root path
		const rootPath = lang === "en" ? "" : lang;
		const rootPageHtml = generatePage(baseIndexHtml, lang, "", baseUrl, mdProcessor);
		const rootDir = path.join(DIST_DIR, rootPath);
		fs.mkdirSync(rootDir, { recursive: true });
		fs.writeFileSync(path.join(rootDir, "index.html"), rootPageHtml);
		console.log(`✓ Generated ${lang === "en" ? "/" : "/" + lang}`);
		generatedCount++;

		// Generate dialog/page routes
		KNOWN_DIALOGS.forEach((dialog) => {
			const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
			const pageDir = path.join(DIST_DIR, pagePath);
			fs.mkdirSync(pageDir, { recursive: true });

			const pageHtml = generatePage(baseIndexHtml, lang, dialog, baseUrl, mdProcessor);
			fs.writeFileSync(path.join(pageDir, "index.html"), pageHtml);
			console.log(`✓ Generated /${pagePath}`);
			generatedCount++;
		});
	});

	console.log(`\n✅ Generated ${generatedCount} static pages`);
}

generateSsg().catch((err) => {
	console.error("Error generating SSG:", err);
	process.exit(1);
});
