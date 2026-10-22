/**
 * @file Static Site Generation script (Bun Optimized)
 * Pre-renders all markdown pages as static HTML for better SEO.
 * Uses Bun's native HTMLRewriter for maximum performance.
 *
 * @category Utilities
 */

import fs from "node:fs/promises";
import path from "node:path";

import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";

import packageJson from "../package.json" with { type: "json" };
import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../shared/config.js";
import { getPageMetadata } from "../shared/page-metadata.js";
import { PAGE_REGISTRY } from "../shared/page-registry.js";
import { getOgLocale, getSchemaDomId, OG_LOCALE_MAP } from "../shared/seo-schema.js";
import { createMarkdownProcessor } from "./markdown-processor.mjs";

const DIST_DIR = path.resolve("dist");
const LOCALES_DIR = path.resolve("public/assets/locales");

/**
 * Mapping of route slugs (`""` for home, or dialog IDs) to localized markdown filenames,
 * derived from {@link PAGE_REGISTRY}.
 *
 * @type {Record<string, string>}
 *
 * @see {@link PAGE_REGISTRY}
 *
 * @category Utilities
 */
export const PAGE_TO_MARKDOWN_MAPPING = Object.fromEntries(
	Object.values(PAGE_REGISTRY)
		.filter((p) => p.markdownFileName)
		.map((p) => [p.id === "home" ? "" : p.id, p.markdownFileName]),
);

/**
 * Extracts the Static SEO Fallback header template (`<header class="app-header-static">`)
 * from the source `index.html` document.
 *
 * @remarks
 * Ensures build-time SSG uses the single static header markup defined in `index.html`.
 *
 * @param {string} sourceIndexHtml - Raw contents of the source `index.html` file.
 * @returns {Promise<{ ssgHeader: string }>} Object containing the extracted `ssgHeader` HTML string.
 *
 * @see {@link ./generate-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const { ssgHeader } = await extractSsgTemplate(sourceHtml);
 * // returns { ssgHeader: '<header class="app-header-static">...</header>' }
 * ```
 */
export async function extractSsgTemplate(sourceIndexHtml) {
	const hasTemplate = /<(?:main|div)\s+[^>]*?data-ssg-template/i.test(sourceIndexHtml);
	if (!hasTemplate) return { ssgHeader: "" };

	const ssgHeaderMatch = sourceIndexHtml.match(
		/(<header[^>]*?class="app-header-static"[^>]*?>[\s\S]*?<\/header>)/,
	);
	const ssgHeader = ssgHeaderMatch ? ssgHeaderMatch[1].trim() : "";

	return { ssgHeader };
}

/**
 * Generates the localized `<nav>` HTML block for a Static SEO Fallback page.
 *
 * @remarks
 * Renders crawlable site navigation links with localized labels, descriptions,
 * and `aria-current="page"` on the active route, omitting `userstats` in Docker builds.
 *
 * @param {string} lang - Active locale code (e.g., `"en"`, `"es"`).
 * @param {string} currentPage - Current route slug (`""` for home, or a dialog identifier).
 * @param {import("i18next").TFunction} t - Fixed-language i18next translation function.
 * @returns {string} Rendered `<nav aria-label="Site navigation">` HTML string.
 *
 * @see {@link ./generate-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const navHtml = generateNavigationLinks("en", "about", t);
 * // returns '<nav aria-label="Site navigation">...</nav>'
 * ```
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
		...(!isDocker ?
			[
				{
					descKey: "seo.navDescriptions.userstats",
					key: "seo.nav.userstats",
					path: "/userstats",
				},
			]
		:	[]),
		{
			descKey: "seo.navDescriptions.translation",
			key: "seo.nav.translation",
			path: "/translation",
		},
		{ descKey: "seo.navDescriptions.privacy", key: "seo.nav.privacy", path: "/privacy" },
	];

	const links = pages
		.map(({ descKey, key, path }) => {
			const href =
				path === "/" ?
					langPrefix ? `${langPrefix}/`
					:	"/"
				:	`${langPrefix}${path}/`;
			const label = t(key, { defaultValue: path.slice(1) || "Home" });
			const desc = t(descKey, { defaultValue: "" });
			const currentPath = currentPage === "" ? "/" : `/${currentPage}`;
			const isCurrent = path === currentPath;

			return `<li${isCurrent ? ' aria-current="page"' : ""}><a href="${href}">${label}</a> - ${desc}</li>`;
		})
		.join("\n          ");

	return `
    <nav aria-label="Site navigation">
      <h2>${t("seo.nav.title", { defaultValue: "Navigation" })}</h2>
      <ul>
        ${links}
      </ul>
    </nav>`;
}

/**
 * Generates a complete localized HTML page using Bun's `HTMLRewriter`.
 *
 * @remarks
 * Injects localized SEO metadata, canonical/hreflang links, JSON-LD structured
 * data schemas, and the Static SEO Fallback (`.ssg-fallback`) into the base HTML shell.
 *
 * @param {string} indexHtml - The built base `index.html` document string.
 * @param {string} lang - The target locale code (e.g., `"en"`, `"es"`).
 * @param {string} pageName - The route slug (`""` for home, or a dialog identifier like `"about"`).
 * @param {string} baseUrl - The canonical origin URL (e.g., `"https://nms-optimizer.app"`).
 * @param {(markdown: string) => string} mdProcessor - Markdown-to-HTML compiler function.
 * @param {import("i18next").TFunction} t - Fixed-language i18next translation function.
 * @param {string} [ssgHeader=""] - Extracted static header HTML template block.
 * @returns {Promise<string>} The transformed HTML document string for the route.
 *
 * @see {@link getPageMetadata}
 * @see {@link getSchemaDomId}
 * @see {@link ./generate-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const html = await generatePage(baseHtml, "en", "about", "https://nms-optimizer.app", mdProcessor, t, ssgHeader);
 * // returns "<!doctype html><html lang=\"en\">..."
 * ```
 */
