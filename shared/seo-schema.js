/**
 * @file Structured data (JSON-LD) templates for NMS Optimizer.
 * Consolidates SEO schema for both React (CSR) and SSG layers to ensure parity.
 *
 * @category Utilities
 */

import { getPageById, getPageContentLanguages } from "./page-registry.js";

/**
 * Maps a supported i18next language code to a Facebook/Open Graph locale tag
 * (BCP-47 with underscore, e.g. `en_US`).
 *
 * @type {Record<string, string>}
 *
 * @category Utilities
 */
export const OG_LOCALE_MAP = {
	de: "de_DE",
	en: "en_US",
	es: "es_ES",
	fr: "fr_FR",
	it: "it_IT",
	pt: "pt_PT",
};

/**
 * Canonical Schema.org `@type` identifiers managed by the application's SEO layer.
 *
 * @type {readonly string[]}
 *
 * @category Utilities
 */
const MANAGED_SCHEMA_TYPES = [
	"SoftwareApplication",
	"Organization",
	"WebSite",
	"WebPage",
	"ItemList",
	"BreadcrumbList",
];

/**
 * Default English `SoftwareApplication.featureList` fallback entries.
 *
 * @type {readonly string[]}
 */
const DEFAULT_FEATURE_LIST = [
	"Simulated annealing and ML layout optimization",
	"Adjacency bonus calculation and visualization",
	"Supercharged slot prioritization",
	"Support for Starships, Multi-Tools, Corvettes, Freighters, Exosuits, and Exocraft",
	"Offline Progressive Web App (PWA) support",
];

/**
 * Default English `SoftwareApplication.keywords` fallback string.
 *
 * @type {string}
 */
const DEFAULT_SOFTWARE_KEYWORDS =
	"NMS Optimizer, No Man's Sky, adjacency bonus, supercharged slots, NMS layout tool, starship tech layout, multitool build, supercharged slot calculator";

/**
 * Derives the deterministic DOM `id` attribute for a JSON-LD schema object
 * from its `@type` property.
 *
 * @remarks
 * Shared between build-time SSG (`scripts/generate-ssg.mjs`) and client-side
 * route synchronization (`src/components/Seo/Seo.tsx`) so pre-rendered schemas
 * can be updated in-place without DOM teardown.
 *
 * @param {Record<string, unknown>} schema - A Schema.org JSON-LD object containing an `@type` string.
 *
 * @returns {string} The lowercase `<type>-schema` DOM identifier.
 *
 * @see {@link MANAGED_SCHEMA_IDS}
 * @see {@link MANAGED_SCHEMA_TYPES}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * getSchemaDomId({ "@type": "SoftwareApplication" });
 * // returns "softwareapplication-schema"
 * ```
 */
export const getSchemaDomId = (schema) => {
	const type = typeof schema?.["@type"] === "string" ? schema["@type"] : "unknown";

	return `${type.toLowerCase()}-schema`;
};

/**
 * Canonical list of DOM `id` attributes used for managed JSON-LD `<script>` tags,
 * derived directly from {@link MANAGED_SCHEMA_TYPES}.
 *
 * @type {readonly string[]}
 *
 * @see {@link getSchemaDomId}
 * @see {@link MANAGED_SCHEMA_TYPES}
 *
 * @category Utilities
 */
export const MANAGED_SCHEMA_IDS = MANAGED_SCHEMA_TYPES.map((type) =>
	getSchemaDomId({ "@type": type }),
);

/**
 * Returns the Open Graph locale for a given language code, falling back to
 * `en_US` when the language is not in the mapping.
 *
 * @remarks
 * Normalizes ISO 639-1 language codes into Open Graph `language_TERRITORY` tags.
 *
 * @param {string} lang - i18n language code (e.g. `"de"`).
 *
 * @returns {string} OG locale tag (e.g. `"de_DE"`).
 *
 * @see {@link OG_LOCALE_MAP}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * getOgLocale("es");
 * // returns "es_ES"
 * ```
 */
export const getOgLocale = (lang) => OG_LOCALE_MAP[lang] || "en_US";

/**
 * Resolves the application version dynamically from the environment
 * or explicit parameter, normalizing any leading `v` character.
 *
 * @param {string} [version] - Optional explicit version string.
 *
 * @returns {string | undefined} Normalized semantic version string without a leading `v`.
 */
