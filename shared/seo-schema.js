/**
 * @file Structured data (JSON-LD) templates for NMS Optimizer.
 * Consolidates SEO schema for both React (CSR) and SSG layers to ensure parity.
 */

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
		"@id": `${baseUrl}/#software`,
		name: appName,
		description: appDescription,
		operatingSystem: "Web",
		applicationCategory: "UtilitiesApplication",
		genre: "Game Tool",
		url: baseUrl,
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
		name: "NMS Optimizer",
		url: baseUrl,
		logo: `${baseUrl}/logo.svg`,
		sameAs: ["https://github.com/jbelew/nms_optimizer-web"],
	};

	// 3. WebSite
	const webSite = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${baseUrl}/#website`,
		name: appName,
		url: baseUrl,
		description: appDescription,
		inLanguage: lang,
		publisher: { "@id": `${baseUrl}/#organization` },
	};

	// 4. FAQPage (Localized)
	const faqPage = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"@id": `${url}#faqpage`,
		inLanguage: lang,
		name: t("faq.name", { defaultValue: "NMS Optimizer Frequently Asked Questions" }),
		mainEntity: [
			{
				"@type": "Question",
				name: t("faq.questions.adjacencyBonus.name"),
				acceptedAnswer: {
					"@type": "Answer",
					text: t("faq.questions.adjacencyBonus.answer"),
				},
			},
			{
				"@type": "Question",
				name: t("faq.questions.superchargedSlots.name"),
				acceptedAnswer: {
					"@type": "Answer",
					text: t("faq.questions.superchargedSlots.answer"),
				},
			},
			{
				"@type": "Question",
				name: t("faq.questions.calculation.name"),
				acceptedAnswer: {
					"@type": "Answer",
					text: t("faq.questions.calculation.answer"),
				},
			},
			{
				"@type": "Question",
				name: t("faq.questions.platforms.name"),
				acceptedAnswer: {
					"@type": "Answer",
					text: t("faq.questions.platforms.answer"),
				},
			},
		],
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

	const breadcrumbList = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement,
	};

	return [softwareApp, organization, webSite, faqPage, breadcrumbList];
};
