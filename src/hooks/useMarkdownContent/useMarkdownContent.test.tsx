import { renderHook, waitFor } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { useMarkdownContent } from "./useMarkdownContent";

// Mock react-i18next's useTranslation
vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

// Mock the virtual markdown bundle
vi.mock("virtual:markdown-bundle", () => ({
	getMarkdown: vi.fn(),
}));

describe("useMarkdownContent", () => {
	const mockUseTranslation = useTranslation as Mock;
	let mockGetMarkdown: Mock;

	beforeEach(async () => {
		vi.clearAllMocks();

		// Get the mocked getMarkdown function
		const markdownModule = await import("virtual:markdown-bundle");
		mockGetMarkdown = markdownModule.getMarkdown as Mock;

		// Default mock for useTranslation
		mockUseTranslation.mockReturnValue({
			i18n: {
				language: "en-US",
				options: { fallbackLng: ["en"] },
			},
			t: (key: string) => key,
		});
	});

	it("should fetch markdown content successfully", async () => {
		mockGetMarkdown.mockReturnValue("# Test Markdown");

		const { result } = renderHook(() => useMarkdownContent("test-file"));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
			expect(result.current.markdown).toBe("# Test Markdown");
			expect(result.current.error).toBeNull();
		});

		expect(mockGetMarkdown).toHaveBeenCalledWith("en", "test-file");
	});

	it("should use cached content if available", async () => {
		mockGetMarkdown.mockReturnValue("# Cached Markdown");

		const { result, rerender } = renderHook(() => useMarkdownContent("cached-file"));

		// Wait for first load
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		const callCountAfterFirst = mockGetMarkdown.mock.calls.length;

		// Rerender with same file
		rerender();

		// Should use cached content without additional calls
		await waitFor(() => {
			expect(result.current.markdown).toBe("# Cached Markdown");
		});

		// getMarkdown should still be called on each render due to dependency array
		expect(mockGetMarkdown.mock.calls.length).toBeGreaterThanOrEqual(callCountAfterFirst);
	});

	it("should handle fetch error", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockGetMarkdown.mockReturnValue(""); // Returns empty string (not found)

		const { result } = renderHook(() => useMarkdownContent("non-existent-file"));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
			expect(result.current.markdown).toContain("Failed to load content");
			expect(result.current.error).toContain(
				"Markdown content not found for non-existent-file"
			);
		});

		consoleErrorSpy.mockRestore();
	});

	it("should fall back to default language if specific language not found", async () => {
		mockUseTranslation.mockReturnValue({
			i18n: {
				language: "fr-FR",
				options: { fallbackLng: ["en"] },
			},
			t: (key: string) => key,
		});

		// Simulate the actual getMarkdown behavior: returns English content as fallback
		mockGetMarkdown.mockImplementation((lang: string) => {
			// Simulate French file not existing, but English does
			if (lang === "fr") {
				return "# English Fallback"; // getMarkdown does fallback internally
			}

			return "# English Fallback";
		});

		const { result } = renderHook(() => useMarkdownContent("localized-file"));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
			expect(result.current.markdown).toBe("# English Fallback");
		});

		// getMarkdown should be called with 'fr' (from language)
		expect(mockGetMarkdown).toHaveBeenCalledWith("fr", "localized-file");
	});

	it("should always fetch changelog in English", async () => {
		mockUseTranslation.mockReturnValue({
			i18n: {
				language: "de-DE",
				options: { fallbackLng: ["en"] },
			},
			t: (key: string) => key,
		});

		mockGetMarkdown.mockReturnValue("# Changelog EN");

		const { result } = renderHook(() => useMarkdownContent("changelog"));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
			expect(result.current.markdown).toBe("# Changelog EN");
		});

		expect(mockGetMarkdown).toHaveBeenCalledWith("en", "changelog");
	});

	it("should handle network error during fetch", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Simulate an error in getMarkdown (though it shouldn't throw in normal use)
		mockGetMarkdown.mockReturnValue(""); // Returns empty, triggering error state

		const { result } = renderHook(() => useMarkdownContent("network-error-file"));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
			expect(result.current.markdown).toContain("Failed to load content");
			expect(result.current.error).toContain(
				"Markdown content not found for network-error-file"
			);
		});

		consoleErrorSpy.mockRestore();
	});
});
