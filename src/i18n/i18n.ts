import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const languages = ["en", "es", "fr", "de"];

void i18n
	.use(Backend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs: languages,
		preload: languages,
		fallbackLng: "en",
		debug: process.env.NODE_ENV === "development",
		detection: {
			order: [
				"querystring",
				"cookie",
				"localStorage",
				"sessionStorage",
				"navigator",
				"htmlTag",
			],
			caches: ["localStorage", "cookie"],
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
