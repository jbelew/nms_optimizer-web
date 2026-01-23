import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { seoMetadata } from "../../../shared/seo-metadata.js";
import { sendEvent } from "../../utils/analytics";

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
 * Updates a meta property tag in the document's head (e.g., og:url).
 * @param {string} property - The property attribute of the meta tag.
 * @param {string} content - The new content for the meta tag.
 */
const updateMetaPropertyTag = (property: string, content: string) => {
	let element = document.querySelector(`meta[property="${property}"]`);

	if (!element) {
		element = document.createElement("meta");
		element.setAttribute("property", property);
		document.head.appendChild(element);
	}

	element.setAttribute("content", content);
};

/**
 * Updates or creates the canonical link tag.
 * @param {string} href - The canonical URL.
 */
const updateCanonicalTag = (href: string) => {
	let element = document.querySelector('link[rel="canonical"]');

	if (!element) {
		element = document.createElement("link");
		element.setAttribute("rel", "canonical");
		document.head.appendChild(element);
	}

	element.setAttribute("href", href);
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

		// --- Social Media Tags ---
		updateMetaPropertyTag("og:title", pageTitle);
		updateMetaPropertyTag("og:description", pageDescription);
		updateMetaTag("twitter:title", pageTitle);
		updateMetaTag("twitter:description", pageDescription);

		// --- Canonical URL Logic ---
		const baseUrl = "https://nms-optimizer.app";
		const cleanPath = currentPath === "/" ? "" : currentPath;
		// If language is English, canonical is just the clean path. Otherwise, include lang prefix.
		const canonicalPath =
			i18n.language === "en" ? cleanPath || "/" : `/${i18n.language}${cleanPath}`;
		const canonicalUrl = `${baseUrl}${canonicalPath}`;

		updateCanonicalTag(canonicalUrl);
		updateMetaPropertyTag("og:url", canonicalUrl);

		document.documentElement.lang = i18n.language;

		// --- Analytics Page View ---
		// We send this manually here because automatic page views are disabled in analytics.ts
		// to allow us to control the timing and include the correct document title.
		sendEvent({
			action: "page_view",
			category: "engagement",
			label: pageTitle,
			page: location.pathname + location.search,
		});
	}, [location.pathname, location.search, t, i18n]);
};
