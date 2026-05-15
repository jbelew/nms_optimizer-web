import { describe, expect, it, vi } from "vitest";
import { getLocalizedSchema } from "./seo-schema.js";

describe("seo-schema.js", () => {
	const mockT = vi.fn((key, options) => {
		const translations = {
			appName: "NMS Optimizer",
			"seo.appDescription": "Optimize technology layouts.",
			"seo.genre": "Game Tool",
			"seo.nav.about": "About",
			"seo.nav.home": "Home",
		};

		return translations[key] || options?.defaultValue || key;
	});

	it("generates correct schema for English root", () => {
		const lang = "en";
		const url = "https://nms-optimizer.app/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication");
		expect(softwareApp.url).toBe(url);
		expect(softwareApp["@id"]).toBe(`${url}#software`);
		expect(softwareApp.inLanguage).toBe(lang);

		const webSite = schemas.find((s) => s["@type"] === "WebSite");
		expect(webSite.url).toBe(url);
		expect(webSite["@id"]).toBe(`${url}#website`);
	});

	it("generates correct schema for Spanish root", () => {
		const lang = "es";
		const url = "https://nms-optimizer.app/es/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication");
		expect(softwareApp.url).toBe(url);
		expect(softwareApp["@id"]).toBe(`${url}#software`);
		expect(softwareApp.inLanguage).toBe(lang);

		const webSite = schemas.find((s) => s["@type"] === "WebSite");
		expect(webSite.url).toBe(url);
		expect(webSite["@id"]).toBe(`${url}#website`);
	});

	it("generates correct breadcrumbs for subpages", () => {
		const lang = "en";
		const url = "https://nms-optimizer.app/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const breadcrumbs = schemas.find((s) => s["@type"] === "BreadcrumbList");
		expect(breadcrumbs.itemListElement).toHaveLength(2);
		expect(breadcrumbs.itemListElement[1].name).toBe("About");
		expect(breadcrumbs.itemListElement[1].item).toBe(url);
	});

	it("generates correct breadcrumbs for localized subpages", () => {
		const lang = "es";
		const url = "https://nms-optimizer.app/es/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const breadcrumbs = schemas.find((s) => s["@type"] === "BreadcrumbList");
		expect(breadcrumbs.itemListElement).toHaveLength(2);
		expect(breadcrumbs.itemListElement[1].item).toBe(url);
	});
});
