import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import OfflineBanner from "./OfflineBanner";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey, defaults }: { i18nKey: string; defaults?: string }) => (
		<span>{defaults || i18nKey}</span>
	),
}));

describe("OfflineBanner", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset navigator.onLine to online by default
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});
	});

	afterEach(() => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});
	});

	test("should not render banner when online", () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});

		const { container } = render(<OfflineBanner />);

		expect(container.firstChild).toBeNull();
	});

	test("should render banner when offline", () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		render(<OfflineBanner />);

		expect(screen.getByText("-kzzkt- Offline! -kzzkt-")).toBeInTheDocument();
		expect(
			screen.getByText(
				"An internet connection is required to use this application. Please reconnect to access its features."
			)
		).toBeInTheDocument();
	});

	test("should show banner when offline event is dispatched", async () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});

		const { container } = render(<OfflineBanner />);

		// Initially should not render
		expect(container.firstChild).toBeNull();

		// Dispatch offline event
		fireEvent.offline(window);

		// Wait for banner to appear
		await waitFor(() => {
			expect(screen.getByText("-kzzkt- Offline! -kzzkt-")).toBeInTheDocument();
		});
	});

	test("should hide banner when online event is dispatched", async () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		const { container } = render(<OfflineBanner />);

		// Initially should render
		expect(screen.getByText("-kzzkt- Offline! -kzzkt-")).toBeInTheDocument();

		// Dispatch online event
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});
		fireEvent.online(window);

		// Wait for banner to disappear
		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});
	});

	test("should render offline icon SVG", () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		const { container } = render(<OfflineBanner />);

		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
		expect(svg).toHaveAttribute("viewBox", "0 0 126.75 126.77");
	});

	test("should cleanup event listeners on unmount", () => {
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		const { unmount } = render(<OfflineBanner />);

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
		expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));

		removeEventListenerSpy.mockRestore();
	});

	test("should add event listeners on mount", () => {
		const addEventListenerSpy = vi.spyOn(window, "addEventListener");

		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});

		render(<OfflineBanner />);

		expect(addEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
		expect(addEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));

		addEventListenerSpy.mockRestore();
	});

	test("should render the offline title with correct styling", () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		const { container } = render(<OfflineBanner />);

		const title = container.querySelector(".offline__title");
		expect(title).toBeInTheDocument();
		expect(title).toHaveClass("text-2xl", "font-semibold", "tracking-widest");
	});

	test("should render the offline logo div", () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		const { container } = render(<OfflineBanner />);

		const logo = container.querySelector(".offline__logo");
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveClass("mb-4");
	});

	test("should wrap content in offline container with full width", () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});

		const { container } = render(<OfflineBanner />);

		const offlineDiv = container.querySelector(".offline");
		expect(offlineDiv).toBeInTheDocument();
		expect(offlineDiv).toHaveClass("w-full", "text-center");
	});

	test("should handle multiple offline/online toggles", async () => {
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});

		const { container } = render(<OfflineBanner />);

		// Go offline
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});
		fireEvent.offline(window);

		await waitFor(() => {
			expect(screen.getByText("-kzzkt- Offline! -kzzkt-")).toBeInTheDocument();
		});

		// Go online
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: true,
		});
		fireEvent.online(window);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});

		// Go offline again
		Object.defineProperty(window.navigator, "onLine", {
			writable: true,
			value: false,
		});
		fireEvent.offline(window);

		await waitFor(() => {
			expect(screen.getByText("-kzzkt- Offline! -kzzkt-")).toBeInTheDocument();
		});
	});
});
