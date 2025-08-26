import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import i18n from "../../i18n/i18n";

/**
 * Updates a meta tag with the given name and content.
 * If the tag doesn't exist, it creates it.
 * @param name - The name of the meta tag.
 * @param content - The content of the meta tag.
 */
const updateMetaTag = (name: string, content: string) => {
	let metaTag = document.querySelector(`meta[name="${name}"]`);
	if (!metaTag) {
		metaTag = document.createElement("meta");
		metaTag.setAttribute("name", name);
		document.head.appendChild(metaTag);
	}
	metaTag.setAttribute("content", content);
};

/**
 * Updates a meta tag with the given property and content.
 * If the tag doesn't exist, it creates it.
 * @param property - The property of the meta tag.
 * @param content - The content of the meta tag.
 */
const updatePropertyMetaTag = (property: string, content: string) => {
	let metaTag = document.querySelector(`meta[property="${property}"]`);
	if (!metaTag) {
		metaTag = document.createElement("meta");
		metaTag.setAttribute("property", property);
		document.head.appendChild(metaTag);
	}
	metaTag.setAttribute("content", content);
};

/**
 * Custom hook for managing the document title and SEO-related meta tags.
 * This hook updates the document's title, meta description, keywords,
 * Open Graph tags, and hreflang links based on the current route and language.
 */
export const useSeoAndTitle = () => {
	const { t } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const appName = t("appName");
		let pageTitle = appName;
		let pageDescription = t("seo.defaultDescription");
		let pageKeywords = t("seo.defaultKeywords");

		switch (location.pathname) {
			case "/":
				pageTitle = appName;
				pageDescription = t("seo.homeDescription");
				pageKeywords = t("seo.homeKeywords");
				break;
			case "/instructions":
				pageTitle = `${t("dialogs.titles.instructions")} - ${appName}`;
				pageDescription = t("seo.instructionsDescription");
				pageKeywords = t("seo.instructionsKeywords");
				break;
			case "/about":
				pageTitle = `${t("dialogs.titles.about")} - ${appName}`;
				pageDescription = t("seo.aboutDescription");
				pageKeywords = t("seo.aboutKeywords");
				break;
			case "/changelog":
				pageTitle = `${t("dialogs.titles.changelog")} - ${appName}`;
				pageDescription = t("seo.changelogDescription");
				pageKeywords = t("seo.changelogKeywords");
				break;
			case "/translation":
				pageTitle = `${t("dialogs.titles.translationRequest")} - ${appName}`;
				pageDescription = t("seo.translationDescription");
				pageKeywords = t("seo.translationKeywords");
				break;
			case "/userstats":
				pageTitle = `${t("dialogs.titles.userStats")} - ${appName}`;
				pageDescription = t("seo.userStatsDescription");
				pageKeywords = t("seo.userStatsKeywords");
				break;
			default:
				pageTitle = appName;
		}
		document.title = pageTitle;

		updateMetaTag("description", pageDescription);
		updateMetaTag("keywords", pageKeywords);

		// Update Open Graph and Twitter meta tags
		updatePropertyMetaTag("og:title", pageTitle);
		updatePropertyMetaTag("og:description", pageDescription);
		updateMetaTag("twitter:title", pageTitle);
		updateMetaTag("twitter:description", pageDescription);

		// Set the lang attribute on the html tag
		document.documentElement.lang = i18n.language;
	}, [location.pathname, location.search, t]);
};
