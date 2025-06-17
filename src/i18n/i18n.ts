import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import de from "./locales/de/translation.json";
import dev from "./locales/dev/translation.json";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";

const languages = ["en", "dev", "es", "fr", "de"];

const resources = {
	en: { translation: en },
	dev: { translation: dev },
	es: { translation: es },
	fr: { translation: fr },
	de: { translation: de },
};

// eslint-disable-next-line import/no-named-as-default-member
void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs: languages,
		preload: languages, // Not required in browser, safe to omit
		fallbackLng: "en",
		debug: process.env.NODE_ENV === "development",
		detection: {
			order: ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"],
			caches: ["localStorage", "cookie"],
		},
		resources,
		interpolation: {
			escapeValue: false,
		},
		ns: ["translation"],
		defaultNS: "translation",
	});

export default i18n;
