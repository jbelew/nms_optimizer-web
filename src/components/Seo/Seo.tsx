import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { sendEvent } from "@/utils/analytics/tracking";
import { buildLocalizedPath, useSupportedLanguages } from "@/utils/system/dialogUtils";
import { DEFAULT_BASE_URL, getPageMetadata } from "@shared/page-metadata.js";
import { OG_LOCALE_MAP } from "@shared/seo-schema.js";

/**
 * Declarative SEO and route metadata module for React 19.
 *
 * @remarks
 * Computes unified route metadata once per navigation, hoists `<title>`, `<meta>`,
 * and `<link>` tags into `<head>`, injects JSON-LD structured data schemas,
 * synchronizes `document.documentElement.lang`, and dispatches the GA4 `page_view` event.
 *
 * @returns Hoisted document head metadata elements.
 *
 * @see {@link getPageMetadata}
 * @see {@link buildLocalizedPath}
 * @see {@link sendEvent}
 * @see {@link ./Seo.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <Seo />
 * // renders head tags and dispatches page_view telemetry
 * ```
 */
export const Seo: React.FC = () => {
	const { i18n, t } = useTranslation();
	const location = useLocation();
	const supportedLangs = useSupportedLanguages();
	const prevUrlRef = useRef<string>(document.referrer);

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

	useEffect(() => {
		document.documentElement.lang = i18n.language;

		// Dispatch manual page_view event with resolved document title
		sendEvent({
			action: "page_view",
			category: "engagement",
			page: location.pathname + location.search,
			page_location: window.location.href,
			page_referrer: prevUrlRef.current,
			page_title: pageTitle,
		});

		prevUrlRef.current = window.location.href;
	}, [location.pathname, location.search, i18n.language, pageTitle]);

	useEffect(() => {
		// Clean up any existing JSON-LD schema scripts (from SSG or previous client-side routes)
		// to prevent duplication, as React 19 handles inline scripts by appending them without deduplication.
		const schemaIds = [
			"software-schema",
			"softwareapplication-schema",
			"website-schema",
			"webpage-schema",
			"org-schema",
			"organization-schema",
			"breadcrumb-schema",
			"breadcrumblist-schema",
			"itemlist-schema",
			"faqpage-schema",
		];
		schemaIds.forEach((id) => {
			const el = document.getElementById(id);

			if (el) {
				el.remove();
			}
		});

		// Inject current schemas dynamically into the document head.
		const activeScripts: HTMLScriptElement[] = [];
		schemas.forEach((schema) => {
			const type = (schema as { "@type": string })["@type"];

			const id = `${type?.toLowerCase()}-schema`;
			const script = document.createElement("script");
			script.id = id;
			script.type = "application/ld+json";
			script.textContent = JSON.stringify(schema);
			document.head.appendChild(script);
			activeScripts.push(script);
		});

		// Cleanup inserted scripts on unmount or when schemas update
		return () => {
			activeScripts.forEach((script) => {
				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}
			});
		};
	}, [schemas]);

	return (
		<>
			<title>{pageTitle}</title>
			<meta
				content={pageDescription}
				name="description"
			/>
			<meta
				content={pageKeywords}
				name="keywords"
			/>
			<link
				href={canonicalUrl}
				rel="canonical"
			/>

			{/* hreflang tags */}
			<link
				href={`${DEFAULT_BASE_URL}${cleanPath || "/"}`}
				hrefLang="x-default"
				rel="alternate"
			/>
			{supportedLangs.map((lang) => {
				const path = buildLocalizedPath(cleanPath || "/", lang, supportedLangs);

				return (
					<link
						href={`${DEFAULT_BASE_URL}${path}`}
						hrefLang={lang}
						key={lang}
						rel="alternate"
					/>
				);
			})}

			{/* Open Graph */}
			<meta
				content={t("appName")}
				property="og:site_name"
			/>
			<meta
				content={pageTitle}
				property="og:title"
			/>
			<meta
				content={pageDescription}
				property="og:description"
			/>
			<meta
				content={ogImageUrl}
				property="og:image"
			/>
			<meta
				content="image/png"
				property="og:image:type"
			/>
			<meta
				content="1280"
				property="og:image:width"
			/>
			<meta
				content="880"
				property="og:image:height"
			/>
			<meta
				content={ogImageAlt}
				property="og:image:alt"
			/>
			<meta
				content={canonicalUrl}
				property="og:url"
			/>
			<meta
				content={ogLocale}
				property="og:locale"
			/>
			{Object.entries(OG_LOCALE_MAP).map(([code, locale]) => {
				if (code === i18n.language) return null;

				return (
					<meta
						content={locale}
						key={code}
						property="og:locale:alternate"
					/>
				);
			})}

			{/* Twitter */}
			<meta
				content="summary_large_image"
				name="twitter:card"
			/>
			<meta
				content={pageTitle}
				name="twitter:title"
			/>
			<meta
				content={pageDescription}
				name="twitter:description"
			/>
			<meta
				content={ogImageUrl}
				name="twitter:image"
			/>
			<meta
				content={ogImageAlt}
				name="twitter:image:alt"
			/>
		</>
	);
};
