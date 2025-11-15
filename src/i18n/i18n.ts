import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

/** Array of supported language codes. */
export const languages = ["en", "es", "fr", "de", "pt"];

/**
 * Mapping of language codes to their native language names.
 * Used for displaying language options to users.
 */
export const nativeLanguageNames: { [key: string]: string } = {
	en: "English",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	pt: "Português",
};

/**
 * Initialize i18next with language detection, HTTP backend, and React integration.
 * Configuration:
 * - Supports the languages defined in the languages array
 * - Detects language from URL path
 * - Falls back to English if language not found
 * - Loads translations from /assets/locales/{language}/{namespace}.json
 */
void i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs: languages,
		fallbackLng: "en",
		debug: process.env.NODE_ENV === "development",
		detection: {
			order: ["path"],
			caches: ["localStorage", "cookie"],
			lookupFromPathIndex: 0,
		},
		backend: {
			loadPath: "/assets/locales/{{lng}}/{{ns}}.json",
		},
		interpolation: {
			escapeValue: false,
		},
		ns: ["translation"],
		defaultNS: "translation",
	});

/** Configured i18next instance for internationalization. */
export default i18n;
