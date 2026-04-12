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

// Map route names to markdown filenames when they differ
const PAGE_TO_MARKDOWN_MAPPING = {
	translation: "translation-request",
	"": "home",
};

/**
 * Read markdown file from the locales directory.
 *
 * @param {string} lang - The language code (e.g., 'en', 'es').
 * @param {string} fileName - The name of the markdown file (without extension).
 * @returns {string} The content of the markdown file, or an empty string if not found.
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
 * Generate SEO tags for a page.
 *
 * @param {string} pathname - The URL path of the page (e.g., '/', '/about').
 * @param {string} lang - The language code for the page.
 * @param {string} baseUrl - The base URL of the site.
 * @returns {string[]} An array of HTML link and meta tag strings.
 */
function generateSeoTags(pathname, lang, baseUrl) {
	const tags = [];

	// Canonical URL
	const canonicalPath = lang === "en" ? pathname : `/${lang}${pathname === "/" ? "/" : pathname}`;
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
		const langUrl = new URL(`/${langCode}${cleanPath || "/"}`, baseUrl).href;
		tags.push(`<link rel="alternate" hreflang="${langCode}" href="${langUrl}" />`);
	});

	return tags;
}

/**
 * Generate internal navigation links for SEO.
 *
 * @param {string} lang - The language code for the links.
 * @param {string} currentPage - The name of the current page.
 * @param {Function} t - The i18next translation function.
 * @returns {string} HTML string containing the navigation section.
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
 * Generate a complete HTML page with pre-rendered content and SEO tags.
 *
 * @remarks
 * This function is the core of the SSG process. It takes the base template,
 * injects page-specific metadata, SEO tags, and pre-rendered markdown content
 * within a `<noscript>` block for better search engine indexing of SPA content.
 *
 * It also handles the conditional injection of the `FAQPage` structured data
 * only for the root page.
 *
 * @param {string} indexHtml - The base HTML template from `index.html`.
 * @param {string} lang - The language code for the page.
 * @param {string} pageName - The name of the page to generate (e.g., '', 'about').
 * @param {string} baseUrl - The base URL for canonical and social tags.
 * @param {Function} mdProcessor - A function that converts markdown to HTML.
 * @param {Function} t - The i18next translation function.
 * @param {string} [ssgStyles=""] - Optional CSS to include in the noscript block.
 * @param {string} [ssgHeader=""] - Optional HTML header for the noscript block.
 * @returns {string} The fully assembled HTML page.
 */
