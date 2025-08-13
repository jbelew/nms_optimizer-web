import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useSeoAndTitle } from "./useSeoAndTitle";

// Mock react-router-dom's useLocation
vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(),
}));

// Mock react-i18next's useTranslation
vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
	initReactI18next: {
		// Mock initReactI18next
		type: "3rdParty",
		init: vi.fn(),
	},
}));

// Helper function to sort URL search parameters for consistent comparison
const sortSearchParams = (url: string) => {
	const [baseUrl, search] = url.split("?");
	if (!search) return url;
	const params = new URLSearchParams(search);
	params.sort();
	return `${baseUrl}?${params.toString()}`;
};

describe("useSeoAndTitle", () => {
	const mockUseLocation = useLocation as vi.Mock;
	const mockUseTranslation = useTranslation as vi.Mock;

	let originalAppendChild: (node: Node) => Node;
	let originalQuerySelector: (selectors: string) => Element | null;
	let originalQuerySelectorAll: (selectors: string) => NodeListOf<Element>;
	let originalCreateElement: (tagName: string) => HTMLElement;
	let originalRemove: () => void;
	let originalURLSearchParams: typeof URLSearchParams;

	beforeEach(() => {
		vi.clearAllMocks();

		// Store original DOM methods
		originalAppendChild = document.head.appendChild;
		originalQuerySelector = document.querySelector;
		originalQuerySelectorAll = document.querySelectorAll;
		originalCreateElement = document.createElement;
		originalRemove = HTMLLinkElement.prototype.remove;
		originalURLSearchParams = global.URLSearchParams;

		// Reset document.head content before each test
		document.head.innerHTML = "";

		// Mock window properties
		Object.defineProperty(window, "location", {
			value: { origin: "http://localhost:3000", pathname: "/", search: "" },
			writable: true,
		});
		Object.defineProperty(document, "title", { value: "", writable: true });

		// Mock URLSearchParams constructor
		Object.defineProperty(global, "URLSearchParams", {
			value: vi.fn((init) => new originalURLSearchParams(init)),
			writable: true,
		});

		// Default mocks for useLocation and useTranslation
		mockUseLocation.mockReturnValue({ pathname: "/", search: "" });
		mockUseTranslation.mockReturnValue({
			t: vi.fn((key) => key), // Simple mock: returns the key itself
			i18n: {
				language: "en-US",
				options: {
					supportedLngs: ["en", "es", "fr", "de"], // Match actual i18n config
					fallbackLng: ["en"],
				},
			},
		});
	});

	afterEach(() => {
		// Restore original DOM methods
		document.head.appendChild = originalAppendChild;
		document.querySelector = originalQuerySelector;
		document.querySelectorAll = originalQuerySelectorAll;
		document.createElement = originalCreateElement;
		HTMLLinkElement.prototype.remove = originalRemove;
		global.URLSearchParams = originalURLSearchParams;
		vi.restoreAllMocks();
	});

	describe("Document Title", () => {
		it("should set document title for default path", () => {
			mockUseLocation.mockReturnValue({ pathname: "/", search: "" });
			mockUseTranslation.mockReturnValue({
				t: vi.fn((key) => (key === "appName" ? "My App" : key)),
				i18n: {
					language: "en-US",
					options: { supportedLngs: ["en"], fallbackLng: ["en"] },
				},
			});
			renderHook(() => useSeoAndTitle());
			expect(document.title).toBe("My App");
		});

		it("should set document title for instructions path", () => {
			mockUseLocation.mockReturnValue({ pathname: "/instructions", search: "" });
			mockUseTranslation.mockReturnValue({
				t: vi.fn((key) => {
					if (key === "appName") return "My App";
					if (key === "dialogs.titles.instructions") return "Instructions";
					return key;
				}),
				i18n: {
					language: "en-US",
					options: { supportedLngs: ["en"], fallbackLng: ["en"] },
				},
			});
			renderHook(() => useSeoAndTitle());
			expect(document.title).toBe("Instructions - My App");
		});

		it("should set document title for about path", () => {
			mockUseLocation.mockReturnValue({ pathname: "/about", search: "" });
			mockUseTranslation.mockReturnValue({
				t: vi.fn((key) => {
					if (key === "appName") return "My App";
					if (key === "dialogs.titles.about") return "About";
					return key;
				}),
				i18n: {
					language: "en-US",
					options: { supportedLngs: ["en"], fallbackLng: ["en"] },
				},
			});
			renderHook(() => useSeoAndTitle());
			expect(document.title).toBe("About - My App");
		});

		it("should set document title for changelog path", () => {
			mockUseLocation.mockReturnValue({ pathname: "/changelog", search: "" });
			mockUseTranslation.mockReturnValue({
				t: vi.fn((key) => {
					if (key === "appName") return "My App";
					if (key === "dialogs.titles.changelog") return "Changelog";
					return key;
				}),
				i18n: {
					language: "en-US",
					options: { supportedLngs: ["en"], fallbackLng: ["en"] },
				},
			});
			renderHook(() => useSeoAndTitle());
			expect(document.title).toBe("Changelog - My App");
		});

		it("should set document title for translation path", () => {
			mockUseLocation.mockReturnValue({ pathname: "/translation", search: "" });
			mockUseTranslation.mockReturnValue({
				t: vi.fn((key) => {
					if (key === "appName") return "My App";
					if (key === "dialogs.titles.translationRequest") return "Translation Request";
					return key;
				}),
				i18n: {
					language: "en-US",
					options: { supportedLngs: ["en"], fallbackLng: ["en"] },
				},
			});
			renderHook(() => useSeoAndTitle());
			expect(document.title).toBe("Translation Request - My App");
		});

		it("should set document title to appName for unknown path", () => {
			mockUseLocation.mockReturnValue({ pathname: "/unknown", search: "" });
			mockUseTranslation.mockReturnValue({
				t: vi.fn((key) => (key === "appName" ? "My App" : key)),
				i18n: {
					language: "en-US",
					options: { supportedLngs: ["en"], fallbackLng: ["en"] },
				},
			});
			renderHook(() => useSeoAndTitle());
			expect(document.title).toBe("My App");
		});
	});

	describe("Hreflang Tags", () => {
		it("should create hreflang links for supported languages", () => {
			mockUseLocation.mockReturnValue({ pathname: "/instructions", search: "" });
			renderHook(() => useSeoAndTitle());

			const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
			expect(hreflangLinks.length).toBe(5); // en, es, fr, de, x-default

			const enLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "en"
			);
			expect(sortSearchParams(enLink?.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/instructions?lng=en")
			);

			const frLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "fr"
			);
			expect(sortSearchParams(frLink?.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/instructions?lng=fr")
			);

			const esLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "es"
			);
			expect(sortSearchParams(esLink?.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/instructions?lng=es")
			);

			const deLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "de"
			);
			expect(sortSearchParams(deLink?.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/instructions?lng=de")
			);

			const xDefaultLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "x-default"
			);
			expect(sortSearchParams(xDefaultLink?.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/instructions?lng=en")
			);
		});

		it("should update existing hreflang links", () => {
			// Manually create existing hreflang links
			const existingEnLink = document.createElement("link");
			existingEnLink.setAttribute("rel", "alternate");
			existingEnLink.setAttribute("hreflang", "en");
			existingEnLink.setAttribute("href", "http://old.com/en");
			document.head.appendChild(existingEnLink);

			const existingFrLink = document.createElement("link");
			existingFrLink.setAttribute("rel", "alternate");
			existingFrLink.setAttribute("hreflang", "fr");
			existingFrLink.setAttribute("href", "http://old.com/fr");
			document.head.appendChild(existingFrLink);

			const existingEsLink = document.createElement("link");
			existingEsLink.setAttribute("rel", "alternate");
			existingEsLink.setAttribute("hreflang", "es");
			existingEsLink.setAttribute("href", "http://old.com/es");
			document.head.appendChild(existingEsLink);

			const existingDeLink = document.createElement("link");
			existingDeLink.setAttribute("rel", "alternate");
			existingDeLink.setAttribute("hreflang", "de");
			existingDeLink.setAttribute("href", "http://old.com/de");
			document.head.appendChild(existingDeLink);

			const existingXDefaultLink = document.createElement("link");
			existingXDefaultLink.setAttribute("rel", "alternate");
			existingXDefaultLink.setAttribute("hreflang", "x-default");
			existingXDefaultLink.setAttribute("href", "http://old.com/x-default");
			document.head.appendChild(existingXDefaultLink);

			mockUseLocation.mockReturnValue({ pathname: "/about", search: "" });
			renderHook(() => useSeoAndTitle());

			expect(sortSearchParams(existingEnLink.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/about?lng=en")
			);
			expect(sortSearchParams(existingFrLink.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/about?lng=fr")
			);
			expect(sortSearchParams(existingEsLink.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/about?lng=es")
			);
			expect(sortSearchParams(existingDeLink.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/about?lng=de")
			);
			expect(sortSearchParams(existingXDefaultLink.getAttribute("href") || "")).toBe(
				sortSearchParams("http://localhost:3000/about?lng=en")
			);

			// No tags should be removed if they are updated
			expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(5);
		});

		it("should remove old hreflang links that are no longer needed", () => {
			// Manually create an old hreflang link that won't be updated
			const oldLink = document.createElement("link");
			oldLink.setAttribute("rel", "alternate");
			oldLink.setAttribute("hreflang", "old-lang");
			oldLink.setAttribute("href", "http://old.com/old-lang");
			document.head.appendChild(oldLink);

			renderHook(() => useSeoAndTitle());

			// The old link should be removed
			expect(document.head.querySelector('link[hreflang="old-lang"]')).toBeNull();
			// New tags should be created (en, es, fr, de, x-default)
			expect(document.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(5);
		});

		it("should remove platform and grid parameters from hreflang URLs", () => {
			mockUseLocation.mockReturnValue({
				pathname: "/",
				search: "?platform=test&grid=123&other=value",
			});
			renderHook(() => useSeoAndTitle());

			const hreflangLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
			const enLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "en"
			);
			const frLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "fr"
			);
			const esLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "es"
			);
			const deLink = Array.from(hreflangLinks).find(
				(link) => link.getAttribute("hreflang") === "de"
			);

			const expectedEnUrl = new URL("http://localhost:3000/");
			expectedEnUrl.searchParams.set("lng", "en");
			expectedEnUrl.searchParams.set("other", "value");

			const expectedFrUrl = new URL("http://localhost:3000/");
			expectedFrUrl.searchParams.set("lng", "fr");
			expectedFrUrl.searchParams.set("other", "value");

			const expectedEsUrl = new URL("http://localhost:3000/");
			expectedEsUrl.searchParams.set("lng", "es");
			expectedEsUrl.searchParams.set("other", "value");

			const expectedDeUrl = new URL("http://localhost:3000/");
			expectedDeUrl.searchParams.set("lng", "de");
			expectedDeUrl.searchParams.set("other", "value");

			expect(sortSearchParams(enLink?.getAttribute("href") || "")).toBe(
				sortSearchParams(expectedEnUrl.toString())
			);
			expect(sortSearchParams(frLink?.getAttribute("href") || "")).toBe(
				sortSearchParams(expectedFrUrl.toString())
			);
			expect(sortSearchParams(esLink?.getAttribute("href") || "")).toBe(
				sortSearchParams(expectedEsUrl.toString())
			);
			expect(sortSearchParams(deLink?.getAttribute("href") || "")).toBe(
				sortSearchParams(expectedDeUrl.toString())
			);
		});

		it("should correctly generate x-default hreflang tag", () => {
			mockUseLocation.mockReturnValue({ pathname: "/about", search: "?param=value" });
			renderHook(() => useSeoAndTitle());

			const xDefaultLink = document.querySelector('link[hreflang="x-default"]');
			const expectedUrl = new URL("http://localhost:3000/about");
			expectedUrl.searchParams.set("lng", "en");
			expectedUrl.searchParams.set("param", "value");

			expect(sortSearchParams(xDefaultLink?.getAttribute("href") || "")).toBe(
				sortSearchParams(expectedUrl.toString())
			);
		});
	});
});
