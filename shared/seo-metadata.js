/**
 * @file A map of URL paths to their corresponding SEO translation keys.
 * This is the single source of truth for SEO metadata for both server-side rendering and client-side updates.
 */

export const seoMetadata = {
	"/": {
		descriptionKey: "seo.appDescription",
		titleKey: "seo.mainPageTitle",
	},
	"/about/": {
		descriptionKey: "seo.aboutDescription",
		titleKey: "seo.aboutPageTitle",
	},
	"/changelog/": {
		descriptionKey: "seo.changelogDescription",
		titleKey: "seo.changelogPageTitle",
	},
	"/instructions/": {
		descriptionKey: "seo.instructionsDescription",
		titleKey: "seo.instructionsPageTitle",
	},
	"/performance/": {
		descriptionKey: "seo.performanceDescription",
		titleKey: "seo.performancePageTitle",
	},
	"/privacy/": {
		descriptionKey: "seo.privacyDescription",
		titleKey: "seo.privacyPageTitle",
	},
	"/translation/": {
		descriptionKey: "seo.translationDescription",
		titleKey: "seo.translationPageTitle",
	},
	"/userstats/": {
		descriptionKey: "seo.userstatsDescription",
		titleKey: "seo.userstatsPageTitle",
	},
};
