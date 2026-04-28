/**
 * @file Static Site Generation script
 * Pre-renders all markdown pages as static HTML for better SEO.
 * Generates one HTML file per language/page combination.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import zlib from "zlib";
import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import { JSDOM } from "jsdom";
import * as prettier from "prettier";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../server/config.js";
import { seoMetadata } from "../shared/seo-metadata.js";
import { getLocalizedSchema } from "../shared/seo-schema.js";
import { createMarkdownProcessor } from "./markdown-processor.mjs";

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");
const FONTS_CSS_PATH = path.join(__dirname, "../src/assets/css/fonts.css");

// Map route names to markdown filenames when they differ
export const PAGE_TO_MARKDOWN_MAPPING = {
	translation: "translation-request",
	"": "home",
};

/**
 * Read markdown file from the locales directory.
 */
export function readMarkdownFile(lang, fileName) {
	const filePath = path.join(LOCALES_DIR, lang, `${fileName}.md`);

	if (fs.existsSync(filePath)) {
		return fs.readFileSync(filePath, "utf-8");
	}

	return null;
}

/**
 * Generate navigation links for the SSG page.
 */
export function generateNavigationLinks(lang, currentPage, t) {
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const pages = [
		{ path: "/", key: "seo.nav.home", descKey: "seo.navDescriptions.home" },
		{
			path: "/instructions",
			key: "seo.nav.instructions",
			descKey: "seo.navDescriptions.instructions",
		},
		{ path: "/about", key: "seo.nav.about", descKey: "seo.navDescriptions.about" },
		{ path: "/changelog", key: "seo.nav.changelog", descKey: "seo.navDescriptions.changelog" },
		{ path: "/userstats", key: "seo.nav.userstats", descKey: "seo.navDescriptions.userstats" },
		{
			path: "/translation",
			key: "seo.nav.translation",
			descKey: "seo.navDescriptions.translation",
		},
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
export function generateSeoTags(pathname, lang, baseUrl) {
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
		const langPath =
			l === "en" ? normalizePath(cleanPath || "/") : `/${l}${normalizePath(cleanPath || "/")}`;
		const langUrl = new URL(langPath, baseUrl).href;
		tags.push(`<link rel="alternate" hreflang="${l}" href="${langUrl}" />`);
	});

	// x-default hreflang (point to English)
	const xDefaultPath = normalizePath(cleanPath || "/");
	const xDefaultUrl = new URL(xDefaultPath, baseUrl).href;
	tags.push(`<link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`);

	return tags;
}

/**
 * Update meta tags in the HTML.
 * Handles attribute order variations correctly.
 */
function updateMetadata(document, metadata, t) {
	const appName = t("appName");
	const pageTitle = metadata ? t(metadata.titleKey, { defaultValue: appName }) : appName;

	document.title = pageTitle;

	if (!metadata) return pageTitle;

	const pageDescription = t(metadata.descriptionKey);
	const pageKeywords = t("seo.keywords", { defaultValue: "" });
	const ogImageAlt = t("seo.ogImageAlt", { defaultValue: "NMS Optimizer Screenshot" });

	const metaUpdates = [
		{ selector: 'meta[name="description"]', content: pageDescription, name: "description" },
		{ selector: 'meta[name="keywords"]', content: pageKeywords, name: "keywords" },
		{ selector: 'meta[property="og:title"]', content: pageTitle, property: "og:title" },
		{ selector: 'meta[property="og:site_name"]', content: appName, property: "og:site_name" },
		{ selector: 'meta[property="og:description"]', content: pageDescription, property: "og:description" },
		{ selector: 'meta[property="og:image:alt"]', content: ogImageAlt, property: "og:image:alt" },
		{ selector: 'meta[name="twitter:title"]', content: pageTitle, name: "twitter:title" },
		{ selector: 'meta[name="twitter:description"]', content: pageDescription, name: "twitter:description" },
		{ selector: 'meta[name="twitter:image:alt"]', content: ogImageAlt, name: "twitter:image:alt" },
	];

	metaUpdates.forEach(({ selector, content, name, property }) => {
		let el = document.querySelector(selector);

		if (!el) {
			el = document.createElement("meta");
			if (name) el.setAttribute("name", name);
			if (property) el.setAttribute("property", property);
			document.head.appendChild(el);
		}

		el.setAttribute("content", content);
	});

	return pageTitle;
}

/**
 * Inject SEO schemas (JSON-LD) and canonical/hreflang tags into the HTML head.
 */