const resolveAppVersion = (version) => {
	if (version) return String(version).replace(/^v/, "");

	if (typeof __APP_VERSION__ !== "undefined") {
		return String(__APP_VERSION__).replace(/^v/, "");
	}

	return undefined;
};

/**
 * Resolves the localized `SoftwareApplication.featureList` array with safe English fallback.
 *
 * @param {(key: string, options?: Record<string, unknown>) => unknown} t - Translation lookup function.
 *
 * @returns {string[]} Non-empty list of localized application features.
 *
 * @see {@link DEFAULT_FEATURE_LIST}
 */
const resolveFeatureList = (t) => {
	const raw = t("seo.featureList", {
		defaultValue: DEFAULT_FEATURE_LIST,
		returnObjects: true,
	});

	if (
		Array.isArray(raw)
		&& raw.length > 0
		&& raw.every((item) => typeof item === "string" && item.trim().length > 0)
	) {
		return raw.map((item) => item.trim());
	}

	return [...DEFAULT_FEATURE_LIST];
};

/**
 * Resolves a translated string key via `t`, falling back to `fallback` (or `key`)
 * when the lookup returns a non-string, blank string, or uninterpolated key echo.
 *
 * @param {(key: string, options?: Record<string, unknown>) => unknown} t - Translation lookup function.
 * @param {string} key - Translation key to resolve.
 * @param {string} [fallback] - Optional explicit fallback string.
 *
 * @returns {string} Trimmed translation string or fallback.
 */
const translateSchemaText = (t, key, fallback) => {
	const options = fallback !== undefined ? { defaultValue: fallback } : {};
	const raw = t(key, options);

	if (
		typeof raw === "string"
		&& raw.trim().length > 0
		&& (fallback === undefined || raw !== key)
	) {
		return raw.trim();
	}

	return fallback ?? key;
};

/**
 * Generates the full set of localized structured data schemas for a given page.
 *
 * @remarks
 * Produces `SoftwareApplication`, `Organization`, `WebSite`, and `ItemList` schemas
 * for all routes, plus `WebPage` and `BreadcrumbList` schemas for secondary routes.
 * Never emits `FAQPage` JSON-LD (restricted by Google to authoritative government and health sites).
 *
 * @param {import('i18next').TFunction | ((key: string, options?: Record<string, unknown>) => unknown)} t - Translation function (i18next-compatible).
 * @param {string} lang - Current language code (e.g., `'en'`, `'fr'`).
 * @param {string} url - Current page canonical URL.
 * @param {string} [version] - Optional explicit application version.
 *
 * @returns {Array<Record<string, unknown>>} Array of Schema.org JSON-LD objects.
 *
 * @see {@link DEFAULT_SOFTWARE_KEYWORDS}
 * @see {@link getPageById}
 * @see {@link getPageContentLanguages}
 * @see {@link getSchemaDomId}
 * @see {@link resolveAppVersion}
 * @see {@link resolveFeatureList}
 * @see {@link translateSchemaText}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const schemas = getLocalizedSchema(t, "en", "https://nms-optimizer.app/");
 * // returns [{ "@type": "SoftwareApplication", ... }, ...]
 * ```
 */
