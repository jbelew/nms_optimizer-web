import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/**
 * Custom hook that synchronizes the application language with the current URL path.
 * Detects the language from the URL pathname and updates i18n accordingly.
 * Defaults to 'en' if no supported language is found in the URL.
 *
 * @returns {string} The current language code (e.g., 'en', 'fr', 'es').
 *
 * @example
 * const language = useLanguage();
 * console.log(`Current language: ${language}`);
 */
export const useLanguage = () => {
	const { i18n } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const supportedLangs = Object.keys(i18n.services.resourceStore.data || {});
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
