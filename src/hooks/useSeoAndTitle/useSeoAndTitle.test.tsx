import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useSeoAndTitle } from "./useSeoAndTitle";

// Mock dependencies
vi.mock("react-router-dom", () => ({ useLocation: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: vi.fn() }));
vi.mock("../../../shared/seo-metadata.js", () => ({
	seoMetadata: {
		"/": {
			titleKey: "seo.mainPageTitle",
			descriptionKey: "seo.appDescription",
		},
		"/instructions": {
			titleKey: "seo.instructionsPageTitle",
			descriptionKey: "seo.instructionsDescription",
		},
		"/about": {
			titleKey: "seo.aboutPageTitle",
			descriptionKey: "seo.aboutDescription",
		},
		"/changelog": {
			titleKey: "seo.changelogPageTitle",
			descriptionKey: "seo.changelogDescription",
		},
	},
}));

describe("useSeoAndTitle", () => {
	const mockUseLocation = useLocation as Mock;
	const mockUseTranslation = useTranslation as Mock;

	const setupMocks = (pathname: string, translations: Record<string, string> = {}) => {
		mockUseLocation.mockReturnValue({ pathname });
		mockUseTranslation.mockReturnValue({
			t: vi.fn((key) => translations[key] || key),
			i18n: {
				language: "en",
				services: {
					resourceStore: {
						data: { en: {}, es: {}, fr: {}, de: {}, pt: {} },
					},
				},
			},
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
				"seo.mainPageTitle":
					"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky",
				"seo.appDescription":
					"The best No Man's Sky layout calculator and optimizer. Find optimal technology placements with maximum adjacency bonuses for Starship, Corvette, Multitool, Exocraft, and Exosuit builds. Free tool with supercharged slot optimization.",
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
		});

		it("should set correct title and description for /instructions path", () => {
			setupMocks("/instructions", {
				"seo.instructionsPageTitle":
					"How to Use NMS Optimizer | Complete App Usage Guide for No Man's Sky",
				"seo.instructionsDescription":
					"Complete instructions for using the NMS Optimizer app. Learn how to select platforms, mark supercharged slots, optimize layouts, and maximize adjacency bonuses for Starships, Corvettes, Multitools, and more.",
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

		it("should set correct title and description for /about path", () => {
			setupMocks("/about", {
				"seo.aboutPageTitle":
					"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator",
				"seo.aboutDescription":
					"NMS Optimizer is a free tool that finds the best technology layouts for No Man's Sky. Uses advanced optimization algorithms to maximize adjacency bonuses for your Starship, Corvette, Multitool, Exocraft, and Exosuit.",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("NMS Optimizer is a free tool");
		});

		it("should set correct title and description for language-prefixed path", () => {
			setupMocks("/es/about", {
				"seo.aboutPageTitle":
					"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator",
				"seo.aboutDescription":
					"NMS Optimizer is a free tool that finds the best technology layouts for No Man's Sky. Uses advanced optimization algorithms to maximize adjacency bonuses for your Starship, Corvette, Multitool, Exocraft, and Exosuit.",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About NMS Optimizer | Free No Man's Sky Tech Layout Calculator"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("NMS Optimizer is a free tool");
		});

		it("should set title for /changelog path", () => {
			setupMocks("/changelog", {
				"seo.changelogPageTitle": "NMS Optimizer Changelog | Latest Updates & Features",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe("NMS Optimizer Changelog | Latest Updates & Features");
		});

		it("should fall back to default title for unknown paths", () => {
			setupMocks("/unknown-path", {
				"seo.mainPageTitle":
					"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"NMS Optimizer | Tech Layout Builder & Adjacency Calculator for No Man's Sky"
			);
		});
	});
});
