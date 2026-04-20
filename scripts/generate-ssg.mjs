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
import * as prettier from "prettier";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../server/config.js";
import { seoMetadata } from "../shared/seo-metadata.js";
import { getLocalizedSchema } from "../shared/seo-schema.js";
import { createMarkdownProcessor } from "./markdown-processor.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");
const FONTS_CSS_PATH = path.join(__dirname, "../src/assets/css/fonts.css");

// Map route names to markdown filenames when they differ
const PAGE_TO_MARKDOWN_MAPPING = {
	translation: "translation-request",
	"": "home",
};

/**
 * Read markdown file from the locales directory.
 */
function readMarkdownFile(lang, fileName) {
	const filePath = path.join(LOCALES_DIR, lang, `${fileName}.md`);
	if (fs.existsSync(filePath)) {
		return fs.readFileSync(filePath, "utf-8");
	}
	return null;
}

/**
 * Generate navigation links for the SSG page.
 */
function generateNavigationLinks(lang, currentPage, t) {
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const pages = [
		{ path: "/", key: "seo.nav.home", descKey: "seo.navDescriptions.home" },
		{ path: "/instructions", key: "seo.nav.instructions", descKey: "seo.navDescriptions.instructions" },
		{ path: "/about", key: "seo.nav.about", descKey: "seo.navDescriptions.about" },
		{ path: "/changelog", key: "seo.nav.changelog", descKey: "seo.navDescriptions.changelog" },
		{ path: "/userstats", key: "seo.nav.userstats", descKey: "seo.navDescriptions.userstats" },
		{ path: "/translation", key: "seo.nav.translation", descKey: "seo.navDescriptions.translation" },
		{ path: "/privacy", key: "seo.nav.privacy", descKey: "seo.navDescriptions.privacy" },
	];

	const links = pages
		.map(({ path, key, descKey }) => {
			const href = path === "/" ? langPrefix || "/" : `${langPrefix}${path}/`;
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
 * Generate SEO tags for the SSG page.
 */
function generateSeoTags(pathname, lang, baseUrl) {
	const tags = [];
	const cleanPath = pathname === "/" ? "" : pathname;
	const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);

	// Canonical URL
	const canonicalPath =
		lang === "en" ? normalizePath(cleanPath || "/") : `/${lang}${normalizePath(cleanPath || "/")}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;

	tags.push(`<link rel="canonical" href="${canonicalUrl}" />`);
	tags.push(`<meta property="og:url" content="${canonicalUrl}" />`);

	// Hreflang Tags
	SUPPORTED_LANGUAGES.forEach((l) => {
		const langPath = l === "en" ? normalizePath(cleanPath || "/") : `/${l}${normalizePath(cleanPath || "/")}`;
		const langUrl = new URL(langPath, baseUrl).href;
		tags.push(`<link rel="alternate" hreflang="${l}" href="${langUrl}" />`);
	});

	// x-default hreflang (point to English)
	const xDefaultPath = normalizePath(cleanPath || "/");
	const xDefaultUrl = new URL(xDefaultPath, baseUrl).href;
	tags.push(`<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`);

	return tags;
}

const ssgStyles = `
  .app-header-static { text-align: center; margin-bottom: 2rem; }
  .app-header-static h1 { margin: 0; font-size: 2rem; color: #4cc9f0; }
  .app-header-static p { margin: 0.5rem 0 0; font-style: italic; opacity: 0.8; }
  main { max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
  nav { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #333; }
  nav ul { list-style: none; padding: 0; }
  nav li { margin-bottom: 0.5rem; }
  nav a { color: #4cc9f0; text-decoration: none; }
  nav a:hover { text-decoration: underline; }
`;

/**
 * Generate a complete HTML page.
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
	let html = indexHtml;
	html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);

	const pathname = pageName === "" ? "/" : `/${pageName}/`;
	const isRootPage = pageName === "";

	// 1. Metadata updates (Aggressive multiline regex to catch all attribute orders)
	const metadata = seoMetadata[pathname];
	if (metadata) {
		const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });
		const pageDescription = t(metadata.descriptionKey);
		const pageKeywords = t("seo.keywords", { defaultValue: "" });
		const ogImageAlt = t("seo.ogImageAlt", { defaultValue: "NMS Optimizer Screenshot" });

		html = html
			.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
			// description
			.replace(
				/<meta\s+name="description"[\s\S]*?\/?>/i,
				`<meta name="description" content="${pageDescription}" />`
			)
			// keywords
			.replace(
				/<meta\s+name="keywords"[\s\S]*?\/?>/i,
				`<meta name="keywords" content="${pageKeywords}" />`
			)
			// og:title
			.replace(
				/<meta\s+property="og:title"[\s\S]*?\/?>/i,
				`<meta property="og:title" content="${pageTitle}" />`
			)
			// og:description
			.replace(
				/<meta\s+property="og:description"[\s\S]*?\/?>/i,
				`<meta property="og:description" content="${pageDescription}" />`
			)
			// og:image:alt
			.replace(
				/<meta\s+property="og:image:alt"[\s\S]*?\/?>/i,
				`<meta property="og:image:alt" content="${ogImageAlt}" />`
			)
			// twitter:title
			.replace(
				/<meta\s+name="twitter:title"[\s\S]*?\/?>/i,
				`<meta name="twitter:title" content="${pageTitle}" />`
			)
			// twitter:description
			.replace(
				/<meta\s+name="twitter:description"[\s\S]*?\/?>/i,
				`<meta name="twitter:description" content="${pageDescription}" />`
			)
			// twitter:image:alt
			.replace(
				/<meta\s+name="twitter:image:alt"[\s\S]*?\/?>/i,
				`<meta name="twitter:image:alt" content="${ogImageAlt}" />`
			);
	}

	// 2. Cleanup old SEO tags that we will re-inject fresh
	html = html.replace(/<link\s+rel="canonical"[\s\S]*?\/?>/g, "");
	html = html.replace(/<meta\s+property="og:url"[\s\S]*?\/?>/g, "");
	html = html.replace(/<link\s+rel="alternate"\s+hreflang="[\s\S]*?\/?>/g, "");
	// Remove all JSON-LD script tags (with or without IDs) to ensure a clean slate
	html = html.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, "");

	// 3. SEO Tag Injection
	const seoTags = generateSeoTags(pathname, lang, baseUrl);
	const cleanPath = pathname === "/" ? "" : pathname;
	const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);
	const canonicalPath =
		lang === "en" ? normalizePath(cleanPath || "/") : `/${lang}${normalizePath(cleanPath || "/")}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;

	const schemas = getLocalizedSchema(t, lang, canonicalUrl);
	const schemaInjections = [
		{ id: "software-schema", type: "SoftwareApplication" },
		{ id: "website-schema", type: "WebSite" },
		{ id: "org-schema", type: "Organization" },
		{ id: "breadcrumb-schema", type: "BreadcrumbList" },
	]
		.map((item) => {
			const data = schemas.find((s) => s["@type"] === item.type);
			// Use small indent for readable JSON inside the tag
			return data
				? `<script type="application/ld+json" id="${item.id}">${JSON.stringify(data)}</script>`
				: "";
		})
		.filter(Boolean);

	if (isRootPage) {
		const faqData = schemas.find((s) => s["@type"] === "FAQPage");
		if (faqData) {
			schemaInjections.push(
				`<script type="application/ld+json" id="faq-schema">${JSON.stringify(faqData)}</script>`
			);
		}
	}

	// Use tabs (\t) for indentation to match index.html style
	let headInjections = `\n\t${seoTags.join("\n\t")}\n\t${schemaInjections.join("\n\t")}`;

	if (html.includes("</head>")) {
		html = html.replace("</head>", `${headInjections}\n</head>`);
	} else if (html.includes("<body")) {
		html = html.replace("<body", `${headInjections}\n<body`);
	}

	// 4. SSG Content Injection
	const markdownFileName = PAGE_TO_MARKDOWN_MAPPING[pageName] || pageName;
	const markdownContent = readMarkdownFile(lang, markdownFileName);

	// STRIP ALL NOSCRIPT BLOCKS TO PREVENT DUPLICATES
	html = html.replace(/<noscript[\s\S]*?<\/noscript>/g, "");

	if (markdownContent) {
		const renderedHtml = mdProcessor(markdownContent);
		const navigationHtml = generateNavigationLinks(lang, pageName, t);

		const contentBlock = `<noscript>
    <main>
      ${ssgHeader}
      ${renderedHtml}
      ${navigationHtml}
    </main>
    <style>
      ${ssgStyles}
    </style>
  </noscript>`;

		if (html.includes('<div id="root"></div>')) {
			html = html.replace('<div id="root"></div>', `<div id="root"></div>\n  ${contentBlock}`);
		} else {
			html += contentBlock;
		}
	}

	if (!html.includes('id="root"')) {
		html = html.replace(/<body[^>]*?>/, (match) => `${match}\n<div id="root"></div>`);
	}

	return html;
}

/**
 * Generate all static pages
 */
async function generateSsg() {
	const indexPath = path.join(DIST_DIR, "index.html");
	if (!fs.existsSync(indexPath)) {
		console.error(`Error: index.html not found at ${indexPath}. Please run 'npm run build' first.`);
		process.exit(1);
	}

	const baseIndexHtml = fs.readFileSync(indexPath, "utf-8");
	const baseUrl = `https://${TARGET_HOST}`;

	// Extract template blocks
	const ssgBlockMatch = baseIndexHtml.match(
		/<noscript(?: [^>]*?)?>([\s\S]*?<header class="app-header-static">[\s\S]*?)<\/noscript>/
	);
	const ssgBlock = ssgBlockMatch ? ssgBlockMatch[1] : "";

	const ssgStyleMatch = ssgBlock.match(/<style>([\s\S]*?)<\/style>/);
	let ssgStyles = ssgStyleMatch ? ssgStyleMatch[1].trim() : "";

	const ssgHeaderMatch = ssgBlock.match(/(<header class="app-header-static">[\s\S]*?<\/header>)/);
	const ssgHeader = ssgHeaderMatch ? ssgHeaderMatch[1].trim() : "";

	// --- FONT FIX: Extract from source fonts.css ---
	if (fs.existsSync(FONTS_CSS_PATH)) {
		const fontsCss = fs.readFileSync(FONTS_CSS_PATH, "utf-8");
		ssgStyles = fontsCss + "\n" + ssgStyles;
		console.log("✓ Included fonts from src/assets/css/fonts.css");
	}

	const mdProcessor = createMarkdownProcessor();
	const prettierConfig = (await prettier.resolveConfig(path.join(__dirname, "../.prettierrc.cjs"))) || {};

	await i18next.use(i18nextFsBackend).init({
		supportedLngs: SUPPORTED_LANGUAGES,
		preload: SUPPORTED_LANGUAGES,
		fallbackLng: "en",
		ns: ["translation"],
		defaultNS: "translation",
		backend: {
			loadPath: path.join(LOCALES_DIR, "{{lng}}/{{ns}}.json"),
		},
	});

	let generatedCount = 0;

	for (const lang of SUPPORTED_LANGUAGES) {
		const t = i18next.getFixedT(lang);
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
		const formattedRootHtml = await prettier.format(rootPageHtml, {
			...prettierConfig,
			parser: "html",
		});
		const rootDir = path.join(DIST_DIR, rootPath);
		fs.mkdirSync(rootDir, { recursive: true });
		fs.writeFileSync(path.join(rootDir, "index.html"), formattedRootHtml);
		console.log(`✓ Generated ${lang === "en" ? "/" : "/" + lang}`);
		generatedCount++;

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
			const formattedPageHtml = await prettier.format(pageHtml, {
				...prettierConfig,
				parser: "html",
			});
			fs.writeFileSync(path.join(pageDir, "index.html"), formattedPageHtml);
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
