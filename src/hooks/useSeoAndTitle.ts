import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import i18n from "../i18n/i18n";

/**
 * Custom hook for managing document title and SEO-related hreflang/canonical tags.
 */
export const useSeoAndTitle = () => {
	const { t } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const appName = t("appName");
		let pageTitle = appName;

		switch (location.pathname) {
			case "/":
				pageTitle = appName;
				break;
			case "/instructions":
				pageTitle = `${t("dialogs.titles.instructions")} - ${appName}`;
				break;
			case "/about":
				pageTitle = `${t("dialogs.titles.about")} - ${appName}`;
				break;
			case "/changelog":
				pageTitle = `${t("dialogs.titles.changelog")} - ${appName}`;
				break;
			case "/translation":
				pageTitle = `${t("dialogs.titles.translationRequest")} - ${appName}`;
				break;
			default:
				pageTitle = appName;
		}
		document.title = pageTitle;

		// Canonical Tag Logic
		let canonicalLink = document.querySelector('link[rel="canonical"]');
		const canonicalUrlObject = new URL(window.location.origin + location.pathname);
		const canonicalParams = new URLSearchParams(location.search);

		// Remove specific parameters that should not affect the canonical URL
		canonicalParams.delete("platform");
		canonicalParams.delete("ship");

		// Only append parameters if they exist
		if (canonicalParams.toString()) {
			canonicalUrlObject.search = canonicalParams.toString();
		}
		const canonicalUrl = canonicalUrlObject.toString();

		if (!canonicalLink) {
			canonicalLink = document.createElement("link");
			canonicalLink.setAttribute("rel", "canonical");
			document.head.appendChild(canonicalLink);
		}
		if (canonicalLink.getAttribute("href") !== canonicalUrl) {
			canonicalLink.setAttribute("href", canonicalUrl);
		}

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
				const defaultUrl = new URL(location.pathname + location.search, window.location.origin);
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
