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
	en: "en_US",
	es: "es_ES",
	fr: "fr_FR",
	de: "de_DE",
	pt: "pt_PT",
	it: "it_IT",
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
	const baseUrl = "https://nms-optimizer.app";
	const appName = t("appName", { defaultValue: "NMS Optimizer" });
	const appDescription = t("seo.appDescription");

	// 1. SoftwareApplication
	const softwareApp = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"@id": `${url}#software`,
		name: appName,
		description: appDescription,
		operatingSystem: "Web",
		applicationCategory: "UtilitiesApplication",
		genre: t("seo.genre", { defaultValue: "Game Tool" }),
		url: url,
		inLanguage: lang,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		author: {
			"@type": "Person",
			name: "jbelew",
			url: "https://github.com/jbelew",
		},
	};

	// 2. Organization
	const organization = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${baseUrl}/#organization`,
		name: appName,
		url: baseUrl,
		logo: `${baseUrl}/logo.svg`,
		sameAs: ["https://github.com/jbelew/nms_optimizer-web"],
	};

	// 3. WebSite
	const webSite = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${url}#website`,
		name: appName,
		url: url,
		description: appDescription,
		inLanguage: lang,
		publisher: { "@id": `${baseUrl}/#organization` },
	};

	// 5. BreadcrumbList
	const urlObj = new URL(url);
	const pathParts = urlObj.pathname.split("/").filter(Boolean);
	const itemListElement = [
		{
			"@type": "ListItem",
			position: 1,
			name: t("seo.nav.home", { defaultValue: "Home" }),
			item: `${baseUrl}/`,
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
			position: 2,
			name: t(`seo.nav.${pageName}`, { defaultValue: pageName }),
			item: url,
		});
	}

	const schemas = [softwareApp, organization, webSite];

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
