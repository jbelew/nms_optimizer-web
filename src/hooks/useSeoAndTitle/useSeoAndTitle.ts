import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { seoMetadata } from "../../../shared/seo-metadata.js";
import { sendEvent } from "../../utils/analytics";

/**
 * Updates or creates a meta tag in the document's head using the `name` attribute.
 *
 * @remarks
 * This internal helper abstracts the DOM manipulation for standard meta tags
 * like `description` or `twitter:title`.
 *
 * @param {string} name - The name attribute of the meta tag.
 * @param {string} content - The content value to set.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```ts
 * updateMetaTag("description", "A guide to NMS optimization.");
 * // Result: <meta name="description" content="..."> is updated or created.
 * ```
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
 * Updates or creates a meta tag in the document's head using the `property` attribute.
 *
 * @remarks
 * Typically used for Open Graph (OG) tags.
 *
 * @param {string} property - The property identifier (e.g., 'og:title'). **Must not be empty.**
 * @param {string} content - The content string for the meta tag.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```typescript
 * updateMetaPropertyTag("og:title", "My Page");
 * // returns void, side-effect: updates <meta property="og:title">
 * ```
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
 * Updates or creates the canonical link tag in the document's head.
 *
 * @param {string} href - The full canonical URL. **Must be a valid URL.**
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```typescript
 * updateCanonicalTag("https://example.com/page");
 * // returns void, side-effect: updates <link rel="canonical">
 * ```
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
 * Updates or creates hreflang link tags in the document's head.
 *
 * @param {string} baseUrl - The base URL of the site.
 * @param {string} cleanPath - The path without language prefix.
 * @param {string[]} languages - Supported language codes.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```typescript
 * updateHreflangTags("https://app.com", "/about", ["en", "fr"]);
 * // returns void, side-effect: updates <link rel="alternate" hreflang="...">
 * ```
 */
const updateHreflangTags = (baseUrl: string, cleanPath: string, languages: string[]) => {
	// Remove existing hreflang tags to avoid duplicates
	document.querySelectorAll("link[hreflang]").forEach((el) => el.remove());

	// Add x-default (English)
	const xDefault = document.createElement("link");
	xDefault.setAttribute("rel", "alternate");
	xDefault.setAttribute("hreflang", "x-default");
	xDefault.setAttribute("href", `${baseUrl}${cleanPath || "/"}`);
	document.head.appendChild(xDefault);

	// Add tags for each language
	languages.forEach((lang) => {
		const link = document.createElement("link");
		link.setAttribute("rel", "alternate");
		link.setAttribute("hreflang", lang);

		const path = lang === "en" ? cleanPath || "/" : `/${lang}${cleanPath}`;
		link.setAttribute("href", `${baseUrl}${path}`);
		document.head.appendChild(link);
	});
};

/**
 * Custom hook for managing SEO metadata and document titles.
 *
 * @remarks
 * This hook automatically updates the document title, meta description, Open Graph tags,
 * and canonical URLs based on the current route and language. It also handles
 * `hreflang` alternates for multilingual indexing and triggers manual
 * page view events for Google Analytics.
 *
 * It acts as the primary SEO driver for the Single Page Application (SPA).
 *
 * @returns {void} Side-effects only; manages document head and sends analytics events.
 *
 * @see {@link seoMetadata} for the source of page-specific titles and descriptions.
 * @see {@link sendEvent} for the analytics reporting implementation.
 * @see {@link ./useSeoAndTitle.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const App = () => {
 *   // Typically called at the root level to react to all route changes
 *   useSeoAndTitle();
 *
 *   return <Routes>...</Routes>;
 * };
 * ```
 */
export const useSeoAndTitle = () => {
	const { t, i18n } = useTranslation();
	const location = useLocation();
	const prevUrlRef = useRef<string>(document.referrer);

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

		// --- Canonical & Hreflang URL Logic ---
		const baseUrl = "https://nms-optimizer.app";
		const cleanPath = currentPath === "/" ? "" : currentPath;
		// If language is English, canonical is just the clean path. Otherwise, include lang prefix.
		const canonicalPath =
			i18n.language === "en" ? cleanPath || "/" : `/${i18n.language}${cleanPath}`;
		const canonicalUrl = `${baseUrl}${canonicalPath}`;

		updateCanonicalTag(canonicalUrl);
		updateMetaPropertyTag("og:url", canonicalUrl);

		// Update hreflang tags for multilingual SEO
		updateHreflangTags(baseUrl, cleanPath, supportedLangs);

		document.documentElement.lang = i18n.language;

		// --- Analytics Page View ---
		// We send this manually here because automatic page views are disabled in analytics.ts
		// to allow us to control the timing and include the correct document title.
		sendEvent({
			action: "page_view",
			category: "engagement",
			page_title: pageTitle,
			page_location: window.location.href,
			page_referrer: prevUrlRef.current,
			page: location.pathname + location.search,
		});

		// Update prevUrlRef for the next navigation
		prevUrlRef.current = window.location.href;
	}, [location.pathname, location.search, t, i18n]);
};
