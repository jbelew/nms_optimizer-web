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
	const baseUrl = "https://nms-optimizer.app";
	const appName = t("appName", { defaultValue: "NMS Optimizer" });
	const appDescription = t("seo.appDescription");

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
		featureList: [
			"Simulated annealing and ML layout optimization",
			"Adjacency bonus calculation and visualization",
			"Supercharged slot prioritization",
			"Support for Starships, Multi-tools, Corvettes, Freighters, Exosuits, and Exocrafts",
			"Offline Progressive Web App (PWA) support",
		],
		genre: t("seo.genre", { defaultValue: "Game Tool" }),
		inLanguage: lang,
		name: appName,
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		operatingSystem: "All modern web browsers",
		screenshot: `${baseUrl}/assets/img/screenshots/screenshot.png`,
		softwareVersion: "7.6.0",
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
			name: t("seo.nav.home", { defaultValue: "Home" }),
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
			name: t(`seo.nav.${pageName}`, { defaultValue: pageName }),
			position: 2,
		});
	}

	// 5. WebPage schema for subpages
	let webPage = null;

	if (!isHomePage) {
		webPage = {
			"@context": "https://schema.org",
			"@id": `${url}#webpage`,
			"@type": "WebPage",
			description: appDescription,
			inLanguage: lang,
			isPartOf: { "@id": `${baseUrl}/#website` },
			name: pageName ? t(`seo.${pageName}PageTitle`, { defaultValue: appName }) : appName,
			url: url,
		};
	}

	// 6. SiteNavigationElement (localized URLs without double slashes)
	const langPrefix = lang === "en" ? "" : `/${lang}`;
	const navPaths = [
		{ name: t("seo.nav.instructions"), url: `${baseUrl}${langPrefix}/instructions/` },
		{ name: t("seo.nav.about"), url: `${baseUrl}${langPrefix}/about/` },
		{ name: t("seo.nav.changelog"), url: `${baseUrl}${langPrefix}/changelog/` },
		{ name: t("seo.nav.userstats"), url: `${baseUrl}${langPrefix}/userstats/` },
		{ name: t("seo.nav.privacy"), url: `${baseUrl}${langPrefix}/privacy/` },
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
