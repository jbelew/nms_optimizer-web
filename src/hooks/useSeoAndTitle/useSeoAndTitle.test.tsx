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
				"seo.mainPageTitle": "NMS Optimizer | No Man’s Sky Layout Builder for Ships & More",
				"seo.appDescription":
					"Find the best No Man's Sky technology layouts for your Starship, Corvette, Multitool, Exosuit, and Exocraft. Optimize adjacency bonuses and supercharged slots to create the ultimate NMS builds.",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"NMS Optimizer | No Man’s Sky Layout Builder for Ships & More"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain(
				"Find the best No Man's Sky technology layouts"
			);
		});

		it("should set correct title and description for /instructions path", () => {
			setupMocks("/instructions", {
				"seo.instructionsPageTitle": "How to Use the NMS Optimizer | Instructions & Tips",
				"seo.instructionsDescription":
					"Get detailed instructions and pro tips on how to use the NMS Optimizer. Learn to master supercharged slots, adjacency bonuses, and create the best technology layouts in No Man's Sky.",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe("How to Use the NMS Optimizer | Instructions & Tips");
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain(
				"Get detailed instructions and pro tips"
			);
		});

		it("should set correct title and description for /about path", () => {
			setupMocks("/about", {
				"seo.aboutPageTitle": "About the NMS Optimizer | AI-Powered Tech Layouts & Builds",
				"seo.aboutDescription":
					"Learn about the NMS Optimizer, an AI-powered tool for No Man's Sky. Discover how it uses machine learning to create optimal Starship, Corvette, Multitool, Exosuit, and Exocraft builds.",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About the NMS Optimizer | AI-Powered Tech Layouts & Builds"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("Learn about the NMS Optimizer");
		});

		it("should set correct title and description for language-prefixed path", () => {
			setupMocks("/es/about", {
				"seo.aboutPageTitle": "About the NMS Optimizer | AI-Powered Tech Layouts & Builds",
				"seo.aboutDescription":
					"Learn about the NMS Optimizer, an AI-powered tool for No Man's Sky. Discover how it uses machine learning to create optimal Starship, Corvette, Multitool, Exosuit, and Exocraft builds.",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About the NMS Optimizer | AI-Powered Tech Layouts & Builds"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("Learn about the NMS Optimizer");
		});

		it("should set title for /changelog path", () => {
			setupMocks("/changelog", { "seo.changelogPageTitle": "Changelog | NMS Optimizer" });
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe("Changelog | NMS Optimizer");
		});

		it("should fall back to default title for unknown paths", () => {
			setupMocks("/unknown-path", {
				"seo.mainPageTitle": "NMS Optimizer | No Man’s Sky Layout Builder for Ships & More",
			});
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"NMS Optimizer | No Man’s Sky Layout Builder for Ships & More"
			);
		});
	});
});
