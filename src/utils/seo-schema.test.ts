import type { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";

import { getLocalizedSchema } from "../../shared/seo-schema.js";

describe("seo-schema.js", () => {
	const mockT = vi.fn((key: string, options?: { defaultValue?: string }) => {
		const translations: Record<string, string> = {
			appName: "NMS Optimizer",
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

	it("generates WebPage schema for subpages linking to root WebSite", () => {
		const lang = "en";
		const url = "https://nms-optimizer.app/about/";
		const schemas = getLocalizedSchema(mockT, lang, url);

		const webPage = schemas.find((s) => s["@type"] === "WebPage") as Record<string, unknown>;
		expect(webPage).toBeDefined();
		expect(webPage.url).toBe(url);
		expect(webPage["@id"]).toBe(`${url}#webpage`);
		expect(webPage.isPartOf).toEqual({ "@id": "https://nms-optimizer.app/#website" });
	});
});
