import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { seoMetadata } from "../../../shared/seo-metadata.js";

/**
 * Updates a meta tag in the document's head.
 * @param {string} name - The name of the meta tag to update.
 * @param {string} content - The new content for the meta tag.
 */
const updateMetaTag = (name: string, content: string) => {
	let element = document.querySelector(`meta[name="${name}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute("name", name);
		document.head.appendChild(element);
	}
	element.setAttribute("content", content);
};

/**
 * Custom hook for managing document title and SEO meta tags.
 * Updates based on the current route and language by looking up metadata from a shared source.
 */
export const useSeoAndTitle = () => {
	const { t, i18n } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		// Handle language-prefixed routes to determine the base path
		const pathParts = location.pathname.split("/").filter(Boolean);
		const supportedLangs = Object.keys(i18n.services.resourceStore.data || {});
		const basePath = supportedLangs.includes(pathParts[0])
			? `/${pathParts.slice(1).join("/")}`
			: location.pathname;

		const currentPath = basePath === "" ? "/" : basePath;
		// Look up metadata for the current path, falling back to root metadata
		const metadata = seoMetadata[currentPath as keyof typeof seoMetadata] || seoMetadata["/"];

		const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });
		const pageDescription = t(metadata.descriptionKey);

		document.title = pageTitle;
		updateMetaTag("description", pageDescription);

		document.documentElement.lang = i18n.language;
	}, [location.pathname, t, i18n]);
};
