/**
 * @file Unified Page Metadata Module.
 * Encapsulates title formatting invariants, semantic content heading extraction,
 * canonical URL generation, Open Graph metadata, and JSON-LD schema coordination
 * across client-side rendering (CSR) and build-time static site generation (SSG).
 *
 * @category Utilities
 */

import { SUPPORTED_LANGUAGES, TARGET_HOST } from "./config.js";
import { seoMetadata } from "./seo-metadata.js";
import { getLocalizedSchema, getOgLocale } from "./seo-schema.js";

/**
 * Default base URL for production metadata and canonical links.
 *
 * @type {string}
 */
export const DEFAULT_BASE_URL = `https://${TARGET_HOST}`;

/**
 * Default Open Graph image path.
 *
 * @type {string}
 */
export const DEFAULT_OG_IMAGE_PATH = "/assets/img/screenshots/screenshot.png";

/**
 * @typedef {Object} PageMetadataOptions
 * @property {string} pathname - The route pathname or identifier (e.g. "/instructions/", "/es/instructions/", "instructions", or "/").
 * @property {(key: string, options?: Record<string, unknown>) => string} t - Translation function (i18next-compatible).
 * @property {string} [lang] - Language code (e.g., "en", "es", "fr", "de", "it", "pt"). If omitted, resolved from pathname or defaults to "en".
 * @property {string} [baseUrl] - Base URL (defaults to "https://nms-optimizer.app").
 * @property {string[]} [supportedLanguages] - Supported language codes (defaults to SUPPORTED_LANGUAGES).
 * @property {string} [version] - Optional application version string.
 */

/**
 * @typedef {Object} PageMetadata
 * @property {string} title - Formatted document title for `<title>` tags, social cards, and telemetry (e.g. "How to Optimize Your Tech Layout | NMS Optimizer").
 * @property {string} heading - Clean semantic content heading for `<h1>` tags without brand suffix (e.g. "How to Optimize Your Tech Layout").
 * @property {string} description - Localized meta description text.
 * @property {string} keywords - Localized meta keywords string.
 * @property {string} canonicalUrl - Canonical URL string for the page and locale.
 * @property {string} cleanPath - Normalized path without language prefix (e.g. "/instructions/").
 * @property {string} pathname - Normalized lookup pathname (e.g. "/instructions/").
 * @property {string} lang - Resolved language code (e.g. "en", "es").
 * @property {string} ogImageUrl - Absolute Open Graph image URL.
 * @property {string} ogImageAlt - Localized Open Graph image alt text.
 * @property {string} ogLocale - Open Graph locale tag (e.g. "en_US").
 * @property {Array<Record<string, unknown>>} schemas - Localized JSON-LD structured data schemas.
 */

/**
 * @typedef {Object} ParsedRoutePath
 * @property {string} cleanPath - Normalized route path without language prefix, e.g. "/instructions/" or "/".
 * @property {string} lang - Detected language code from path prefix or default "en".
 */

/**
 * Parses and normalizes a pathname, extracting any language prefix and ensuring consistent trailing slashes.
 *
 * @remarks
 * Handles paths with or without leading slashes, language prefixes (e.g. `/es/instructions/`),
 * and bare route names (e.g. `instructions`).
 *
 * @param {string} [pathname=""] - The raw pathname or route identifier.
 * @param {string[]} [supportedLanguages=SUPPORTED_LANGUAGES] - Array of supported language codes.
 * @returns {ParsedRoutePath} The parsed route path object.
 *
 * @example
 * ```ts
 * parseRoutePath("/es/instructions/");
 * // returns { cleanPath: "/instructions/", lang: "es" }
 * ```
 */
export const parseRoutePath = (pathname = "", supportedLanguages = SUPPORTED_LANGUAGES) => {
	const raw = String(pathname).trim().split("?")[0].split("#")[0];
	const parts = raw.split("/").filter(Boolean);

	let lang = "en";
	let pathParts = parts;

	if (parts.length > 0 && supportedLanguages.includes(parts[0])) {
		lang = parts[0];
		pathParts = parts.slice(1);
	}

	const cleanPath = pathParts.length === 0 ? "/" : `/${pathParts.join("/")}/`;

	return {
		cleanPath,
		lang,
	};
};

/**
 * Extracts a clean content heading by removing brand suffixes from a raw translated title string.
 *
 * @remarks
 * Ensures semantic `<h1>` headings contain only the pure topic phrase without delimiter artifacts.
 *
 * @param {string} [rawTitle=""] - The raw translated title or topic string.
 * @param {string} [appName="NMS Optimizer"] - The application brand name to strip.
 * @returns {string} The naked topic heading.
 *
 * @example
 * ```ts
 * extractContentHeading("How to Optimize Your Tech Layout | NMS Optimizer", "NMS Optimizer");
 * // returns "How to Optimize Your Tech Layout"
 * ```
 */
