import type React from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { resetPageViewTracking, trackRoutePageView } from "@/utils/analytics/pageView";
import { buildLocalizedPath, useSupportedLanguages } from "@/utils/system/dialogUtils";
import { DEFAULT_BASE_URL, getPageMetadata } from "@shared/page-metadata.js";
import { getSchemaDomId, MANAGED_SCHEMA_IDS, OG_LOCALE_MAP } from "@shared/seo-schema.js";

/**
 * Updates an existing singleton element in `document.head` in-place or creates it if absent,
 * removing any duplicate matching elements.
 *
 * @param tagName - HTML tag name (`"meta"` or `"link"`).
 * @param matchAttr - Attribute used to locate the element (`"name"`, `"property"`, or `"rel"`).
 * @param matchValue - Attribute value used to locate the element.
 * @param valueAttr - Attribute that holds the target value (`"content"` or `"href"`).
 * @param value - Resolved attribute value to assign.
 */
const upsertHeadElement = (
	tagName: "link" | "meta",
	matchAttr: "name" | "property" | "rel",
	matchValue: string,
	valueAttr: "content" | "href",
	value: string,
): void => {
	const matches = document.head.querySelectorAll<HTMLElement>(
		`${tagName}[${matchAttr}="${matchValue}"]`,
	);

	for (let i = 1; i < matches.length; i++) {
		matches[i]?.remove();
	}

	const existing = matches[0];

	if (existing) {
		if (existing.getAttribute(valueAttr) !== value) {
			existing.setAttribute(valueAttr, value);
		}

		return;
	}

	const el = document.createElement(tagName);
	el.setAttribute(matchAttr, matchValue);
	el.setAttribute(valueAttr, value);
	document.head.appendChild(el);
};

/**
 * Updates an existing `<meta>` tag in `document.head` in-place or creates it if absent,
 * removing any duplicate matching elements.
 *
 * @param attrName - Attribute used to match the meta tag (`"name"` or `"property"`).
 * @param attrValue - Value of the matching attribute (e.g., `"description"`, `"og:title"`).
 * @param content - Resolved content value to assign.
 */
const upsertMetaTag = (attrName: "name" | "property", attrValue: string, content: string): void => {
	upsertHeadElement("meta", attrName, attrValue, "content", content);
};

/**
 * Updates the `<link rel="canonical">` tag in `document.head` in-place or creates it if absent,
 * removing any duplicate canonical link elements.
 *
 * @param href - Resolved canonical URL.
 */
const upsertCanonicalLink = (href: string): void => {
	upsertHeadElement("link", "rel", "canonical", "href", href);
};

/**
 * Synchronizes `<link rel="alternate" hreflang="...">` tags in `document.head` in-place,
 * deduplicating pre-rendered or stale alternate links.
 *
 * @param cleanPath - Normalized route path without locale prefix.
 * @param supportedLangs - Supported language codes.
 */
const syncHreflangLinks = (cleanPath: string, supportedLangs: string[]): void => {
	const desiredEntries: Array<[string, string]> = [
		["x-default", `${DEFAULT_BASE_URL}${cleanPath || "/"}`],
		...supportedLangs.map((lang): [string, string] => [
			lang,
			`${DEFAULT_BASE_URL}${buildLocalizedPath(cleanPath || "/", lang, supportedLangs)}`,
		]),
	];
	const desiredMap = new Map<string, string>(desiredEntries);
	const seenLangs = new Set<string>();

	const existingLinks = document.head.querySelectorAll<HTMLLinkElement>(
		'link[rel="alternate"][hreflang]',
	);

	existingLinks.forEach((link) => {
		const hreflang = link.getAttribute("hreflang");

		if (!hreflang || !desiredMap.has(hreflang) || seenLangs.has(hreflang)) {
			link.remove();

			return;
		}

		seenLangs.add(hreflang);
		const targetHref = desiredMap.get(hreflang)!;

		if (link.getAttribute("href") !== targetHref) {
			link.setAttribute("href", targetHref);
		}
	});

	for (const [hreflang, href] of desiredEntries) {
		if (seenLangs.has(hreflang)) continue;

		const link = document.createElement("link");
		link.setAttribute("rel", "alternate");
		link.setAttribute("hreflang", hreflang);
		link.setAttribute("href", href);
		document.head.appendChild(link);
	}
};

/**
 * Synchronizes `<meta property="og:locale:alternate">` tags in `document.head` in-place.
 *
 * @param activeLang - Currently active locale code.
 */
const syncAlternateOgLocales = (activeLang: string): void => {
	const desiredLocales = Object.entries(OG_LOCALE_MAP)
		.filter(([code]) => code !== activeLang)
		.map(([, locale]) => locale);

	const existingMetas = document.head.querySelectorAll<HTMLMetaElement>(
		'meta[property="og:locale:alternate"]',
	);

	for (let i = desiredLocales.length; i < existingMetas.length; i++) {
		existingMetas[i]?.remove();
	}

	desiredLocales.forEach((locale, index) => {
		const existing = existingMetas[index];

		if (existing) {
			if (existing.getAttribute("content") !== locale) {
				existing.setAttribute("content", locale);
			}

			return;
		}

		const meta = document.createElement("meta");
		meta.setAttribute("property", "og:locale:alternate");
		meta.setAttribute("content", locale);
		document.head.appendChild(meta);
	});
};

