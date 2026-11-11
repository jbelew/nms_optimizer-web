import type { TFunction } from "i18next";
import i18next from "i18next";
import { describe, expect, it, vi } from "vitest";

import { createRealI18nInstance, loadLocaleBundle } from "@/test/i18n";

import { SUPPORTED_LANGUAGES } from "../../shared/config.js";
import { getLocalizedSchema } from "../../shared/seo-schema.js";

describe("seo-schema.js", () => {
	const mockT = vi.fn((key: string, options?: { defaultValue?: string }) => {
		const translations: Record<string, string> = {
			appName: "NMS Optimizer",
			"seo.aboutDescription": "Discover how NMS Optimizer uses advanced algorithms.",
			"seo.aboutPageTitle": "About the Optimization Algorithms",
			"seo.appDescription": "Optimize technology layouts.",
			"seo.genre": "Game Tool",
			"seo.nav.about": "About",
			"seo.nav.home": "Home",
		};

		return translations[key] || options?.defaultValue || key;
	}) as unknown as TFunction<"translation", undefined>;

	it("generates correct schema for English root", () => {
		const lang = "en";
		const url = "https://nms-optimizer.app/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication") as Record<
			string,
			unknown
		>;
		expect(softwareApp).toBeDefined();
		expect(softwareApp.url).toBe(url);
		expect(softwareApp["@id"]).toBe(`${url}#software`);
		expect(softwareApp.inLanguage).toBe(lang);
		expect(softwareApp.screenshot).toBe(
			"https://nms-optimizer.app/assets/img/screenshots/screenshot.webp",
		);
		expect(softwareApp.softwareVersion).toBe("test-version");
		expect(Array.isArray(softwareApp.featureList)).toBe(true);

		// Test explicit version override
		const customSchemas = getLocalizedSchema(mockT, lang, url, "v7.6.1");
		const customSoftwareApp = customSchemas.find(
			(s) => s["@type"] === "SoftwareApplication",
		) as Record<string, unknown>;
		expect(customSoftwareApp.softwareVersion).toBe("7.6.1");

		const webSite = schemas.find((s) => s["@type"] === "WebSite") as Record<string, unknown>;
		expect(webSite).toBeDefined();
		expect(webSite.url).toBe(url);
		expect(webSite["@id"]).toBe(`${url}#website`);
	});

	it("generates correct schema for Spanish root", () => {
		const lang = "es";
		const url = "https://nms-optimizer.app/es/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication") as Record<
			string,
			unknown
		>;
		expect(softwareApp).toBeDefined();
		expect(softwareApp.url).toBe(url);
		expect(softwareApp["@id"]).toBe(`${url}#software`);
		expect(softwareApp.inLanguage).toBe(lang);

		const webSite = schemas.find((s) => s["@type"] === "WebSite") as Record<string, unknown>;
		expect(webSite).toBeDefined();
		expect(webSite.url).toBe(url);
		expect(webSite["@id"]).toBe(`${url}#website`);
	});

	it("generates correct breadcrumbs for subpages", () => {
		const lang = "en";
		const url = "https://nms-optimizer.app/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const breadcrumbs = schemas.find((s) => s["@type"] === "BreadcrumbList") as Record<
			string,
			unknown
		>;
		expect(breadcrumbs).toBeDefined();

		const itemListElement = breadcrumbs.itemListElement as Array<Record<string, unknown>>;
		expect(itemListElement).toHaveLength(2);
		expect(itemListElement[0].item).toBe("https://nms-optimizer.app/");
		expect(itemListElement[1].name).toBe("About");
		expect(itemListElement[1].item).toBe(url);
	});

	it("generates correct breadcrumbs for localized subpages", () => {
		const lang = "es";
		const url = "https://nms-optimizer.app/es/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const breadcrumbs = schemas.find((s) => s["@type"] === "BreadcrumbList") as Record<
			string,
			unknown
		>;
		expect(breadcrumbs).toBeDefined();

		const itemListElement = breadcrumbs.itemListElement as Array<Record<string, unknown>>;
		expect(itemListElement).toHaveLength(2);
		expect(itemListElement[0].item).toBe("https://nms-optimizer.app/es/");
		expect(itemListElement[1].item).toBe(url);
	});

	it("does not include unverified aggregateRating and contains no double slash URLs", () => {
		const lang = "es";
		const url = "https://nms-optimizer.app/es/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication") as Record<
			string,
			unknown
		>;
		expect(softwareApp.aggregateRating).toBeUndefined();

		// Check every URL property in all schemas for unwanted double slashes
		const jsonString = JSON.stringify(schemas);
		const doubleSlashMatches = jsonString.match(/https:\/\/[^"]*\/\/[^"]*/g);
		expect(doubleSlashMatches).toBeNull();
	});

	it("generates WebPage schema for subpages linking to root WebSite with page-specific description", () => {
		const lang = "en";
		const url = "https://nms-optimizer.app/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const webPage = schemas.find((s) => s["@type"] === "WebPage") as Record<string, unknown>;
		expect(webPage).toBeDefined();
		expect(webPage.url).toBe(url);
		expect(webPage["@id"]).toBe(`${url}#webpage`);
		expect(webPage.name).toBe("About the Optimization Algorithms");
		expect(webPage.description).toBe("Discover how NMS Optimizer uses advanced algorithms.");
		expect(webPage.isPartOf).toEqual({ "@id": "https://nms-optimizer.app/#website" });
	});

	it("canonicalizes SiteNavigationElement URL for unlocalized changelog fallbacks while keeping localized routes prefixed", () => {
		for (const lang of ["es", "fr", "de", "pt", "it"]) {
			const schemas = getLocalizedSchema(mockT, lang, `https://nms-optimizer.app/${lang}/`);
			const navList = schemas.find((s) => s["@type"] === "ItemList") as Record<
				string,
				unknown
			>;
			const navItems = navList.itemListElement as Array<Record<string, unknown>>;
			const urls = navItems.map((item) => item.url);

			expect(urls).toEqual([
				`https://nms-optimizer.app/${lang}/instructions/`,
				`https://nms-optimizer.app/${lang}/about/`,
				"https://nms-optimizer.app/changelog/",
				`https://nms-optimizer.app/${lang}/userstats/`,
				`https://nms-optimizer.app/${lang}/privacy/`,
			]);
		}
	});

	it("emits localized SoftwareApplication featureList and keywords across all 6 locales and never emits FAQPage", async () => {
		const instance = await createRealI18nInstance("en");

		const enT = instance.getFixedT("en", "translation");
		const enSchemas = getLocalizedSchema(enT, "en", "https://nms-optimizer.app/");
		const enSoftwareApp = enSchemas.find((s) => s["@type"] === "SoftwareApplication");

		expect(enSoftwareApp).toBeDefined();
		const enFeatures = enSoftwareApp?.featureList;
		const enKeywords = enSoftwareApp?.keywords;

		expect(Array.isArray(enFeatures)).toBe(true);
		expect((enFeatures as string[]).length).toBeGreaterThanOrEqual(5);
		expect(typeof enKeywords).toBe("string");
		expect(String(enKeywords)).toContain("No Man's Sky");

		for (const lang of SUPPORTED_LANGUAGES) {
			const langT = instance.getFixedT(lang, "translation");
			const rootUrl =
				lang === "en" ? "https://nms-optimizer.app/" : `https://nms-optimizer.app/${lang}/`;
			const schemas = getLocalizedSchema(langT, lang, rootUrl);

			expect(schemas.some((s) => s["@type"] === "FAQPage")).toBe(false);
			expect(JSON.stringify(schemas)).not.toContain("FAQPage");

			const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication");
			expect(softwareApp).toBeDefined();

			const featureList = softwareApp?.featureList as string[];
			const keywords = softwareApp?.keywords as string;

			expect(Array.isArray(featureList)).toBe(true);
			expect(featureList.length).toBeGreaterThanOrEqual(5);
			featureList.forEach((item) => {
				expect(typeof item).toBe("string");
				expect(item.trim().length).toBeGreaterThan(0);
			});

			expect(typeof keywords).toBe("string");
			expect(keywords).toContain("No Man's Sky");

			if (lang !== "en") {
				expect(featureList).not.toEqual(enFeatures);
				expect(keywords).not.toBe(enKeywords);
			}

			const aboutUrl =
				lang === "en" ?
					"https://nms-optimizer.app/about/"
				:	`https://nms-optimizer.app/${lang}/about/`;
			const subpageSchemas = getLocalizedSchema(langT, lang, aboutUrl);
			expect(subpageSchemas.some((s) => s["@type"] === "FAQPage")).toBe(false);
		}
	});

	it("falls back safely to English featureList and keywords when translation keys are missing", async () => {
		const emptyInstance = i18next.createInstance();
		await emptyInstance.init({
			defaultNS: "translation",
			lng: "fr",
			resources: { fr: { translation: {} } },
		});

		const schemas = getLocalizedSchema(
			emptyInstance.getFixedT("fr", "translation"),
			"fr",
			"https://nms-optimizer.app/fr/",
		);
		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication");

		expect(softwareApp).toBeDefined();
		const featureList = softwareApp?.featureList as string[];
		const keywords = softwareApp?.keywords as string;

		expect(Array.isArray(featureList)).toBe(true);
		expect(featureList.length).toBeGreaterThanOrEqual(5);
		expect(featureList[0]).toContain("Simulated annealing");
		expect(keywords).toContain("No Man's Sky");
		expect(keywords).not.toBe("seo.keywords");
	});

	it("removes orphaned faq translation objects from all 6 locale bundles", () => {
		for (const lang of SUPPORTED_LANGUAGES) {
			const bundle = loadLocaleBundle(lang);
			expect(bundle).not.toHaveProperty("faq");
		}
	});
});
