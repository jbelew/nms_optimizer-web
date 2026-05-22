/**
 * @file Structured data (JSON-LD) templates for NMS Optimizer.
 * Consolidates SEO schema for both React (CSR) and SSG layers to ensure parity.
 */

/**
 * Maps a supported i18next language code to a Facebook/Open Graph locale tag
 * (BCP-47 with underscore, e.g. `en_US`).
 *
 * @type {Record<string, string>}
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
 * Returns the Open Graph locale for a given language code, falling back to
 * `en_US` when the language is not in the mapping.
 *
 * @param {string} lang - i18n language code (e.g. `de`)
 * @returns {string} OG locale tag (e.g. `de_DE`)
 */
export const getOgLocale = (lang) => OG_LOCALE_MAP[lang] || "en_US";

/**
 * Generates the full set of localized structured data for a given page.
 *
 * @param {import('i18next').TFunction} t - Translation function (i18next-compatible)
 * @param {string} lang - Current language code (e.g., 'en', 'fr')
 * @param {string} url - Current page canonical URL
 * @returns {Array<Record<string, unknown>>} Array of schema.org objects
 *
 * @example
 * ```ts
 * const schemas = getLocalizedSchema(t, "en", "https://nms-optimizer.app/");
 * ```
 */
export const getLocalizedSchema = (t, lang, url) => {
	const baseUrl = "https://nms-optimizer.app/";
	const appName = t("appName", { defaultValue: "NMS Optimizer" });
	const appDescription = t("seo.appDescription");

	// 1. SoftwareApplication
	const softwareApp = {
		"@context": "https://schema.org",
		"@id": `${url}#software`,
		"@type": "SoftwareApplication",
		aggregateRating: {
			"@type": "AggregateRating",
			bestRating: "5",
			ratingCount: "28",
			ratingValue: "4.9",
			worstRating: "1",
		},
		applicationCategory: "UtilitiesApplication",
		author: {
			"@type": "Person",
			name: "jbelew",
			url: "https://github.com/jbelew",
		},
		description: appDescription,
		genre: t("seo.genre", { defaultValue: "Game Tool" }),
		inLanguage: lang,
		name: appName,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		operatingSystem: "Web",
		url: url,
	};

	// 2. Organization
	const organization = {
		"@context": "https://schema.org",
		"@id": `${baseUrl}#organization`,
		"@type": "Organization",
		logo: `${baseUrl}logo.svg`,
		name: appName,
		sameAs: ["https://github.com/jbelew/nms_optimizer-web"],
		url: baseUrl,
	};

	// 3. WebSite
	const webSite = {
		"@context": "https://schema.org",
		"@id": `${url}#website`,
		"@type": "WebSite",
		alternateName: [appName, "No Man's Sky Technology Layout Optimizer"],
		description: appDescription,
		inLanguage: lang,
		name: appName,
		publisher: { "@id": `${baseUrl}#organization` },
		url: url,
	};

	// 5. BreadcrumbList
	const urlObj = new URL(url);
	const pathParts = urlObj.pathname.split("/").filter(Boolean);
	const itemListElement = [
		{
			"@type": "ListItem",
			item: `${baseUrl}/`,
			name: t("seo.nav.home", { defaultValue: "Home" }),
			position: 1,
		},
	];

	// Simple breadcrumb logic for secondary pages
	// Handle both /page/ and /lang/page/
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
			name: t(`seo.nav.${pageName}`, { defaultValue: pageName }),
			position: 2,
		});
	}

	// 6. SiteNavigationElement
	const navPaths = [
		{ name: t("seo.nav.instructions"), url: `${baseUrl}/instructions/` },
		{ name: t("seo.nav.about"), url: `${baseUrl}/about/` },
		{ name: t("seo.nav.changelog"), url: `${baseUrl}/changelog/` },
		{ name: t("seo.nav.userstats"), url: `${baseUrl}/userstats/` },
		{ name: t("seo.nav.privacy"), url: `${baseUrl}/privacy/` },
	];

	const siteNavigation = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: navPaths.map((nav, index) => ({
			"@type": "SiteNavigationElement",
			name: nav.name,
			position: index + 1,
			url: nav.url,
		})),
		name: t("seo.nav.home", { defaultValue: "Site Navigation" }),
	};

	const schemas = [softwareApp, organization, webSite, siteNavigation];

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
