import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

/** Array of ISO language codes supported by the application. */
export const languages = ["en", "es", "fr", "de", "pt", "it"];

/**
 * Mapping of language codes to their native language names.
 *
 * Used for displaying user-friendly language selection options in the UI.
 */
export const nativeLanguageNames: { [key: string]: string } = {
	de: "Deutsch",
	en: "English",
	es: "Español",
	fr: "Français",
	it: "Italiano",
	pt: "Português",
};

/**
 * Bootstraps the `i18next` library with essential plugins and configuration.
 *
 * It configures:
 * 1. `Backend`: Loads JSON translation files from the `/assets/locales/` directory.
 * 2. `LanguageDetector`: Extracts the active language from the URL path.
 * 3. `initReactI18next`: Bridges i18next with the React component lifecycle.
 *
 * **Defaults to English if the detected language is unsupported.**
 */
void i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		backend: {
			loadPath: "/assets/locales/{{lng}}/{{ns}}.json",
		},
		debug: process.env.NODE_ENV === "development",
		defaultNS: "translation",
		detection: {
			caches: ["localStorage", "cookie"],
			lookupFromPathIndex: 0,
			order: ["path"],
		},
		fallbackLng: "en",
		interpolation: {
			escapeValue: false,
		},
		ns: ["translation"],
		supportedLngs: languages,
	});

/** The pre-configured i18next instance used globally for localization. */
export default i18n;
