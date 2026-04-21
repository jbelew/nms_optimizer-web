import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import path from "path";
import { fileURLToPath } from "url";
import { getLocalizedSchema } from "../shared/seo-schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

async function test() {
	await i18next.use(i18nextFsBackend).init({
		supportedLngs: ["en", "fr"],
		preload: ["en", "fr"],
		fallbackLng: "en",
		ns: ["translation"],
		defaultNS: "translation",
		backend: {
			loadPath: path.join(LOCALES_DIR, "{{lng}}/{{ns}}.json"),
		},
	});

	for (const lang of ["en", "fr"]) {
		const t = i18next.getFixedT(lang);
		const schemas = getLocalizedSchema(t, lang, "https://nms-optimizer.app/");
		const faqData = schemas.find((s) => s["@type"] === "FAQPage");
		
		console.log(`--- Language: ${lang} ---`);
		console.log("FAQ Name:", faqData.name);
		console.log("First Question:", faqData.mainEntity[0].name);
		console.log("First Answer (truncated):", faqData.mainEntity[0].acceptedAnswer.text.substring(0, 50));
	}
}

test();
