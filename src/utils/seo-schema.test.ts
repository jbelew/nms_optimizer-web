import { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";

import { getLocalizedSchema } from "../../shared/seo-schema.js";

describe("getLocalizedSchema", () => {
	const mockT = vi.fn((key: string) => {
		const translations: Record<string, string> = {
			appName: "NMS Optimizer",
			"seo.appDescription": "Calculate optimal technology layouts.",
			"faq.name": "Frequently Asked Questions",
			"faq.questions.adjacencyBonus.name": "What is adjacency bonus?",
			"faq.questions.adjacencyBonus.answer": "A stat boost.",
			"faq.questions.superchargedSlots.name": "What are supercharged slots?",
			"faq.questions.superchargedSlots.answer": "Boosted slots.",
			"faq.questions.maximizeBonus.name": "How to maximize?",
			"faq.questions.maximizeBonus.answer": "Group them together.",
			"faq.questions.calculation.name": "How is it calculated?",
			"faq.questions.calculation.answer": "Simulated annealing.",
			"faq.questions.platforms.name": "What platforms are supported?",
			"faq.questions.platforms.answer": "Starships, etc.",
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
			name: "NMS Optimizer",
			inLanguage: "en",
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

	it("should generate BreadcrumbList schema", () => {
		const schemas = getLocalizedSchema(mockT, lang, url);
		const breadcrumb = schemas.find((s) => s["@type"] === "BreadcrumbList") as Record<
			string,
			unknown
		>;

		expect(breadcrumb).toBeDefined();
		const itemListElement = breadcrumb.itemListElement as unknown[];
		expect(itemListElement.length).toBeGreaterThan(0);
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
