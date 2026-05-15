import { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";

import { getLocalizedSchema } from "../../shared/seo-schema.js";

describe("getLocalizedSchema", () => {
	const mockT = vi.fn((key: string) => {
		const translations: Record<string, string> = {
			appName: "NMS Optimizer",
			"faq.name": "Frequently Asked Questions",
			"faq.questions.adjacencyBonus.answer": "A stat boost.",
			"faq.questions.adjacencyBonus.name": "What is adjacency bonus?",
			"faq.questions.calculation.answer": "Simulated annealing.",
			"faq.questions.calculation.name": "How is it calculated?",
			"faq.questions.maximizeBonus.answer": "Group them together.",
			"faq.questions.maximizeBonus.name": "How to maximize?",
			"faq.questions.platforms.answer": "Starships, etc.",
			"faq.questions.platforms.name": "What platforms are supported?",
			"faq.questions.superchargedSlots.answer": "Boosted slots.",
			"faq.questions.superchargedSlots.name": "What are supercharged slots?",
			"seo.appDescription": "Calculate optimal technology layouts.",
		};

		return translations[key] || key;
	}) as unknown as TFunction;

	const lang = "en";
	const url = "https://nms-optimizer.app/";

	it("should generate SoftwareApplication schema", () => {
		const schemas = getLocalizedSchema(mockT, lang, url);
		const softwareApp = schemas.find((s) => s["@type"] === "SoftwareApplication");

		expect(softwareApp).toBeDefined();
		expect(softwareApp).toMatchObject({
			inLanguage: "en",
			name: "NMS Optimizer",
		});
	});

	it("should generate WebSite schema", () => {
		const schemas = getLocalizedSchema(mockT, lang, url);
		const website = schemas.find((s) => s["@type"] === "WebSite");

		expect(website).toBeDefined();
		expect(website).toMatchObject({
			url: url,
		});
	});

	it("should generate Organization schema", () => {
		const schemas = getLocalizedSchema(mockT, lang, url);
		const org = schemas.find((s) => s["@type"] === "Organization");

		expect(org).toBeDefined();
		expect(org).toMatchObject({
			name: "NMS Optimizer",
		});
	});

	it("should NOT generate BreadcrumbList schema on the homepage", () => {
		// A single-item breadcrumb (Home → Home) is invalid per Google's
		// structured-data guidance, so the schema must be omitted entirely on
		// the root URL.
		const schemas = getLocalizedSchema(mockT, lang, url);
		const breadcrumb = schemas.find((s) => s["@type"] === "BreadcrumbList");

		expect(breadcrumb).toBeUndefined();
	});

	it("should generate BreadcrumbList schema on a sub-page", () => {
		const subPageUrl = "https://nms-optimizer.app/about/";
		const schemas = getLocalizedSchema(mockT, lang, subPageUrl);
		const breadcrumb = schemas.find((s) => s["@type"] === "BreadcrumbList") as Record<
			string,
			unknown
		>;

		expect(breadcrumb).toBeDefined();
		const itemListElement = breadcrumb.itemListElement as unknown[];
		expect(itemListElement.length).toBe(2);
	});

	it("should handle localized URLs for breadcrumbs", () => {
		const localizedUrl = "https://nms-optimizer.app/fr/about/";
		const schemas = getLocalizedSchema(mockT, "fr", localizedUrl);
		const breadcrumb = schemas.find((s) => s["@type"] === "BreadcrumbList") as Record<
			string,
			unknown
		>;

		const itemListElement = breadcrumb.itemListElement as Record<string, unknown>[];
		expect(itemListElement.length).toBe(2);
		expect(itemListElement[1].name).toBe("seo.nav.about");
	});

	it("should handle non-localized secondary page URLs", () => {
		const secondaryUrl = "https://nms-optimizer.app/about/";
		const schemas = getLocalizedSchema(mockT, "en", secondaryUrl);
		const breadcrumb = schemas.find((s) => s["@type"] === "BreadcrumbList") as Record<
			string,
			unknown
		>;

		const itemListElement = breadcrumb.itemListElement as Record<string, unknown>[];
		expect(itemListElement.length).toBe(2);
		expect(itemListElement[1].name).toBe("seo.nav.about");
	});
});
