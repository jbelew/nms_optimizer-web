import React, { useEffect, useMemo } from "react";
import { DEFAULT_BASE_URL, getPageMetadata } from "@shared/page-metadata.js";
import { OG_LOCALE_MAP } from "@shared/seo-schema.js";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { useSupportedLanguages } from "@/hooks/useSupportedLanguages";

/**
 * Normalizes a path to ensure it ends with a trailing slash.
 *
 * @param {string} p - The path to normalize.
 *
 * @returns {string} The normalized path.
 */
const normalizePath = (p: string) => (p.endsWith("/") ? p : `${p}/`);

/**
 * Declarative SEO component for React 19.
 * Handles title, meta tags, and structured data by rendering them directly in the component.
 * React 19 will automatically hoist these to the document head.
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
			<meta content={pageDescription} name="description" />
			<meta content={pageKeywords} name="keywords" />
			<link href={canonicalUrl} rel="canonical" />

			{/* hreflang tags */}
			<link
				href={`${DEFAULT_BASE_URL}${cleanPath || "/"}`}
				hrefLang="x-default"
				rel="alternate"
			/>
			{supportedLangs.map((lang) => {
				const path =
					lang === "en"
						? normalizePath(cleanPath || "/")
						: `/${lang}${normalizePath(cleanPath)}`;

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
			<meta content={t("appName")} property="og:site_name" />
			<meta content={pageTitle} property="og:title" />
			<meta content={pageDescription} property="og:description" />
			<meta content={ogImageUrl} property="og:image" />
			<meta content="image/png" property="og:image:type" />
			<meta content="1280" property="og:image:width" />
			<meta content="880" property="og:image:height" />
			<meta content={ogImageAlt} property="og:image:alt" />
			<meta content={canonicalUrl} property="og:url" />
			<meta content={ogLocale} property="og:locale" />
			{Object.entries(OG_LOCALE_MAP).map(([code, locale]) => {
				if (code === i18n.language) return null;

				return <meta content={locale} key={code} property="og:locale:alternate" />;
			})}

			{/* Twitter */}
			<meta content="summary_large_image" name="twitter:card" />
			<meta content={pageTitle} name="twitter:title" />
			<meta content={pageDescription} name="twitter:description" />
			<meta content={ogImageUrl} name="twitter:image" />
			<meta content={ogImageAlt} name="twitter:image:alt" />
		</>
	);
};
