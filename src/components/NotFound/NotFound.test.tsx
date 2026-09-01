/**
 * @file NotFound component unit tests.
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sendEvent } from "@/utils/analytics/tracking";
import { lifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";

import NotFound from "./NotFound";

// Mock splash screen runtime
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

// Mock translation
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock tracking
vi.mock("@/utils/analytics/tracking", () => ({
	sendEvent: vi.fn(),
}));

describe("NotFound component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render the 404 page content, logo, and navigation link", () => {
		render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>
		);

		expect(screen.getByText("notFound.title")).toBeInTheDocument();
		expect(screen.getByText("notFound.message")).toBeInTheDocument();
		const backLink = screen.getByText("notFound.backToMain").closest("a");
		expect(backLink).toHaveAttribute("href", "/");
	});

	it("should signal readiness to lifecycleCoordinator on mount", () => {
		const markReadySpy = vi.spyOn(lifecycleCoordinator, "markReady");

		render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>
		);

		expect(markReadySpy).toHaveBeenCalledTimes(1);
		markReadySpy.mockRestore();
	});

	it("should set document title and track analytics page_view and not_found events", () => {
		render(
			<MemoryRouter>
				<NotFound />
			</MemoryRouter>
		);

		expect(document.title).toBe("404 - notFound.title");
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "navigation",
				nonInteraction: true,
				page_title: "404 - notFound.title",
			})
		);
		expect(sendEvent).toHaveBeenCalledWith({
			action: "not_found",
			category: "navigation",
			nonInteraction: true,
		});
	});
});
