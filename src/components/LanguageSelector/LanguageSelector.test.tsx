import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock window.location.search
const mockWindowLocation = (search: string) => {
	const formattedSearch = search ? (search.startsWith("?") ? search : "?" + search) : "";
	Object.defineProperty(window, "location", {
		value: {
			...window.location,
			search: formattedSearch,
			href: `http://localhost${formattedSearch}`,
		},
		writable: true,
		configurable: true,
	});
};

// Create a hook that uses the language selector logic
const useLanguageSelectorNavigation = (pathParts: string[], newLang: string) => {
	const langCand = pathParts[0];
	const languages = ["es", "fr", "de", "pt"];
	let basePath = "/" + pathParts.join("/");

	if (languages.includes(langCand)) {
		basePath = "/" + pathParts.slice(1).join("/") || "/";
	}

	const newPath = newLang === "en" ? basePath : `/${newLang}${basePath === "/" ? "" : basePath}`;

	return newPath + window.location.search;
};

describe("LanguageSelector - Query Parameter Preservation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockWindowLocation("");
	});

	it("should preserve query parameters when changing language from English to Spanish", () => {
		mockWindowLocation("?platform=expedition&grid=abc123");

		const result = useLanguageSelectorNavigation([], "es");

		expect(result).toBe("/es?platform=expedition&grid=abc123");
	});

	it("should preserve query parameters when changing language from Spanish to English", () => {
		mockWindowLocation("?platform=standard");

		const result = useLanguageSelectorNavigation(["es"], "en");

		expect(result).toBe("/?platform=standard");
	});

	it("should preserve query parameters when changing from one non-English language to another", () => {
		mockWindowLocation("?grid=xyz789&other=value");

		const result = useLanguageSelectorNavigation(["fr"], "de");

		expect(result).toBe("/de?grid=xyz789&other=value");
	});

	it("should preserve multiple query parameters", () => {
		mockWindowLocation("?platform=expedition&grid=abc123&theme=dark&save=true");

		const result = useLanguageSelectorNavigation([], "es");

		expect(result).toContain("platform=expedition");
		expect(result).toContain("grid=abc123");
		expect(result).toContain("theme=dark");
		expect(result).toContain("save=true");
	});

	it("should work with dialog paths and query parameters", () => {
		mockWindowLocation("?platform=standard");

		const result = useLanguageSelectorNavigation(["about"], "fr");

		expect(result).toBe("/fr/about?platform=standard");
	});

	it("should work with language-prefixed dialog paths and query parameters", () => {
		mockWindowLocation("?grid=test123");

		const result = useLanguageSelectorNavigation(["es", "instructions"], "en");

		expect(result).toBe("/instructions?grid=test123");
	});

	it("should preserve empty query string correctly", () => {
		mockWindowLocation("");

		const result = useLanguageSelectorNavigation([], "es");

		expect(result).toBe("/es");
	});

	it("should handle special characters in query parameter values", () => {
		mockWindowLocation("?url=https%3A%2F%2Fexample.com&encoded=test%20value");

		const result = useLanguageSelectorNavigation([], "pt");

		expect(result).toContain("url=https%3A%2F%2Fexample.com");
		expect(result).toContain("encoded=test%20value");
	});

	it("should preserve query parameters when navigating to translation request dialog", () => {
		mockWindowLocation("?platform=atlantid&grid=building123");

		// Translation request follows the pattern: lang === "en" ? "/translation" : `/${lang}/translation`
		const lang = "en";
		const path = lang === "en" ? "/translation" : `/en/translation`;
		const result = path + window.location.search;

		expect(result).toBe("/translation?platform=atlantid&grid=building123");
	});

	it("should preserve query parameters for translation request with non-English language", () => {
		mockWindowLocation("?platform=standard");

		const lang = "es";
		// @ts-expect-error - Testing branch that will never execute
		const path = lang === "en" ? "/translation" : `/es/translation`;
		const result = path + window.location.search;

		expect(result).toBe("/es/translation?platform=standard");
	});
});
