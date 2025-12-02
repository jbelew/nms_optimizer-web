import { act, renderHook } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { Location, MemoryRouter } from "react-router-dom"; // Import Location
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import i18n from "../../test/i18n";
import { useLanguage } from "./useLanguage";

// Helper function to create a mock Location object
const createMockLocation = (pathname: string): Location => ({
	pathname,
	search: "",
	hash: "",
	state: null,
	key: "default",
});

// No need to declare useLocationMock at top level anymore
// let useLocationMock: Mock<() => Location>; // This line will be removed

vi.mock("react-router-dom", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router-dom")>();

	return {
		...actual,
		useLocation: vi.fn(() => createMockLocation("/")), // Directly return the mock function
	};
});

describe("useLanguage", () => {
	let useLocationMock: Mock<() => Location>; // Declare useLocationMock inside describe scope

	beforeEach(async () => {
		// Make beforeEach async to await import
		vi.clearAllMocks();
		// No need for vi.resetModules() if we manage the mock's state in beforeEach

		// Import useLocation from the mocked module
		const { useLocation } = await import("react-router-dom");
		useLocationMock = useLocation as Mock<() => Location>;

		useLocationMock.mockReturnValue(createMockLocation("/")); // Ensure the mock returns a Location object
		i18n.changeLanguage("en");
	});

	it("should return 'en' by default", () => {
		const { result } = renderHook(() => useLanguage(), {
			wrapper: ({ children }) => (
				<I18nextProvider i18n={i18n}>
					<MemoryRouter>{children}</MemoryRouter>
				</I18nextProvider>
			),
		});
		expect(result.current).toBe("en");
	});

	it("should return the language from the URL if it is supported", async () => {
		useLocationMock.mockReturnValue(createMockLocation("/fr"));
		const { result, rerender } = renderHook(() => useLanguage(), {
			wrapper: ({ children }) => (
				<I18nextProvider i18n={i18n}>
					<MemoryRouter>{children}</MemoryRouter>
				</I18nextProvider>
			),
		});

		await act(async () => {
			rerender({});
		});

		expect(result.current).toBe("fr");
	});

	it("should return 'en' if the language in the URL is not supported", () => {
		useLocationMock.mockReturnValue(createMockLocation("/es"));
		const { result } = renderHook(() => useLanguage(), {
			wrapper: ({ children }) => (
				<I18nextProvider i18n={i18n}>
					<MemoryRouter>{children}</MemoryRouter>
				</I18nextProvider>
			),
		});
		expect(result.current).toBe("en");
	});

	it("should change the language when the URL changes", async () => {
		const { rerender } = renderHook(() => useLanguage(), {
			wrapper: ({ children }) => (
				<I18nextProvider i18n={i18n}>
					<MemoryRouter>{children}</MemoryRouter>
				</I18nextProvider>
			),
		});

		useLocationMock.mockReturnValue(createMockLocation("/fr"));

		await act(async () => {
			rerender({});
		});

		expect(i18n.language).toBe("fr");
	});
});