export const extractContentHeading = (rawTitle = "", appName = "NMS Optimizer") => {
	if (!rawTitle) return "";

	const trimmed = String(rawTitle).trim();
	const brandPattern = new RegExp(
		`\\s*\\|\\s*${appName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
		"i"
	);
	const genericPipePattern = /\s*\|\s*.*$/;

	let cleaned = trimmed.replace(brandPattern, "");

	if (cleaned === trimmed) {
		cleaned = trimmed.replace(genericPipePattern, "");
	}

	return cleaned.trim();
};

/**
 * Formats a topic into the standard document title according to the brand formatting policy.
 *
 * @remarks
 * Enforces the `"<Topic> | <Brand>"` formatting invariant across all pages.
 *
 * @param {string} [topic=""] - The topic heading or naked page title.
 * @param {string} [appName="NMS Optimizer"] - The application brand name.
 * @returns {string} The fully formatted document title.
 *
 * @example
 * ```ts
 * formatDocumentTitle("How to Optimize Your Tech Layout", "NMS Optimizer");
 * // returns "How to Optimize Your Tech Layout | NMS Optimizer"
 * ```
 */
export const formatDocumentTitle = (topic = "", appName = "NMS Optimizer") => {
	const trimmedTopic = String(topic).trim();

	if (!trimmedTopic) return appName;
	if (trimmedTopic === appName) return appName;

	// Check if already formatted with brand suffix
	const brandSuffix = ` | ${appName}`;

	if (trimmedTopic.endsWith(brandSuffix)) {
		return trimmedTopic;
	}

	// Avoid duplicate formatting if starting with brand prefix (e.g. "NMS Optimizer: ...")
	if (trimmedTopic.startsWith(`${appName}: `) || trimmedTopic.startsWith(`${appName} - `)) {
		return trimmedTopic;
	}

	return `${trimmedTopic}${brandSuffix}`;
};

/**
 * Resolves complete page metadata for a given route, language, and translation context.
 *
 * @remarks
 * Serves as the single deep seam for both declarative React 19 `<head>` management,
 * telemetry `page_view` tracking, and build-time SSG pre-rendering.
 *
 * @param {PageMetadataOptions} options - Configuration options and translation functions.
 * @returns {PageMetadata} The resolved page metadata record.
 *
 * @see {@link getLocalizedSchema}
 * @see {@link seoMetadata}
 *
 * @example
 * ```ts
 * const meta = getPageMetadata({
 *   pathname: "/instructions/",
 *   lang: "en",
 *   t: (k) => k === "seo.instructionsPageTitle" ? "How to Optimize Your Tech Layout" : "NMS Optimizer",
 * });
 * // returns { title: "How to Optimize Your Tech Layout | NMS Optimizer", heading: "How to Optimize Your Tech Layout", ... }
 * ```
 */
export const getPageMetadata = (options) => {
	const {
		baseUrl = DEFAULT_BASE_URL,
		lang: explicitLang,
		pathname = "/",
		supportedLanguages = SUPPORTED_LANGUAGES,
		t,
		version,
	} = options;

	const parsed = parseRoutePath(pathname, supportedLanguages);
	const lang = explicitLang || parsed.lang;
	const cleanPath = parsed.cleanPath;
	const lookupPath = cleanPath;

	const metadata = seoMetadata[lookupPath] || seoMetadata["/"] || {};
	const appName = t("appName", { defaultValue: "NMS Optimizer" });
	const isRoot = lookupPath === "/";

	const rawTitle = metadata.titleKey
		? t(metadata.titleKey, { defaultValue: isRoot ? appName : "" })
		: appName;

	const heading = extractContentHeading(rawTitle, appName) || appName;

	const title = formatDocumentTitle(heading, appName);

	const description = metadata.descriptionKey ? t(metadata.descriptionKey) : "";
	const keywords = t("seo.keywords", { defaultValue: "" });

	const canonicalPath =
		lang === "en" ? cleanPath : `/${lang}${cleanPath === "/" ? "/" : cleanPath}`;
	const canonicalUrl = new URL(canonicalPath, baseUrl).href;

	const ogImageUrl = `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`;
	const ogImageAlt = t("seo.ogImageAlt", { defaultValue: "NMS Optimizer Screenshot" });
	const ogLocale = getOgLocale(lang);
	const schemas = getLocalizedSchema(t, lang, canonicalUrl, version);

	return {
		canonicalUrl,
		cleanPath,
		description,
		heading,
		keywords,
		lang,
		ogImageAlt,
		ogImageUrl,
		ogLocale,
		pathname: lookupPath,
		schemas,
		title,
	};
};
