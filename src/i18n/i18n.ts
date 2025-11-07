import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const languages = ["en", "es", "fr", "de", "pt"];

export const nativeLanguageNames: { [key: string]: string } = {
	en: "English",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	pt: "Português",
};

void i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs: languages,
		fallbackLng: "en",
		debug: process.env.NODE_ENV === "development",
		detection: {
			order: [
				"path",
				"querystring",
				"cookie",
				"localStorage",
				"sessionStorage",
				"navigator",
				"htmlTag",
			],
			caches: ["localStorage", "cookie"],
			lookupFromPathIndex: 1,
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

export default i18n;
