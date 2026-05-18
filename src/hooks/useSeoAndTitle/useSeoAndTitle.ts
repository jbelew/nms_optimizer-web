import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { sendEvent } from "@/utils/analytics/tracking";

import { seoMetadata } from "../../../shared/seo-metadata.js";

/**
 * Custom hook for managing SEO side-effects like analytics and document language.
 *
 * @remarks
 * While metadata (title, meta tags) is handled declaratively by the `Seo` component,
 * this hook manages imperative side-effects like updating `document.documentElement.lang`
 * and triggering manual page view events for Google Analytics.
 *
 * @returns {void} Side-effects only.
 */
export const useSeoAndTitle = () => {
	const { i18n, t } = useTranslation();
	const location = useLocation();
	const prevUrlRef = useRef<string>(document.referrer);

	useEffect(() => {
		// Handle language-prefixed routes to determine the base path
		const pathParts = location.pathname.split("/").filter(Boolean);
		const supportedLangs = Object.keys(i18n.services.resourceStore.data || {});
		const basePath = supportedLangs.includes(pathParts[0])
			? `/${pathParts.slice(1).join("/")}${pathParts.length > 1 ? "/" : ""}`
			: location.pathname;

		// Normalize: ensure trailing slash for lookup (except root)
		const currentPath =
			basePath === "/" || basePath === ""
				? "/"
				: basePath.endsWith("/")
					? basePath
					: `${basePath}/`;

		// Look up metadata for the current path, falling back to root metadata
		const metadata = seoMetadata[currentPath as keyof typeof seoMetadata] || seoMetadata["/"];
		const pageTitle = t(metadata.titleKey, { defaultValue: "NMS Optimizer" });

		document.documentElement.lang = i18n.language;

		// --- Analytics Page View ---
		// We send this manually here because automatic page views are disabled in tracking.ts
		// to allow us to control the timing and include the correct document title.
		sendEvent({
			action: "page_view",
			category: "engagement",
			page: location.pathname + location.search,
			page_location: window.location.href,
			page_referrer: prevUrlRef.current,
			page_title: pageTitle,
		});

		// Update prevUrlRef for the next navigation
		prevUrlRef.current = window.location.href;
	}, [location.pathname, location.search, t, i18n]);
};
