import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { getSupportedLanguages } from "../useSupportedLanguages";

/**
 * Custom hook that synchronizes the application language with the current URL path.
 *
 * @remarks
 * This hook monitors the browser's location and extracts the language code from
 * the first segment of the pathname. If the extracted code is supported by `i18next`,
 * it updates the application's active language.
 *
 * @returns {string} The current active language code (e.g., 'en', 'fr').
 *
 * @default "en"
 *
 * @see {@link ./useLanguage.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const currentLang = useLanguage();
 * // if URL is /fr/app, returns "fr" and sets i18n language to "fr"
 * ```
 */
export const useLanguage = () => {
	const { i18n } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const supportedLangs = getSupportedLanguages(i18n);
		const pathParts = location.pathname.split("/").filter((p) => p);

		let lang = "en";

		if (pathParts.length > 0 && supportedLangs.includes(pathParts[0])) {
			lang = pathParts[0];
		}

		const currentLang = i18n.language.split("-")[0];

		if (currentLang !== lang) {
			i18n.changeLanguage(lang);
		}
	}, [location.pathname, i18n]);

	return i18n.language;
};
