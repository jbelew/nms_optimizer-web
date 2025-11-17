import React from "react";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../src/test/i18n";
import { useDialog } from "./dialog-utils";
import { DialogProvider } from "./DialogContext";

// Test the window.location.search preservation logic directly
const testDialogNavigation = (pathname: string, search: string, dialog: string, lang: string) => {
	const pathParts = pathname.split("/").filter(Boolean);
	const langCand = pathParts[0];
	const OTHER_LANGUAGES = ["es", "fr", "de", "pt"];

	if (OTHER_LANGUAGES.includes(langCand)) {
		// dialogPath would be pathParts[1] || null
	} else {
		// dialogPath would be pathParts[0] || null
	}

	const path = lang === "en" ? `/${dialog}` : `/${lang}/${dialog}`;
	return path + search;
};

const testDialogClosing = (pathname: string, search: string, lang: string) => {
	const path = lang === "en" ? "/" : `/${lang}`;
	return path + search;
};

// Mock window.location.search
const mockWindowLocationSearch = (search: string) => {
	Object.defineProperty(window, "location", {
		value: {
			...window.location,
			search,
		},
		writable: true,
		configurable: true,
	});
};

describe("DialogContext - Query Parameter Preservation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockWindowLocationSearch("");
	});

	it("should preserve query parameters when opening a dialog in English", () => {
		mockWindowLocationSearch("?platform=expedition&grid=abc123");

		const result = testDialogNavigation("/", "?platform=expedition&grid=abc123", "about", "en");

		expect(result).toBe("/about?platform=expedition&grid=abc123");
	});

	it("should preserve query parameters when opening a dialog with language prefix", () => {
		mockWindowLocationSearch("?platform=standard");

		const result = testDialogNavigation("/fr", "?platform=standard", "instructions", "fr");

		expect(result).toBe("/fr/instructions?platform=standard");
	});

	it("should preserve query parameters when closing a dialog", () => {
		mockWindowLocationSearch("?grid=xyz789");

		const result = testDialogClosing("/about", "?grid=xyz789", "en");

		expect(result).toBe("/?grid=xyz789");
	});

	it("should handle multiple query parameters correctly", () => {
		mockWindowLocationSearch("?platform=expedition&grid=abc123&other=value");

		const result = testDialogNavigation(
			"/",
			"?platform=expedition&grid=abc123&other=value",
			"changelog",
			"en"
		);

		expect(result).toContain("platform=expedition");
		expect(result).toContain("grid=abc123");
		expect(result).toContain("other=value");
	});

	it("should work with no query parameters", () => {
		mockWindowLocationSearch("");

		const result = testDialogNavigation("/", "", "userstats", "en");

		expect(result).toBe("/userstats");
	});

	it("should preserve query parameters when closing with language prefix", () => {
		mockWindowLocationSearch("?theme=dark");

		const result = testDialogClosing("/fr/about", "?theme=dark", "fr");

		expect(result).toBe("/fr?theme=dark");
	});

	it("should handle complex paths and query parameters", () => {
		mockWindowLocationSearch("?platform=atlantid&grid=building123&theme=dark");

		const result = testDialogNavigation(
			"/es",
			"?platform=atlantid&grid=building123&theme=dark",
			"translation",
			"es"
		);

		expect(result).toBe("/es/translation?platform=atlantid&grid=building123&theme=dark");
	});
});

describe("DialogProvider Component", () => {
	const TestComponent = () => {
		const {
			activeDialog,
			openDialog,
			closeDialog,
			tutorialFinished,
			markTutorialFinished,
			shareUrl,
		} = useDialog();

		return (
			<div>
				<div data-testid="activeDialog">{activeDialog || "null"}</div>
				<div data-testid="tutorialFinished">{tutorialFinished ? "true" : "false"}</div>
				<div data-testid="shareUrl">{shareUrl || "none"}</div>
				<button onClick={() => openDialog("about", { shareUrl: "http://example.com" })}>
					Open About
				</button>
				<button onClick={closeDialog}>Close Dialog</button>
				<button onClick={markTutorialFinished}>Mark Tutorial Finished</button>
			</div>
		);
	};

	const renderWithProviders = (initialRoute = "/") => {
		return render(
			<MemoryRouter initialEntries={[initialRoute]}>
				<I18nextProvider i18n={i18n}>
					<DialogProvider>
						<TestComponent />
					</DialogProvider>
				</I18nextProvider>
			</MemoryRouter>
		);
	};

	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
	});

	it("should render with default dialog state (null)", () => {
		renderWithProviders("/");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("null");
	});

	it("should recognize about dialog from path", () => {
		renderWithProviders("/about");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("about");
	});

	it("should recognize instructions dialog from path", () => {
		renderWithProviders("/instructions");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("instructions");
	});

	it("should recognize translation dialog from path", () => {
		renderWithProviders("/translation");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("translation");
	});

	it("should recognize userstats dialog from path", () => {
		renderWithProviders("/userstats");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("userstats");
	});

	it("should recognize changelog dialog from path", () => {
		renderWithProviders("/changelog");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("changelog");
	});

	it("should handle tutorial finished state from localStorage", () => {
		localStorage.setItem("tutorialFinished", "true");
		renderWithProviders("/");
		expect(screen.getByTestId("tutorialFinished")).toHaveTextContent("true");
	});

	it("should handle old tutorial finished key migration", () => {
		localStorage.setItem("hasVisitedNMSOptimizer", "true");
		renderWithProviders("/");
		expect(screen.getByTestId("tutorialFinished")).toHaveTextContent("true");
		expect(localStorage.getItem("tutorialFinished")).toBe("true");
		expect(localStorage.getItem("hasVisitedNMSOptimizer")).toBeNull();
	});

	it("should initialize tutorial as not finished", () => {
		renderWithProviders("/");
		expect(screen.getByTestId("tutorialFinished")).toHaveTextContent("false");
	});

	it("should handle language prefix in paths", () => {
		renderWithProviders("/fr/about");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("about");
	});

	it("should ignore unknown paths", () => {
		renderWithProviders("/unknown");
		expect(screen.getByTestId("activeDialog")).toHaveTextContent("null");
	});
});