function injectSeoSchemas(document, pathname, lang, baseUrl, t) {
	// 1. Remove old SEO tags
	const selectors = [
		'link[rel="canonical"]',
		'meta[property="og:url"]',
		'link[rel="alternate"][hreflang]',
		'script[type="application/ld+json"]',
	];
	selectors.forEach((s) => {
		document.querySelectorAll(s).forEach((el) => el.remove());
	});

	// 2. SEO Tag Injection
	const cleanPath = pathname === "/" ? "" : pathname;
	const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);
	const canonicalPath =
		lang === "en" ? normalizePath(cleanPath || "/") : `/${lang}${normalizePath(cleanPath || "/")}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;

	// Canonical
	const canonical = document.createElement("link");
	canonical.rel = "canonical";
	canonical.href = canonicalUrl;
	document.head.appendChild(canonical);

	// OG URL
	const ogUrl = document.createElement("meta");
	ogUrl.setAttribute("property", "og:url");
	ogUrl.setAttribute("content", canonicalUrl);
	document.head.appendChild(ogUrl);

	// Hreflang Tags
	SUPPORTED_LANGUAGES.forEach((l) => {
		const langPath =
			l === "en" ? normalizePath(cleanPath || "/") : `/${l}${normalizePath(cleanPath || "/")}`;
		const langUrl = new URL(langPath, baseUrl).href;
		const alt = document.createElement("link");
		alt.rel = "alternate";
		alt.hreflang = l;
		alt.href = langUrl;
		document.head.appendChild(alt);
	});

	// x-default hreflang (point to English)
	const xDefaultUrl = new URL(normalizePath(cleanPath || "/"), baseUrl).href;
	const xDefault = document.createElement("link");
	xDefault.rel = "alternate";
	xDefault.hreflang = "x-default";
	xDefault.href = xDefaultUrl;
	document.head.appendChild(xDefault);

	// 3. JSON-LD Schemas
	const schemas = getLocalizedSchema(t, lang, canonicalUrl);
	const schemaConfigs = [
		{ id: "software-schema", type: "SoftwareApplication" },
		{ id: "website-schema", type: "WebSite" },
		{ id: "org-schema", type: "Organization" },
		{ id: "breadcrumb-schema", type: "BreadcrumbList" },
	];

	schemaConfigs.forEach((config) => {
		const data = schemas.find((s) => s["@type"] === config.type);

		if (data) {
			const script = document.createElement("script");
			script.type = "application/ld+json";
			script.id = config.id;
			script.textContent = JSON.stringify(data);
			document.head.appendChild(script);
		}
	});
}

/**
 * Inject SSG content into the HTML body.
 * Returns the real noscript block HTML to be used for post-serialization replacement.
 */
function injectSsgContent(document, lang, pageName, pageTitle, mdProcessor, t, ssgStyles, ssgHeader) {
	const markdownFileName = PAGE_TO_MARKDOWN_MAPPING[pageName] || pageName;
	const markdownContent = readMarkdownFile(lang, markdownFileName);

	// STRIP OLD NOSCRIPT BLOCKS FROM BODY TO PREVENT DUPLICATES
	// We preserve noscript tags in head (e.g. background styles)
	document.body.querySelectorAll("noscript").forEach((el) => el.remove());

	// Ensure #root exists
	let root = document.getElementById("root");

	if (!root) {
		root = document.createElement("div");
		root.id = "root";
		document.body.appendChild(root);
	}

	if (markdownContent) {
		let renderedHtml = mdProcessor(markdownContent);
		const navigationHtml = generateNavigationLinks(lang, pageName, t);

		// Synchronize the first H1 with the actual page title
		const h1Regex = /<h1[^>]*?>([\s\S]*?)<\/h1>/i;

		if (h1Regex.test(renderedHtml)) {
			renderedHtml = renderedHtml.replace(h1Regex, `<h1>${pageTitle}</h1>`);
		} else {
			renderedHtml = `<h1>${pageTitle}</h1>\n${renderedHtml}`;
		}

		const realNoscript = `<noscript>
    <main>
      ${ssgHeader}
      ${renderedHtml}
      ${navigationHtml}
    </main>
    <style>
      ${ssgStyles}
    </style>
  </noscript>`;

		// Using JSDOM's innerHTML on noscript tags often causes unwanted encoding
		// because noscript is handled as a special CDATA-like container in many parsers.
		// We'll use a placeholder and replace it after serialization to be 100% safe.
		const placeholder = document.createElement("div");
		placeholder.id = "ssg-noscript-placeholder";
		root.insertAdjacentElement("afterend", placeholder);

		return realNoscript;
	}

	return null;
}

/**
 * Generate a complete HTML page.
 */
export function generatePage(
	indexHtml,
	lang,
	pageName,
	baseUrl,
	mdProcessor,
	t,
	ssgStyles = "",
	ssgHeader = ""
) {
	const dom = new JSDOM(indexHtml);
	const { document } = dom.window;

	const htmlEl = document.querySelector("html");
	if (htmlEl) htmlEl.setAttribute("lang", lang);

	const pathname = pageName === "" ? "/" : `/${pageName}/`;

	// 1. Metadata updates
	const metadata = seoMetadata[pathname];
	const pageTitle = updateMetadata(document, metadata, t);

	// 2. SEO Tag and Schema Injection
	injectSeoSchemas(document, pathname, lang, baseUrl, t);

	// 3. SSG Content Injection (Injects placeholder)
	const realNoscript = injectSsgContent(
		document,
		lang,
		pageName,
		pageTitle,
		mdProcessor,
		t,
		ssgStyles,
		ssgHeader
	);

	let serialized = dom.serialize();

	// 4. Post-processing: Replace placeholder with real <noscript> block
	// This avoids JSDOM encoding issues within <noscript>
	if (realNoscript && serialized.includes('id="ssg-noscript-placeholder"')) {
		serialized = serialized.replace(
			/<div id="ssg-noscript-placeholder"><\/div>/,
			realNoscript
		);
	}

	return serialized;
}

/**
 * Extract SSG template blocks from source index.html
 */
export function extractSsgTemplate(sourceIndexHtml) {
	const sourceSsgBlockMatch = sourceIndexHtml.match(
		/<noscript\s+[^>]*?data-ssg-template[^>]*?>([\s\S]*?)<\/noscript>/
	);
	if (!sourceSsgBlockMatch) return { ssgStyles: "", ssgHeader: "" };

	const sourceSsgBlock = sourceSsgBlockMatch[1];

	const ssgStyleMatch = sourceSsgBlock.match(/<style[^>]*?>([\s\S]*?)<\/style>/);
	const ssgStyles = ssgStyleMatch ? ssgStyleMatch[1].trim() : "";

	const ssgHeaderMatch = sourceSsgBlock.match(
		/(<header[^>]*?class="app-header-static"[^>]*?>[\s\S]*?<\/header>)/
	);
	const ssgHeader = ssgHeaderMatch ? ssgHeaderMatch[1].trim() : "";

	return { ssgStyles, ssgHeader };
}

/**
 * Initialize i18next instance for SSG
 */
export async function initI18n() {
	const i18nInstance = i18next.createInstance();
	await i18nInstance.use(i18nextFsBackend).init({
		supportedLngs: SUPPORTED_LANGUAGES,
		preload: SUPPORTED_LANGUAGES,
		fallbackLng: "en",
		ns: ["translation"],
		defaultNS: "translation",
		backend: {
			loadPath: path.join(LOCALES_DIR, "{{lng}}/{{ns}}.json"),
		},
	});

	return i18nInstance;
}

/**
 * Compresses a file using Gzip and Brotli.
 * Keeps .gz and .br versions in sync with the updated source file.
 */
async function compressFile(filePath) {
	if (!fs.existsSync(filePath)) return;

	const content = fs.readFileSync(filePath);

	// Gzip
	const gzipped = await gzip(content);
	fs.writeFileSync(`${filePath}.gz`, gzipped);

	// Brotli
	const brotlied = await brotli(content);
	fs.writeFileSync(`${filePath}.br`, brotlied);
}

/**
 * Update the source index.html noscript block with content from home.md.
 * Ensures home.md is the single source of truth for the root route.
 */
export async function updateIndexHtmlTemplate(mdProcessor, t) {
	const indexPath = path.join(__dirname, "../index.html");
	if (!fs.existsSync(indexPath)) return;

	const sourceIndexHtml = fs.readFileSync(indexPath, "utf-8");
	const markdownContent = readMarkdownFile("en", "home");

	if (!markdownContent) return;

	const renderedHtml = mdProcessor(markdownContent);
	const navigationHtml = generateNavigationLinks("en", "", t);
	const appName = t("appName");

	// Synchronize the first H1 with the actual app name/title
	let finalRendered = renderedHtml;
	const h1Regex = /<h1[^>]*?>([\s\S]*?)<\/h1>/i;

	if (h1Regex.test(finalRendered)) {
		finalRendered = finalRendered.replace(h1Regex, `<h1>${appName}</h1>`);
	} else {
		finalRendered = `<h1>${appName}</h1>\n${finalRendered}`;
	}

	const dom = new JSDOM(sourceIndexHtml);
	const { document } = dom.window;

	const ssgTemplate = document.querySelector('noscript[data-ssg-template]');

	if (ssgTemplate) {
		const main = ssgTemplate.querySelector('main');

		if (main) {
			// We want to preserve the header, but replace the content sections and navigation
			const header = main.querySelector('.app-header-static');
			const headerHtml = header ? header.outerHTML : '';

			main.innerHTML = `
			${headerHtml}
			${finalRendered}
			${navigationHtml}
		`;
		}
	}

	const updatedHtml = dom.serialize();
	const prettierConfig = (await prettier.resolveConfig(indexPath)) || {};
	const formattedHtml = await prettier.format(updatedHtml, {
		...prettierConfig,
		parser: "html",
	});

	fs.writeFileSync(indexPath, formattedHtml);
	console.log("✓ Synchronized home.md content to index.html noscript block");
	}

/**
 * Generate all static pages
 */
export async function generateSsg() {
	const mdProcessor = createMarkdownProcessor();
	const i18nInstance = await initI18n();
	const tEn = i18nInstance.getFixedT("en", "translation");

	// 1. Sync home.md to source index.html and dist/index.html FIRST
	await updateIndexHtmlTemplate(mdProcessor, tEn);

	// Now read the freshly updated files from disk
	const indexPath = path.join(DIST_DIR, "index.html");

	if (!fs.existsSync(indexPath)) {
		console.error(`Error: index.html not found at ${indexPath}. Please run 'npm run build' first.`);
		process.exit(1);
	}

	const baseIndexHtml = fs.readFileSync(indexPath, "utf-8");
	const sourceIndexHtml = fs.readFileSync(path.join(__dirname, "../index.html"), "utf-8");
	const baseUrl = `https://${TARGET_HOST}`;

	// Extract template blocks from the updated source HTML
	const template = extractSsgTemplate(sourceIndexHtml);
	const ssgHeader = template.ssgHeader;
	let ssgStyles = template.ssgStyles;

	// --- FONT FIX: Extract from source fonts.css ---
	if (fs.existsSync(FONTS_CSS_PATH)) {
		const fontsCss = fs.readFileSync(FONTS_CSS_PATH, "utf-8");
		ssgStyles = fontsCss + "\n" + ssgStyles;
		console.log("✓ Included fonts from src/assets/css/fonts.css");
	}

	const prettierConfig =
		(await prettier.resolveConfig(path.join(__dirname, "../.prettierrc.cjs"))) || {};

	// Diagnostic: Verify translations are loaded
	console.log("\n--- i18n Initialization Check ---");

	for (const lang of SUPPORTED_LANGUAGES) {
		const testT = i18nInstance.getFixedT(lang, "translation");
		const testValue = testT("appName");
		const isLoaded = testValue && testValue !== "appName";
		console.log(`${isLoaded ? "✓" : "✗"} Language [${lang}]: appName = "${testValue}"`);

		if (!isLoaded) {
			console.warn(`  WARNING: Translations for [${lang}] failed to load correctly.`);
		}
	}

	console.log("---------------------------------\n");

	let generatedCount = 0;

	for (const lang of SUPPORTED_LANGUAGES) {
		const t = i18nInstance.getFixedT(lang, "translation");
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
		const rootFile = path.join(rootDir, "index.html");
		fs.writeFileSync(rootFile, formattedRootHtml);
		await compressFile(rootFile);
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
			const pageFile = path.join(pageDir, "index.html");
			fs.writeFileSync(pageFile, formattedPageHtml);
			await compressFile(pageFile);
			console.log(`✓ Generated /${pagePath}`);
			generatedCount++;
		}
	}

	console.log(`\n✅ Generated ${generatedCount} static pages`);
}

// Only run if executed directly
if (import.meta.url === `file://${fileURLToPath(import.meta.url)}` && process.argv[1] === fileURLToPath(import.meta.url)) {
	generateSsg().catch((err) => {
		console.error("Error generating SSG:", err);
		process.exit(1);
	});
}
