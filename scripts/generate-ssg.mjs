/**
 * @file Static Site Generation script (Bun Optimized)
 * Pre-renders all markdown pages as static HTML for better SEO.
 * Uses Bun's native HTMLRewriter for maximum performance.
 */

import path from "node:path";
import fs from "node:fs/promises";
import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../shared/config.js";
import { seoMetadata } from "../shared/seo-metadata.js";
import { getLocalizedSchema, getOgLocale, OG_LOCALE_MAP } from "../shared/seo-schema.js";
import { createMarkdownProcessor } from "./markdown-processor.mjs";

const DIST_DIR = path.resolve("dist");
const LOCALES_DIR = path.resolve("public/assets/locales");
const FONTS_CSS_PATH = path.resolve("src/assets/css/fonts.css");

// Map route names to markdown filenames when they differ
export const PAGE_TO_MARKDOWN_MAPPING = {
	"": "home",
	translation: "translation-request",
};

/**
 * Extract SSG template blocks from source index.html
 */
export async function extractSsgTemplate(sourceIndexHtml) {
	const sourceSsgBlockMatch = sourceIndexHtml.match(
		/<main\s+[^>]*?class="ssg-fallback"[^>]*?data-ssg-template[^>]*?>([\s\S]*?)<\/main>/
	);
	if (!sourceSsgBlockMatch) return { ssgHeader: "" };

	const sourceSsgBlock = sourceSsgBlockMatch[1];

	const ssgHeaderMatch = sourceSsgBlock.match(
		/(<header[^>]*?class="app-header-static"[^>]*?>[\s\S]*?<\/header>)/
	);
	const ssgHeader = ssgHeaderMatch ? ssgHeaderMatch[1].trim() : "";

	return { ssgHeader };
}

/**
 * Generate navigation links for the SSG page.
 */
