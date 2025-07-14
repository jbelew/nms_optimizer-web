import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";

const languages = ["en", "es", "fr", "de"];

const resources = {
	en: { translation: en },
	es: { translation: es },
	fr: { translation: fr },
	de: { translation: de },
};

void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs: languages,
		preload: languages,
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
