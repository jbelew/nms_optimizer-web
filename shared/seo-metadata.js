/**
 * @file A map of URL paths to their corresponding SEO translation keys.
 * This is the single source of truth for SEO metadata for both server-side rendering and client-side updates.
 */

export const seoMetadata = {
	"/": {
		titleKey: "seo.mainPageTitle",
		descriptionKey: "seo.appDescription",
	},
	"/instructions": {
		titleKey: "seo.instructionsPageTitle",
		descriptionKey: "seo.instructionsDescription",
	},
	"/about": {
		titleKey: "seo.aboutPageTitle",
		descriptionKey: "seo.aboutDescription",
	},
	"/changelog": {
		titleKey: "seo.changelogPageTitle",
		descriptionKey: "seo.changelogDescription",
	},
	"/translation": {
		titleKey: "seo.translationPageTitle",
		descriptionKey: "seo.translationDescription",
	},
	"/userstats": {
		titleKey: "seo.userstatsPageTitle",
		descriptionKey: "seo.userstatsDescription",
	},
};
