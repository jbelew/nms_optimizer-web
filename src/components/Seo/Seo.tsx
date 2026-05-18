import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { useSupportedLanguages } from "@/hooks/useSupportedLanguages";

import { seoMetadata } from "../../../shared/seo-metadata.js";
import { getLocalizedSchema, getOgLocale, OG_LOCALE_MAP } from "../../../shared/seo-schema.js";

const BASE_URL = "https://nms-optimizer.app";
const OG_IMAGE_PATH = "/assets/img/screenshots/screenshot.png";

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
		currentPath,
		pageDescription,
		pageKeywords,
		pageTitle,
		schemas,
	} = useMemo(() => {
		// Handle language-prefixed routes to determine the base path
		const pathParts = location.pathname.split("/").filter(Boolean);
		const basePath = supportedLangs.includes(pathParts[0])
			? `/${pathParts.slice(1).join("/")}${pathParts.length > 1 ? "/" : ""}`
			: location.pathname;

		// Normalize: ensure trailing slash for lookup (except root)
		const currentPath = basePath === "/" || basePath === "" ? "/" : normalizePath(basePath);

		// Look up metadata for the current path, falling back to root metadata
		const metadata = seoMetadata[currentPath as keyof typeof seoMetadata] || seoMetadata["/"];

		const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });
		const pageDescription = t(metadata.descriptionKey);
		const pageKeywords = t("seo.keywords", { defaultValue: "" });

		const cleanPath = currentPath === "/" ? "" : currentPath;

		const canonicalPath =
			i18n.language === "en"
				? normalizePath(currentPath)
				: `/${i18n.language}${normalizePath(cleanPath)}`;
		const canonicalUrl = `${BASE_URL}${canonicalPath}`;

		const schemas = getLocalizedSchema(t, i18n.language, canonicalUrl);

		return {
			canonicalUrl,
			cleanPath,
			currentPath,
			pageDescription,
			pageKeywords,
			pageTitle,
			schemas,
		};
	}, [location.pathname, i18n.language, t, supportedLangs]);

	const ogImageUrl = `${BASE_URL}${OG_IMAGE_PATH}`;
	const ogImageAlt = t("seo.ogImageAlt", { defaultValue: "NMS Optimizer Screenshot" });

	return (
		<>
			<title>{pageTitle}</title>
			<meta content={pageDescription} name="description" />
			<meta content={pageKeywords} name="keywords" />
			<link href={canonicalUrl} rel="canonical" />

			{/* hreflang tags */}
			<link href={`${BASE_URL}${cleanPath || "/"}`} hrefLang="x-default" rel="alternate" />
			{supportedLangs.map((lang) => {
				const path =
					lang === "en"
						? normalizePath(cleanPath || "/")
						: `/${lang}${normalizePath(cleanPath)}`;

				return (
					<link href={`${BASE_URL}${path}`} hrefLang={lang} key={lang} rel="alternate" />
				);
			})}

			{/* Open Graph */}
			<meta content={t("appName")} property="og:site_name" />
			<meta content={pageTitle} property="og:title" />
			<meta content={pageDescription} property="og:description" />
			<meta content={ogImageUrl} property="og:image" />
			<meta content={ogImageAlt} property="og:image:alt" />
			<meta content={canonicalUrl} property="og:url" />
			<meta content={getOgLocale(i18n.language)} property="og:locale" />
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

			{/* Structured Data */}
			{schemas.map((schema, index) => {
				const type = (schema as { "@type": string })["@type"];
				const id = `${type?.toLowerCase()}-schema`;

				// FAQ schema: Only on root route
				if (type === "FAQPage" && currentPath !== "/") return null;

				return (
					<script id={id} key={`${type}-${index}`} type="application/ld+json">
						{JSON.stringify(schema)}
					</script>
				);
			})}
		</>
	);
};