function generatePage(
	indexHtml,
	lang,
	pageName,
	baseUrl,
	mdProcessor,
	t,
	ssgStyles = "",
	ssgHeader = ""
) {
	let html = indexHtml.replace(/<html lang="[^"]*">/, `<html lang="${lang}">`);
	const pathname = pageName === "" ? "/" : `/${pageName}`;
	const isRootPage = pageName === "";

	// Remove noscript blocks from the template
	// We only remove the original background noscript if it's in the body,
	// but generatePage will handle inserting the new content.
	html = html.replace(/<noscript data-ssg-template>[\s\S]*?<\/noscript>/g, "");

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

	// --- Dynamic Structured Data (FAQ) ---
	// In the template index.html, we have a base JSON-LD in <script type="application/ld+json">.
	// We need to either keep it (for root) or strip the FAQPage item from it (for other pages).
	// However, since we now handle FAQPage dynamically in the client, 
	// we should ensure the SSG also only includes it when appropriate.
	if (!isRootPage) {
		// Strip the FAQPage object from the @graph array if it exists in the template.
		// Note: The template now has FAQPage removed, so it's mostly a safety measure 
		// if the template still had it. Since I removed it from index.html, 
		// we don't need to strip it, but we SHOULD inject the dynamic one for the root page 
		// so it's present in the static HTML for crawlers.
	}

	if (isRootPage) {
		const faqSchema = {
			"@context": "https://schema.org",
			"@type": "FAQPage",
			"@id": `${baseUrl}/#faqpage`,
			"name": t("faq.name", "NMS Optimizer Frequently Asked Questions"),
			"mainEntity": [
				{
					"@type": "Question",
					"name": t("faq.questions.adjacencyBonus.name", "What is an adjacency bonus in No Man's Sky?"),
					"acceptedAnswer": {
						"@type": "Answer",
						"text": t("faq.questions.adjacencyBonus.answer", "When you place compatible technology modules next to each other in No Man's Sky, they get a stat boost. Modules of the same type that share an edge get a percentage increase to their stats. The more edges shared, the bigger the bonus. Figuring out the right arrangement by hand is tedious, especially on larger grids with supercharged slots.")
					}
				},
				{
					"@type": "Question",
					"name": t("faq.questions.superchargedSlots.name", "What are supercharged slots in No Man's Sky?"),
					"acceptedAnswer": {
						"@type": "Answer",
						"text": t("faq.questions.superchargedSlots.answer", "Some inventory slots in No Man's Sky are supercharged. Any technology module placed in one gets a large stat multiplier on top of normal adjacency bonuses. They're randomly placed on each piece of gear, so the optimal layout changes depending on where your supercharged slots landed.")
					}
				},
				{
					"@type": "Question",
					"name": t("faq.questions.calculation.name", "How does NMS Optimizer calculate the best technology layout?"),
					"acceptedAnswer": {
						"@type": "Answer",
						"text": t("faq.questions.calculation.answer", "The optimizer uses a combination of deterministic pattern matching and simulated annealing. For smaller module sets it can find the exact best layout. For larger or more complex grids, simulated annealing explores thousands of arrangements to find one that scores as high as possible. The scoring accounts for adjacency bonuses, supercharged slot placement, and module-specific stat weights. The backend runs in Rust for speed.")
					}
				},
				{
					"@type": "Question",
					"name": t("faq.questions.platforms.name", "What platforms does NMS Optimizer support?"),
					"acceptedAnswer": {
						"@type": "Answer",
						"text": t("faq.questions.platforms.answer", "NMS Optimizer supports Starships (standard, sentinel, solar, fighter, living, atlantid), Corvettes, Multitools (standard and sentinel), Exosuits, Exocraft (roamer, pilgrim, nomad, colossus, minotaur, nautilon), and Freighters.")
					}
				}
			]
		};

		const faqScript = `\n  <script type="application/ld+json" id="faq-schema">${JSON.stringify(faqSchema)}</script>`;
		html = html.replace("</head>", `${faqScript}\n</head>`);
	}

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
    <main>
      ${ssgHeader}
      ${renderedHtml}
      ${navigationHtml}
    </main>
    <style>
      ${ssgStyles || 'main { color: #fff; padding: 2rem; font-family: Raleway, sans-serif; }'}
    </style>
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

	// --- CSS & Header Extraction ---
	// Extract the <style> and <header> content from the specific noscript block in index.html body
	// We look for the one with data-ssg-template to avoid matching the head's background noscript
	const ssgBlockMatch = baseIndexHtml.match(/<noscript data-ssg-template>([\s\S]*?)<\/noscript>/);
	const ssgBlock = ssgBlockMatch ? ssgBlockMatch[1] : "";

	const ssgStyleMatch = ssgBlock.match(/<style>([\s\S]*?)<\/style>/);
	const ssgStyles = ssgStyleMatch ? ssgStyleMatch[1].trim() : "";

	const ssgHeaderMatch = ssgBlock.match(/(<header class="app-header-static">[\s\S]*?<\/header>)/);
	const ssgHeader = ssgHeaderMatch ? ssgHeaderMatch[1].trim() : "";

	if (!ssgStyles) {
		console.warn("⚠️  Warning: Could not extract SSG styles from index.html. Using fallback styles.");
	}
	if (!ssgHeader) {
		console.warn("⚠️  Warning: Could not extract static header from index.html.");
	}

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
		const rootPageHtml = generatePage(
			baseIndexHtml,
			lang,
			"",
			baseUrl,
			mdProcessor,
			t,
			ssgStyles,
			ssgHeader
		);
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

			const pageHtml = generatePage(
				baseIndexHtml,
				lang,
				dialog,
				baseUrl,
				mdProcessor,
				t,
				ssgStyles,
				ssgHeader
			);
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
