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
	initReactI18next: {
		// Mock initReactI18next
		type: "3rdParty",
		init: vi.fn(),
	},
}));

/**
 * Test suite for the `useSeoAndTitle` hook.
 */
describe("useSeoAndTitle", () => {
	const mockUseLocation = useLocation as Mock;
	const mockUseTranslation = useTranslation as Mock;

	/**
	 * Sets up mocks and initializes test environment before each test.
	 */
	beforeEach(() => {
		vi.clearAllMocks();

		// Reset document.head content before each test
		document.head.innerHTML = "";

		// Mock window properties
		Object.defineProperty(window, "location", {
			value: { origin: "http://localhost:3000", pathname: "/", search: "" },
			writable: true,
		});
		Object.defineProperty(document, "title", { value: "", writable: true });

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
		vi.restoreAllMocks();
	});

	/**
	 * Test suite for document title updates.
	 */
	describe("Document Title", () => {
		/**
		 * Verifies that the document title is set correctly for the default path.
		 */
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

		/**
		 * Verifies that the document title is set correctly for the instructions path.
		 */
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

		/**
		 * Verifies that the document title is set correctly for the about path.
		 */
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

		/**
		 * Verifies that the document title is set correctly for the changelog path.
		 */
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

		/**
		 * Verifies that the document title is set correctly for the translation path.
		 */
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

		/**
		 * Verifies that the document title defaults to the app name for unknown paths.
		 */
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
});
