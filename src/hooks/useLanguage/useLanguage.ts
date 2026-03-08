import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/**
 * Custom hook that synchronizes the application language with the current URL path.
 *
 * This hook monitors the browser's location and extracts the language code from
 * the first segment of the pathname. If the extracted code is supported by `i18next`,
 * it updates the application's active language.
 * **Defaults to 'en' if no supported language is detected.**
 *
 * @returns {string} The current active language code (e.g., 'en', 'fr').
 *
 * @example
 * const currentLang = useLanguage();
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