/**
 * Declarative SEO and route metadata module.
 *
 * @remarks
 * Computes unified route metadata once per navigation, synchronizes `<title>`, `<meta>`,
 * `<link>`, and JSON-LD structured data schemas in-place within `document.head` (avoiding
 * duplicate tags when mounting via `createRoot` over SSG HTML), updates
 * `document.documentElement.lang`, and dispatches the GA4 `page_view` event
 * via {@link trackRoutePageView}.
 *
 * @see {@link getPageMetadata}
 * @see {@link getSchemaDomId}
 * @see {@link MANAGED_SCHEMA_IDS}
 * @see {@link OG_LOCALE_MAP}
 * @see {@link buildLocalizedPath}
 * @see {@link trackRoutePageView}
 * @see {@link ./Seo.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Seo />
 * // synchronizes head tags in-place and dispatches page_view telemetry
 * ```
 */
export const Seo: React.FC = () => {
	const { i18n, t } = useTranslation();
	const location = useLocation();
	const supportedLangs = useSupportedLanguages();

	const {
		canonicalUrl,
		cleanPath,
		description: pageDescription,
		keywords: pageKeywords,
		ogImageAlt,
		ogImageUrl,
		ogLocale,
		schemas,
		title: pageTitle,
	} = useMemo(() => {
		return getPageMetadata({
			lang: i18n.language,
			pathname: location.pathname,
			supportedLanguages: supportedLangs,
			t,
		});
	}, [location.pathname, i18n.language, t, supportedLangs]);

	const appName = t("appName");

	useEffect(() => {
		return () => {
			resetPageViewTracking();
		};
	}, []);

	useEffect(() => {
		const titles = document.head.querySelectorAll("title");

		for (let i = 1; i < titles.length; i++) {
			titles[i]?.remove();
		}

		if (document.title !== pageTitle) {
			document.title = pageTitle;
		}

		upsertMetaTag("name", "description", pageDescription);
		upsertMetaTag("name", "keywords", pageKeywords);
		upsertCanonicalLink(canonicalUrl);
		syncHreflangLinks(cleanPath || "/", supportedLangs);

		upsertMetaTag("property", "og:site_name", appName);
		upsertMetaTag("property", "og:title", pageTitle);
		upsertMetaTag("property", "og:description", pageDescription);
		upsertMetaTag("property", "og:image", ogImageUrl);
		upsertMetaTag("property", "og:image:type", "image/webp");
		upsertMetaTag("property", "og:image:width", "1280");
		upsertMetaTag("property", "og:image:height", "880");
		upsertMetaTag("property", "og:image:alt", ogImageAlt);
		upsertMetaTag("property", "og:url", canonicalUrl);
		upsertMetaTag("property", "og:locale", ogLocale);
		syncAlternateOgLocales(i18n.language);

		upsertMetaTag("name", "twitter:card", "summary_large_image");
		upsertMetaTag("name", "twitter:title", pageTitle);
		upsertMetaTag("name", "twitter:description", pageDescription);
		upsertMetaTag("name", "twitter:image", ogImageUrl);
		upsertMetaTag("name", "twitter:image:alt", ogImageAlt);
	}, [
		appName,
		canonicalUrl,
		cleanPath,
		i18n.language,
		ogImageAlt,
		ogImageUrl,
		ogLocale,
		pageDescription,
		pageKeywords,
		pageTitle,
		supportedLangs,
	]);

	useEffect(() => {
		document.documentElement.lang = i18n.language;

		trackRoutePageView({
			cleanPath,
			lang: i18n.language,
			page: location.pathname + location.search,
			pageTitle,
			search: location.search || window.location.search,
		});
	}, [cleanPath, location.pathname, location.search, i18n.language, pageTitle]);

	useEffect(() => {
		const activeSchemaIds = new Set<string>();

		// Update pre-rendered or existing JSON-LD scripts in-place when serialized content
		// differs, or append missing ones, avoiding unnecessary DOM churn on initial boot.
		schemas.forEach((schema) => {
			const id = getSchemaDomId(schema);
			const serialized = JSON.stringify(schema);
			activeSchemaIds.add(id);

			const existing = document.getElementById(id);

			if (existing instanceof HTMLScriptElement) {
				if (existing.textContent !== serialized) {
					existing.textContent = serialized;
				}
			} else {
				if (existing) {
					existing.remove();
				}

				const script = document.createElement("script");
				script.id = id;
				script.type = "application/ld+json";
				script.textContent = serialized;
				document.head.appendChild(script);
			}
		});

		// Remove stale schema scripts that are not part of the active route's schemas.
		MANAGED_SCHEMA_IDS.forEach((id) => {
			if (!activeSchemaIds.has(id)) {
				document.getElementById(id)?.remove();
			}
		});
	}, [schemas]);

	return null;
};