export function generateNavigationLinks(lang, currentPage, t) {
	const isDocker = process.env.VITE_DOCKER === "true" || process.env.DOCKER === "true";
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const pages = [
		{ descKey: "seo.navDescriptions.home", key: "seo.nav.home", path: "/" },
		{
			descKey: "seo.navDescriptions.instructions",
			key: "seo.nav.instructions",
			path: "/instructions",
		},
		{ descKey: "seo.navDescriptions.about", key: "seo.nav.about", path: "/about" },
		{ descKey: "seo.navDescriptions.changelog", key: "seo.nav.changelog", path: "/changelog" },
		...(!isDocker
			? [{ descKey: "seo.navDescriptions.userstats", key: "seo.nav.userstats", path: "/userstats" }]
			: []),
		{
			descKey: "seo.navDescriptions.translation",
			key: "seo.nav.translation",
			path: "/translation",
		},
		{ descKey: "seo.navDescriptions.privacy", key: "seo.nav.privacy", path: "/privacy" },
	];

	const links = pages
		.map(({ descKey, key, path }) => {
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
 * Generate a complete HTML page using HTMLRewriter.
 */
export async function generatePage(
	indexHtml,
	lang,
	pageName,
	baseUrl,
	mdProcessor,
	t,
	fontStyles = "",
	ssgHeader = ""
) {
	const pathname = pageName === "" ? "/" : `/${pageName}/`;
	const metadata = seoMetadata[pathname];

	const appName = t("appName");
	const pageTitle = metadata ? t(metadata.titleKey, { defaultValue: appName }) : appName;
	const pageDescription = metadata ? t(metadata.descriptionKey) : "";
	const pageKeywords = t("seo.keywords", { defaultValue: "" });
	const ogImageAlt = t("seo.ogImageAlt", { defaultValue: "NMS Optimizer Screenshot" });

	const cleanPath = pathname === "/" ? "" : pathname;
	const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);
	const canonicalPath =
		lang === "en" ? normalizePath(cleanPath || "/") : `/${lang}${normalizePath(cleanPath || "/")}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;

	const seoTags = generateSeoTags(pathname, lang, baseUrl, t);

	// Prepare JSON-LD Schemas
	const schemas = getLocalizedSchema(t, lang, canonicalUrl);
	const softwareSchema = schemas.find((s) => s["@type"] === "SoftwareApplication");
	const websiteSchema = schemas.find((s) => s["@type"] === "WebSite");
	const orgSchema = schemas.find((s) => s["@type"] === "Organization");
	const breadcrumbSchema = schemas.find((s) => s["@type"] === "BreadcrumbList");

	// Prepare noscript content
	const markdownFileName = PAGE_TO_MARKDOWN_MAPPING[pageName] || pageName;
	const markdownContent = await readMarkdownFile(lang, markdownFileName);
	let noscriptBlock = "";

	if (markdownContent) {
		let renderedHtml = mdProcessor(markdownContent);
		const navigationHtml = generateNavigationLinks(lang, pageName, t);

		const h1Regex = /<h1[^>]*?>([\s\S]*?)<\/h1>/i;

		if (h1Regex.test(renderedHtml)) {
			renderedHtml = renderedHtml.replace(h1Regex, `<h1>${pageTitle}</h1>`);
		} else {
			renderedHtml = `<h1>${pageTitle}</h1>\n${renderedHtml}`;
		}

		const subTitleRaw = t("appHeader.subTitle", {
			defaultValue: 'Technology Layout Optimizer <span style="color: #4ccce6">ML/RUST</span>',
		});
		const subTitle = subTitleRaw.replace(
			/<(\d+)>([\s\S]*?)<\/\1>/g,
			'<span style="color: #4ccce6">$2</span>'
		);

		// Single Source of Truth: Localize the subtitle in the header extracted from the template
		const localizedHeader = ssgHeader.replace(
			/<h2 class="app-header-static__title">[\s\S]*?<\/h2>/,
			`<h2 class="app-header-static__title">${subTitle}</h2>`
		);

		noscriptBlock = `
		<main class="ssg-fallback" data-prerendered-markdown="true">
			${localizedHeader}
			${renderedHtml}
			${navigationHtml}
			${fontStyles ? `<style>${fontStyles}</style>` : ""}
		</main>`;
	}

	const rewriter = new HTMLRewriter()
		.on("html", {
			element(el) {
				el.setAttribute("lang", lang);
			},
		})
		.on("title", {
			element(el) {
				el.setInnerContent(pageTitle);
			},
		})
		// Remove existing SEO tags to avoid duplicates
		.on(
			'link[rel="canonical"], meta[property="og:url"], meta[property="og:locale"], meta[property="og:locale:alternate"], link[rel="alternate"][hreflang], script[type="application/ld+json"]',
			{
				element(el) {
					el.remove();
				},
			}
		)
		// Meta tag updates
		.on('meta[name="description"]', {
			element(el) {
				el.setAttribute("content", pageDescription);
			},
		})
		.on('meta[name="keywords"]', {
			element(el) {
				el.setAttribute("content", pageKeywords);
			},
		})
		.on('meta[property="og:title"]', {
			element(el) {
				el.setAttribute("content", pageTitle);
			},
		})
		.on('meta[property="og:site_name"]', {
			element(el) {
				el.setAttribute("content", appName);
			},
		})
		.on('meta[property="og:description"]', {
			element(el) {
				el.setAttribute("content", pageDescription);
			},
		})
		.on('meta[property="og:image:alt"]', {
			element(el) {
				el.setAttribute("content", ogImageAlt);
			},
		})
		.on('meta[name="twitter:title"]', {
			element(el) {
				el.setAttribute("content", pageTitle);
			},
		})
		.on('meta[name="twitter:description"]', {
			element(el) {
				el.setAttribute("content", pageDescription);
			},
		})
		.on('meta[name="twitter:image:alt"]', {
			element(el) {
				el.setAttribute("content", ogImageAlt);
			},
		})
		// Inject new SEO tags in head
		.on("head", {
			element(el) {
				// SEO Tags
				el.append(seoTags, { html: true });

				// Schemas
				if (softwareSchema)
					el.append(
						`<script type="application/ld+json" id="softwareapplication-schema">${JSON.stringify(softwareSchema)}</script>`,
						{ html: true }
					);
				if (websiteSchema)
					el.append(
						`<script type="application/ld+json" id="website-schema">${JSON.stringify(websiteSchema)}</script>`,
						{ html: true }
					);
				if (orgSchema)
					el.append(
						`<script type="application/ld+json" id="organization-schema">${JSON.stringify(orgSchema)}</script>`,
						{ html: true }
					);
				if (breadcrumbSchema)
					el.append(
						`<script type="application/ld+json" id="breadcrumblist-schema">${JSON.stringify(breadcrumbSchema)}</script>`,
						{ html: true }
					);
			},
		})
		// Body content
		.on("body", {
			element(_el) {
				// Strip old fallback blocks in body
			},
		})
		.on("main.ssg-fallback", {
			element(el) {
				el.remove();
			},
		})
		.on("noscript", {
			element(el) {
				// In the original script, noscripts in head are preserved.
				// We'll only remove noscripts that are NOT data-ssg-template (which is in head)
				if (el.getAttribute("data-ssg-template") === null) {
					el.remove();
				}
			},
		})
		.on("div#root", {
			element(el) {
				if (noscriptBlock) {
					el.after(noscriptBlock, { html: true });
				}
			},
		});

	return rewriter.transform(indexHtml);
}

/**
 * Generate SEO tags for a page.
 */
export function generateSeoTags(pathname, lang, baseUrl, _t) {
	const cleanPath = pathname === "/" ? "" : pathname;
	const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);
	const canonicalPath =
		lang === "en" ? normalizePath(cleanPath || "/") : `/${lang}${normalizePath(cleanPath || "/")}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;

	let tags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:locale" content="${getOgLocale(lang)}" />`;

	for (const [code, locale] of Object.entries(OG_LOCALE_MAP)) {
		if (code === lang) continue;
		tags += `\n    <meta property="og:locale:alternate" content="${locale}" />`;
	}

	for (const l of SUPPORTED_LANGUAGES) {
		const lPath =
			l === "en" ? normalizePath(cleanPath || "/") : `/${l}${normalizePath(cleanPath || "/")}`;
		const lUrl = new URL(lPath, baseUrl).href;
		tags += `\n    <link rel="alternate" hreflang="${l}" href="${lUrl}" />`;
	}

	const xDefaultUrl = new URL(normalizePath(cleanPath || "/"), baseUrl).href;
	tags += `\n    <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`;

	return tags;
}

/**
 * Generate all static pages
 */
export async function generateSsg() {
	const mdProcessor = createMarkdownProcessor();
	const i18nInstance = await initI18n();

	// Now read the freshly updated files from disk
	const indexPath = path.join(DIST_DIR, "index.html");

	try {
		const baseIndexHtml = await fs.readFile(indexPath, "utf-8");
		const sourceIndexHtml = await fs.readFile(path.resolve("index.html"), "utf-8");
		const baseUrl = `https://${TARGET_HOST}`;

		// Extract template blocks from source index.html
		const template = await extractSsgTemplate(sourceIndexHtml);
		const ssgHeader = template.ssgHeader;
		let fontStyles = "";

		// --- FONT FIX: Extract from source fonts.css ---
		try {
			const fontsCss = await fs.readFile(FONTS_CSS_PATH, "utf-8");
			fontStyles = fontsCss;
			console.log("✓ Included fonts from src/assets/css/fonts.css");
		} catch (_err) {
			console.warn("Warning: fonts.css not found, skipping font extraction.");
		}

		// Diagnostic: Verify translations are loaded
		console.log("\n--- i18n Initialization Check ---");

		for (const lang of SUPPORTED_LANGUAGES) {
			const testT = i18nInstance.getFixedT(lang, "translation");
			const testValue = testT("appName");
			const isLoaded = testValue && testValue !== "appName";
			console.log(`${isLoaded ? "✓" : "✗"} Language [${lang}]: appName = "${testValue}"`);
		}

		console.log("---------------------------------\n");

		let generatedCount = 0;

		for (const lang of SUPPORTED_LANGUAGES) {
			const t = i18nInstance.getFixedT(lang, "translation");
			const rootPath = lang === "en" ? "" : lang;

			const rootPageHtml = await generatePage(
				baseIndexHtml,
				lang,
				"",
				baseUrl,
				mdProcessor,
				t,
				fontStyles,
				ssgHeader
			);
			const rootDir = path.join(DIST_DIR, rootPath);
			const rootFile = path.join(rootDir, "index.html");

			if (rootPath) {
				await fs.mkdir(rootDir, { recursive: true });
			}

			await fs.writeFile(rootFile, rootPageHtml);

			console.log(`✓ Generated ${lang === "en" ? "/" : "/" + lang}`);
			generatedCount++;

			for (const dialog of KNOWN_DIALOGS) {
				const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
				const pageDir = path.join(DIST_DIR, pagePath);
				const pageHtml = await generatePage(
					baseIndexHtml,
					lang,
					dialog,
					baseUrl,
					mdProcessor,
					t,
					fontStyles,
					ssgHeader
				);
				const pageFile = path.join(pageDir, "index.html");
				await fs.mkdir(pageDir, { recursive: true });
				await fs.writeFile(pageFile, pageHtml);

				console.log(`✓ Generated /${pagePath}`);
				generatedCount++;
			}
		}

		console.log(`\n✅ Generated ${generatedCount} static pages`);
	} catch (err) {
		console.error(`Error during SSG generation: ${err.message}`);

		if (err.code === "ENOENT") {
			console.error("Hint: Make sure to run 'bun run build' first to generate dist/index.html");
		}

		process.exit(1);
	}
}

/**
 * Initialize i18next instance for SSG
 */
export async function initI18n() {
	const i18nInstance = i18next.createInstance();
	await i18nInstance.use(i18nextFsBackend).init({
		backend: {
			loadPath: path.join(LOCALES_DIR, "{{lng}}/{{ns}}.json"),
		},
		defaultNS: "translation",
		fallbackLng: "en",
		ns: ["translation"],
		preload: SUPPORTED_LANGUAGES,
		supportedLngs: SUPPORTED_LANGUAGES,
	});

	return i18nInstance;
}

/**
 * Read markdown file from the locales directory.
 */
export async function readMarkdownFile(lang, fileName) {
	const filePath = path.join(LOCALES_DIR, lang, `${fileName}.md`);

	try {
		return await fs.readFile(filePath, "utf-8");
	} catch (_e) {
		// Fallback to English if localized markdown is missing
		if (lang !== "en") {
			const fallbackPath = path.join(LOCALES_DIR, "en", `${fileName}.md`);

			try {
				const content = await fs.readFile(fallbackPath, "utf-8");
				console.info(`Info: Using English fallback for ${fileName} in ${lang}`);

				return content;
			} catch (_err) {
				return null;
			}
		}

		return null;
	}
}

// Only run if executed directly
if (import.meta.main) {
	const start = performance.now();
	generateSsg()
		.then(() => {
			const end = performance.now();
			console.log(`✨ SSG generated in ${((end - start) / 1000).toFixed(2)}s`);
		})
		.catch((err) => {
			console.error("Error generating SSG:", err);
			process.exit(1);
		});
}
