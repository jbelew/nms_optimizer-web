import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useSeoAndTitle } from "./useSeoAndTitle";

// Mock react-router-dom's useLocation
vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(),
}));

// Mock react-i18next's useTranslation
vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

describe("useSeoAndTitle", () => {
	const mockUseLocation = useLocation as Mock;
	const mockUseTranslation = useTranslation as Mock;

	const setupMocks = (pathname: string, translations: Record<string, string> = {}) => {
		mockUseLocation.mockReturnValue({ pathname });
		mockUseTranslation.mockReturnValue({
			t: vi.fn((key, options) => translations[key] || options?.defaultValue || key),
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
			setupMocks("/");
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
			setupMocks("/instructions");
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe("How to Use the NMS Optimizer | Instructions & Tips");
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain(
				"Get detailed instructions and pro tips"
			);
		});

		it("should set correct title and description for /about path", () => {
			setupMocks("/about");
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About the NMS Optimizer | AI-Powered Tech Layouts & Builds"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("Learn about the NMS Optimizer");
		});

		it("should set correct title and description for language-prefixed path", () => {
			setupMocks("/es/about");
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"About the NMS Optimizer | AI-Powered Tech Layouts & Builds"
			);
			const metaDesc = document.querySelector("meta[name='description']");
			expect(metaDesc?.getAttribute("content")).toContain("Learn about the NMS Optimizer");
		});

		it("should set title for /changelog path", () => {
			setupMocks("/changelog", { "dialogs.titles.changelog": "Changelog" });
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe("Changelog | NMS Optimizer");
		});

		it("should fall back to default title for unknown paths", () => {
			setupMocks("/unknown-path");
			renderHook(() => useSeoAndTitle());

			expect(document.title).toBe(
				"NMS Optimizer | No Man’s Sky Layout Builder for Ships & More"
			);
		});
	});
});
