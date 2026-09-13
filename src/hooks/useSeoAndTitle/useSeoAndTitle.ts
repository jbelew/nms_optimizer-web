import { useEffect, useRef } from "react";
import { getPageMetadata } from "@shared/page-metadata.js";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { useSupportedLanguages } from "@/hooks/useSupportedLanguages";
import { sendEvent } from "@/utils/analytics/tracking";

/**
 * Custom hook for managing SEO side-effects like analytics and document language.
 *
 * @remarks
 * While metadata (title, meta tags) is handled declaratively by the `Seo` component,
 * this hook manages imperative side-effects like updating `document.documentElement.lang`
 * and triggering manual page view events for Google Analytics using the unified Page Metadata Module.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link getPageMetadata}
 * @see {@link sendEvent}
 *
 * @example
 * ```tsx
 * useSeoAndTitle();
 * ```
 */
export const useSeoAndTitle = () => {
	const { i18n, t } = useTranslation();
	const location = useLocation();
	const supportedLangs = useSupportedLanguages();
	const prevUrlRef = useRef<string>(document.referrer);

	useEffect(() => {
		const metadata = getPageMetadata({
			lang: i18n.language,
			pathname: location.pathname,
			supportedLanguages: supportedLangs,
			t,
		});

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
			page_title: metadata.title,
		});

		// Update prevUrlRef for the next navigation
		prevUrlRef.current = window.location.href;
	}, [location.pathname, location.search, t, i18n, supportedLangs]);
};