export const getLocalizedSchema = (t, lang, url, version) => {
	const baseUrl = "https://nms-optimizer.app";
	const appName = translateSchemaText(t, "appName", "NMS Optimizer");
	const appDescription = translateSchemaText(t, "seo.appDescription");

	const urlObj = new URL(url);
	const isHomePage = urlObj.pathname === "/" || urlObj.pathname === `/${lang}/`;

	// 1. SoftwareApplication (without unverified/hidden aggregateRating)
	const softwareApp = {
		"@context": "https://schema.org",
		"@id": `${url}#software`,
		"@type": "SoftwareApplication",
		applicationCategory: "UtilitiesApplication",
		author: {
			"@type": "Person",
			name: "jbelew",
			url: "https://github.com/jbelew",
		},
		browserRequirements: "Requires JavaScript. Requires HTML5.",
		description: appDescription,
		featureList: resolveFeatureList(t),
		genre: translateSchemaText(t, "seo.genre", "Game Tool"),
		inLanguage: lang,
		keywords: translateSchemaText(t, "seo.keywords", DEFAULT_SOFTWARE_KEYWORDS),
		name: appName,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		operatingSystem: "All modern web browsers",
		screenshot: `${baseUrl}/assets/img/screenshots/screenshot.webp`,
		...(resolveAppVersion(version) ? { softwareVersion: resolveAppVersion(version) } : {}),
		url: url,
	};

	// 2. Organization
	const organization = {
		"@context": "https://schema.org",
		"@id": `${baseUrl}/#organization`,
		"@type": "Organization",
		logo: `${baseUrl}/logo.svg`,
		name: appName,
		sameAs: ["https://github.com/jbelew/nms_optimizer-web"],
		url: `${baseUrl}/`,
	};

	// 3. WebSite (anchored to site/locale root)
	const webSite = {
		"@context": "https://schema.org",
		"@id": isHomePage ? `${url}#website` : `${baseUrl}/#website`,
		"@type": "WebSite",
		alternateName: [appName, "No Man's Sky Technology Layout Optimizer"],
		description: appDescription,
		inLanguage: lang,
		name: appName,
		publisher: { "@id": `${baseUrl}/#organization` },
		url: isHomePage ? url : `${baseUrl}/`,
	};

	// 4. BreadcrumbList (with localized home URL and no double slashes)
	const pathParts = urlObj.pathname.split("/").filter(Boolean);
	const homeUrl = lang === "en" ? `${baseUrl}/` : `${baseUrl}/${lang}/`;
	const itemListElement = [
		{
			"@type": "ListItem",
			item: homeUrl,
			name: translateSchemaText(t, "seo.nav.home", "Home"),
			position: 1,
		},
	];

	// Breadcrumb logic for secondary pages
	let pageName = "";

	if (pathParts.length > 0 && pathParts[0] !== lang) {
		pageName = pathParts[pathParts.length - 1];
	} else if (pathParts.length > 1 && pathParts[0] === lang) {
		pageName = pathParts[pathParts.length - 1];
	}

	if (pageName) {
		itemListElement.push({
			"@type": "ListItem",
			item: url,
			name: translateSchemaText(t, `seo.nav.${pageName}`, pageName),
			position: 2,
		});
	}

	// 5. WebPage schema for subpages
	let webPage = null;

	if (!isHomePage) {
		const pageEntry = pageName ? getPageById(pageName) : undefined;
		const descriptionKey =
			pageEntry?.seoDescriptionKey || (pageName ? `seo.${pageName}Description` : "");
		const titleKey = pageEntry?.seoTitleKey || (pageName ? `seo.${pageName}PageTitle` : "");

		webPage = {
			"@context": "https://schema.org",
			"@id": `${url}#webpage`,
			"@type": "WebPage",
			description:
				descriptionKey ?
					translateSchemaText(t, descriptionKey, appDescription)
				:	appDescription,
			inLanguage: lang,
			isPartOf: { "@id": `${baseUrl}/#website` },
			name: titleKey ? translateSchemaText(t, titleKey, appName) : appName,
			url: url,
		};
	}

	// 6. SiteNavigationElement (localized URLs without double slashes, canonicalizing partial-translation fallbacks)
	const navPageIds = ["instructions", "about", "changelog", "userstats", "privacy"];
	const navPaths = navPageIds.map((navPageId) => {
		const navPage = getPageById(navPageId);
		const navContentLangs = getPageContentLanguages(navPage);
		const navLangPrefix = lang !== "en" && navContentLangs.includes(lang) ? `/${lang}` : "";

		return {
			name: translateSchemaText(t, `seo.nav.${navPageId}`),
			url: `${baseUrl}${navLangPrefix}/${navPageId}/`,
		};
	});

	const siteNavigation = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: navPaths.map((nav, index) => ({
			"@type": "SiteNavigationElement",
			name: nav.name,
			position: index + 1,
			url: nav.url,
		})),
		name: translateSchemaText(t, "seo.nav.home", "Site Navigation"),
	};

	const schemas = [softwareApp, organization, webSite, siteNavigation];

	if (webPage) {
		schemas.push(webPage);
	}

	// Per Google's structured-data guidance, BreadcrumbList must contain at
	// least 2 items. Emitting a single-item breadcrumb (e.g. on the homepage)
	// is treated as invalid markup, so omit the schema entirely in that case.
	if (itemListElement.length >= 2) {
		schemas.push({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement,
		});
	}

	return schemas;
};
