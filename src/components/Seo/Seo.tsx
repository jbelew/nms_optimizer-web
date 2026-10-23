import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import type { GA4Event } from "@/types/analytics";
import { sendEvent } from "@/utils/analytics/tracking";
import { buildLocalizedPath, useSupportedLanguages } from "@/utils/system/dialogUtils";
import { DEFAULT_BASE_URL, getPageMetadata } from "@shared/page-metadata.js";
import { getSchemaDomId, MANAGED_SCHEMA_IDS, OG_LOCALE_MAP } from "@shared/seo-schema.js";

const ACQUISITION_PARAM_KEYS = [
	"ref",
	"utm_campaign",
	"utm_content",
	"utm_medium",
	"utm_source",
	"utm_term",
] as const;

/**
 * Extracts inbound campaign and referral query parameters (`utm_*`, `ref`) from a URL search string.
 *
 * @param search - Raw URL query string (e.g. `"?utm_source=reddit&utm_medium=post"`).
 *
 * @returns Partial `GA4Event` object containing any non-empty acquisition parameters.
 */
const extractAcquisitionParams = (search: string): Partial<GA4Event> => {
	if (!search) return {};

	const params = new URLSearchParams(search);
	const extracted: Partial<GA4Event> = {};

	for (const key of ACQUISITION_PARAM_KEYS) {
		const value = params.get(key)?.trim();

		if (value) {
			extracted[key] = value.slice(0, 100);
		}
	}

	return extracted;
};

/**
 * Declarative SEO and route metadata module for React 19.
 *
 * @remarks
 * Computes unified route metadata once per navigation, hoists `<title>`, `<meta>`,
 * and `<link>` tags into `<head>`, synchronizes JSON-LD structured data schemas in-place,
 * updates `document.documentElement.lang`, and dispatches the GA4 `page_view` event.
 *
 * @see {@link getPageMetadata}
 * @see {@link getSchemaDomId}
 * @see {@link MANAGED_SCHEMA_IDS}
 * @see {@link OG_LOCALE_MAP}
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
	const lastTrackedRouteKeyRef = useRef<null | string>(null);

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

		const routeKey = `${i18n.language}:${cleanPath}`;

		if (lastTrackedRouteKeyRef.current === routeKey) {
			return;
		}

		lastTrackedRouteKeyRef.current = routeKey;
		const acquisitionParams = extractAcquisitionParams(
			location.search || window.location.search,
		);

		// Dispatch manual page_view event with resolved document title
		sendEvent({
			action: "page_view",
			category: "engagement",
			page: location.pathname + location.search,
			page_location: window.location.href,
			page_referrer: prevUrlRef.current,
			page_title: pageTitle,
			...acquisitionParams,
		});

		prevUrlRef.current = window.location.href;
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
				content="image/webp"
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
