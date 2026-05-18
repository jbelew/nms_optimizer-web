import type { i18n } from "i18next";
import { useTranslation } from "react-i18next";

/**
 * Returns the list of language codes supported by the application.
 *
 * This derives the list dynamically from the i18next resource store,
 * ensuring that the UI and router are always in sync with available translations.
 *
 * @param {i18n} i18nInstance - The i18next instance.
 *
 * @returns {string[]} An array of supported language codes (e.g., ['en', 'es', 'fr']).
 */
export const getSupportedLanguages = (i18nInstance: i18n): string[] => {
	return Object.keys(i18nInstance.services.resourceStore.data || {});
};

/**
 * Hook to access the list of supported language codes.
 *
 * @returns {string[]} An array of supported language codes.
 *
 * @category Hooks
 */
export const useSupportedLanguages = (): string[] => {
	const { i18n } = useTranslation();

	return getSupportedLanguages(i18n);
};
