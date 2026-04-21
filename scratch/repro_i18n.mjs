import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

async function test() {
	await i18next.use(i18nextFsBackend).init({
		supportedLngs: ["en"],
		preload: ["en"],
		fallbackLng: "en",
		ns: ["translation"],
		defaultNS: "translation",
		backend: {
			loadPath: path.join(LOCALES_DIR, "{{lng}}/{{ns}}.json"),
		},
	});

	const t = i18next.getFixedT("en");
	console.log("appName:", t("appName"));
	console.log("faq.name:", t("faq.name"));
	console.log("faq.questions.adjacencyBonus.name:", t("faq.questions.adjacencyBonus.name"));
}

test();
