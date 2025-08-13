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
 * Custom hook for managing document title and SEO-related hreflang/canonical tags.
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

		// Hreflang Tags Logic
		const supportedLanguages = i18n.options.supportedLngs || [];
		const defaultLanguage = (i18n.options.fallbackLng as string[])[0] || "en";

		// Get existing hreflang tags
		const existingHreflangTags = Array.from(
			document.querySelectorAll("link[rel='alternate'][hreflang]")
		);
		const existingHreflangMap = new Map<string, HTMLLinkElement>();
		existingHreflangTags.forEach((tag) => {
			const hreflang = tag.getAttribute("hreflang");
			if (hreflang) {
				existingHreflangMap.set(hreflang, tag as HTMLLinkElement);
			}
		});

		const newHreflangUrls = new Map<string, string>();

		supportedLanguages.forEach((lang) => {
			if (lang === "dev" || lang === "cimode") return;

			const url = new URL(location.pathname + location.search, window.location.origin);
			const params = url.searchParams;

			params.delete("platform"); // Remove platform param
			params.delete("grid"); // Remove grid param
			params.set("lng", lang);

			newHreflangUrls.set(lang, url.toString());

			if (lang === defaultLanguage) {
				const defaultUrl = new URL(
					location.pathname + location.search,
					window.location.origin
				);
				const defaultParams = defaultUrl.searchParams;
				defaultParams.delete("platform");
				defaultParams.delete("grid");
				defaultParams.set("lng", defaultLanguage);
				newHreflangUrls.set("x-default", defaultUrl.toString());
			}
		});

		// Update or create hreflang tags
		newHreflangUrls.forEach((href, lang) => {
			let linkTag = existingHreflangMap.get(lang);
			if (linkTag) {
				if (linkTag.getAttribute("href") !== href) {
					linkTag.setAttribute("href", href);
				}
				existingHreflangMap.delete(lang); // Mark as processed
			} else {
				linkTag = document.createElement("link");
				linkTag.rel = "alternate";
				linkTag.hreflang = lang;
				linkTag.href = href;
				document.head.appendChild(linkTag);
			}
		});

		// Remove any remaining (unprocessed) existing hreflang tags
		existingHreflangMap.forEach((tag) => tag.remove());
	}, [location.pathname, location.search, t]);
};