export async function generatePage(
	indexHtml,
	lang,
	pageName,
	baseUrl,
	mdProcessor,
	t,
	ssgHeader = "",
) {
	const pathname = pageName === "" ? "/" : `/${pageName}/`;
	const pageMetadata = getPageMetadata({
		baseUrl,
		lang,
		pathname,
		t,
		version: packageJson.version,
	});

	const appName = t("appName");
	const pageTitle = pageMetadata.title;
	const pageDescription = pageMetadata.description;
	const pageKeywords = pageMetadata.keywords;
	const ogImageAlt = pageMetadata.ogImageAlt;
	const ogImageUrl = pageMetadata.ogImageUrl;

	const seoTags = generateSeoTags(pathname, lang, baseUrl, t);
	const schemas = pageMetadata.schemas;

	// Prepare Static SEO Fallback content
	const markdownFileName = PAGE_TO_MARKDOWN_MAPPING[pageName] || pageName;
	const markdownContent = await readMarkdownFile(lang, markdownFileName);
	let ssgFallbackBlock = "";

	if (markdownContent) {
		let renderedHtml = mdProcessor(markdownContent);
		const navigationHtml = generateNavigationLinks(lang, pageName, t);

		const contentHeading = pageMetadata.heading;
		const h1Regex = /<h1[^>]*?>([\s\S]*?)<\/h1>/i;

		if (h1Regex.test(renderedHtml)) {
			renderedHtml = renderedHtml.replace(h1Regex, `<h1>${contentHeading}</h1>`);
		} else {
			renderedHtml = `<h1>${contentHeading}</h1>\n${renderedHtml}`;
		}

		const subTitleRaw = t("appHeader.subTitle", {
			defaultValue: "Technology Layout Optimizer <span>ML/RUST</span>",
		});
		const subTitle = subTitleRaw.replace(/<(\d+)>([\s\S]*?)<\/\1>/g, "<span>$2</span>");

		// Single Source of Truth: Localize the subtitle in the header extracted from the template
		const localizedHeader = ssgHeader.replace(
			/<(h2|div) class="app-header-static__title">[\s\S]*?<\/\1>/,
			`<div class="app-header-static__title">${subTitle}</div>`,
		);

		ssgFallbackBlock = `
		<div class="ssg-fallback">
			${localizedHeader}
			<main>
				${renderedHtml}
				${navigationHtml}
			</main>
		</div>`;
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
			},
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
		.on('meta[property="og:image"]', {
			element(el) {
				el.setAttribute("content", ogImageUrl);
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
		.on('meta[name="twitter:image"]', {
			element(el) {
				el.setAttribute("content", ogImageUrl);
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
				for (const schema of schemas) {
					el.append(
						`<script type="application/ld+json" id="${getSchemaDomId(schema)}">${JSON.stringify(schema)}</script>`,
						{ html: true },
					);
				}
			},
		})
		// Body content
		.on(".ssg-fallback", {
			element(el) {
				el.remove();
			},
		})
		.on("noscript", {
			element(el) {
				// Preserve head noscript blocks (e.g. data-vpss-background-noscript or data-ssg-template)
				if (
					el.getAttribute("data-ssg-template") === null
					&& el.getAttribute("data-vpss-background-noscript") === null
				) {
					el.remove();
				}
			},
		})
		.on("div#root", {
			element(el) {
				if (ssgFallbackBlock) {
					el.after(ssgFallbackBlock, { html: true });
				}
			},
		});

	return rewriter.transform(indexHtml);
}

/**
 * Generates canonical, Open Graph locale, and `hreflang` alternate tags for a page.
 *
 * @remarks
 * Produces the canonical URL, `og:url`, primary and alternate `og:locale` tags,
 * localized `hreflang` links for all {@link SUPPORTED_LANGUAGES}, and `x-default`.
 *
 * @param {string} pathname - Route pathname without locale prefix (e.g., `"/"` or `"/about/"`).
 * @param {string} lang - Active locale code (e.g., `"en"`, `"es"`).
 * @param {string} baseUrl - Canonical origin URL (e.g., `"https://nms-optimizer.app"`).
 * @param {import("i18next").TFunction} [_t] - Unused translation function parameter preserved for signature parity.
 * @returns {string} HTML string of `<link>` and `<meta>` tags to append to `<head>`.
 *
 * @see {@link getOgLocale}
 * @see {@link OG_LOCALE_MAP}
 * @see {@link SUPPORTED_LANGUAGES}
 * @see {@link ./generate-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const tags = generateSeoTags("/about/", "en", "https://nms-optimizer.app");
 * // returns '\n    <link rel="canonical" href="https://nms-optimizer.app/about/" />...'
 * ```
 */
export function generateSeoTags(pathname, lang, baseUrl, _t) {
	const cleanPath = pathname === "/" ? "" : pathname;
	const normalizePath = (p) => (p.endsWith("/") ? p : `${p}/`);
	const normalizedCleanPath = normalizePath(cleanPath || "/");

	const buildLocaleUrl = (locale) => {
		const localePath =
			locale === "en" ? normalizedCleanPath : `/${locale}${normalizedCleanPath}`;

		return new URL(localePath, baseUrl).href;
	};

	const canonicalUrl = buildLocaleUrl(lang);

	let tags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:locale" content="${getOgLocale(lang)}" />`;

	for (const [code, locale] of Object.entries(OG_LOCALE_MAP)) {
		if (code === lang) continue;
		tags += `\n    <meta property="og:locale:alternate" content="${locale}" />`;
	}

	for (const l of SUPPORTED_LANGUAGES) {
		tags += `\n    <link rel="alternate" hreflang="${l}" href="${buildLocaleUrl(l)}" />`;
	}

	const xDefaultUrl = buildLocaleUrl("en");
	tags += `\n    <link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`;

	return tags;
}

/**
 * Pre-renders all localized static HTML pages into `dist/` after the Vite production build.
 *
 * @remarks
 * Iterates over {@link SUPPORTED_LANGUAGES} and {@link KNOWN_DIALOGS} to write localized
 * `index.html` files containing pre-rendered Static SEO Fallback blocks and metadata.
 *
 * @returns {Promise<void>} Resolves when all static pages have been written to `dist/`.
 *
 * @see {@link generatePage}
 * @see {@link initI18n}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * await generateSsg();
 * // writes 42 localized index.html files under dist/
 * ```
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
				ssgHeader,
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
					ssgHeader,
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
			console.error(
				"Hint: Make sure to run 'bun run build' first to generate dist/index.html",
			);
		}

		process.exit(1);
	}
}

/**
 * Initializes an `i18next` filesystem instance preloaded with all supported locales for SSG.
 *
 * @remarks
 * Uses `i18next-fs-backend` to load `translation.json` files from `public/assets/locales`.
 *
 * @returns {Promise<import("i18next").i18n>} Initialized `i18next` instance.
 *
 * @see {@link SUPPORTED_LANGUAGES}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const i18n = await initI18n();
 * // returns initialized i18next instance
 * ```
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
 * Reads a localized markdown file from `public/assets/locales/<lang>/<fileName>.md`.
 *
 * @remarks
 * Falls back to the English (`en`) markdown file if the requested locale file does not exist,
 * or returns `null` if neither exists.
 *
 * @param {string} lang - Target locale code (e.g., `"en"`, `"es"`).
 * @param {string} fileName - Markdown filename without `.md` extension (e.g., `"about"`).
 * @returns {Promise<string | null>} Raw markdown string, or `null` if not found.
 *
 * @see {@link ./generate-ssg.test.mjs Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const md = await readMarkdownFile("en", "about");
 * // returns "# About..." or null
 * ```
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
