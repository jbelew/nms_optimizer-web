import type { Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendEvent } from "@/utils/analytics/tracking";

import { useSeoAndTitle } from "./useSeoAndTitle";

// Mock dependencies
vi.mock("react-router-dom", () => ({ useLocation: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: vi.fn() }));
vi.mock("@/utils/analytics/tracking", () => ({
	sendEvent: vi.fn(),
}));
vi.mock("../../../shared/seo-metadata.js", () => ({
	seoMetadata: {
		"/": {
			descriptionKey: "seo.appDescription",
			titleKey: "seo.mainPageTitle",
		},
		"/about/": {
			descriptionKey: "seo.aboutDescription",
			titleKey: "seo.aboutPageTitle",
		},
		"/changelog/": {
			descriptionKey: "seo.changelogDescription",
			titleKey: "seo.changelogPageTitle",
		},
		"/instructions/": {
			descriptionKey: "seo.instructionsDescription",
			titleKey: "seo.instructionsPageTitle",
		},
	},
}));

describe("useSeoAndTitle", () => {
	const mockUseLocation = useLocation as Mock;
	const mockUseTranslation = useTranslation as Mock;

	const setupMocks = (pathname: string, translations: Record<string, string> = {}) => {
		mockUseLocation.mockReturnValue({ pathname });
		mockUseTranslation.mockReturnValue({
			i18n: {
				language: "en",
				services: {
					resourceStore: {
						data: { de: {}, en: {}, es: {}, fr: {}, pt: {} },
					},
				},
			},
			t: vi.fn((key) => translations[key] || key),
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
		document.head.innerHTML = "";
		document.title = "";
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Document Title and Meta Description", () => {
		it("should set default title and description for root path", () => {
			setupMocks("/", {
				"seo.appDescription":
					"The best No Man's Sky layout calculator and optimizer. Find optimal technology placements with maximum adjacency bonuses for Starship, Corvette, Multitool, Exocraft, and Exosuit builds. Free tool with supercharged slot optimization.",
				"seo.mainPageTitle":
					"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain(
				"The best No Man's Sky layout calculator"
			);

			// Check social tags
			expect(
				document.querySelector("meta[property='og:title']")?.getAttribute("content")
			).toBe("NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky");
			expect(
				document.querySelector("meta[name='twitter:title']")?.getAttribute("content")
			).toBe("NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky");

			// Check keywords and images
			expect(document.querySelector("meta[name='keywords']")?.getAttribute("content")).toBe(
				"seo.keywords"
			);
			expect(
				document.querySelector("meta[property='og:image']")?.getAttribute("content")
			).toBe("https://nms-optimizer.app/assets/img/screenshots/screenshot.png");
			expect(
				document.querySelector("meta[property='og:image:alt']")?.getAttribute("content")
			).toBe("seo.ogImageAlt");

			// Check analytics call
			expect(sendEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "page_view",
					page_location: expect.any(String),
					page_referrer: expect.any(String),
					page_title:
						"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky",
				})
			);
		});

		it("should set correct title and description for /instructions/ path", () => {
			setupMocks("/instructions/", {
				"seo.instructionsDescription":
					"Complete instructions for using the NMS Optimizer app. Learn how to select platforms, mark supercharged slots, optimize layouts, and maximize adjacency bonuses for Starships, Corvettes, Multitools, and more.",
				"seo.instructionsPageTitle":
					"How to Use NMS Optimizer | Complete App Usage Guide for No Man's Sky",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"How to Use NMS Optimizer | Complete App Usage Guide for No Man's Sky"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain(
				"Complete instructions for using the NMS Optimizer app"
			);
		});

		it("should set correct title and description for /about/ path", () => {
			setupMocks("/about/", {
				"seo.aboutDescription":
					"NMS Optimizer is a free tool that finds the best technology layouts for No Man's Sky. Uses advanced optimization algorithms to maximize adjacency bonuses for your Starship, Corvette, Multitool, Exocraft, and Exosuit.",
				"seo.aboutPageTitle":
					"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("NMS Optimizer is a free tool");
		});

		it("should set correct title and description for language-prefixed path", () => {
			setupMocks("/es/about/", {
				"seo.aboutDescription":
					"NMS Optimizer is a free tool that finds the best technology layouts for No Man's Sky. Uses advanced optimization algorithms to maximize adjacency bonuses for your Starship, Corvette, Multitool, Exocraft, and Exosuit.",
				"seo.aboutPageTitle":
					"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("NMS Optimizer is a free tool");
		});

		it("should set title for /changelog/ path", () => {
			setupMocks("/changelog/", {
				"seo.changelogPageTitle": "NMS Optimizer Changelog | Latest Updates & Features",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe("NMS Optimizer Changelog | Latest Updates & Features");
		});

		it("should fall back to default title for unknown paths", () => {
			setupMocks("/unknown-path/", {
				"seo.mainPageTitle":
					"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky"
			);
		});
	});

	describe("Structured Data (JSON-LD)", () => {
		it("should inject all required schemas on root path", () => {
			setupMocks("/", {});
			renderHook(() => useSeoAndTitle());

			expect(document.getElementById("software-schema")).not.toBeNull();
			expect(document.getElementById("website-schema")).not.toBeNull();
			expect(document.getElementById("org-schema")).not.toBeNull();
			// BreadcrumbList must contain at least 2 items per Google's structured-data
			// guidance, so it is intentionally omitted on the homepage.
			expect(document.getElementById("breadcrumb-schema")).toBeNull();
			expect(document.getElementById("faq-schema")).toBeNull();
		});

		it("should inject BreadcrumbList on a sub-page", () => {
			setupMocks("/about/", {});
			renderHook(() => useSeoAndTitle());

			const breadcrumbEl = document.getElementById("breadcrumb-schema");
			expect(breadcrumbEl).not.toBeNull();
			const data = JSON.parse(breadcrumbEl!.textContent || "{}");
			expect(data["@type"]).toBe("BreadcrumbList");
			expect(data.itemListElement).toHaveLength(2);
		});

		it("should set og:locale and og:locale:alternate tags", () => {
			setupMocks("/", {});
			renderHook(() => useSeoAndTitle());

			const ogLocale = document.querySelector('meta[property="og:locale"]');
			expect(ogLocale?.getAttribute("content")).toBe("en_US");

			const alternates = document.querySelectorAll('meta[property="og:locale:alternate"]');
			// 5 alternates (all supported langs minus current `en`)
			expect(alternates).toHaveLength(5);
		});
	});
});
