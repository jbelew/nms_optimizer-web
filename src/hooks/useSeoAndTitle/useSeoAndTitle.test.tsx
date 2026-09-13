import { renderHook } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@/test/i18n";
import { sendEvent } from "@/utils/analytics/tracking";

import { useSeoAndTitle } from "./useSeoAndTitle";

vi.mock("@/utils/analytics/tracking", () => ({
	sendEvent: vi.fn(),
}));

describe("useSeoAndTitle", () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<I18nextProvider i18n={i18n}>
			<MemoryRouter>{children}</MemoryRouter>
		</I18nextProvider>
	);

	beforeEach(() => {
		vi.clearAllMocks();
		document.documentElement.lang = "";
	});

	it("should update document language", () => {
		renderHook(() => useSeoAndTitle(), { wrapper });
		expect(document.documentElement.lang).toBe("en");
	});

	it("should send analytics page_view event", () => {
		renderHook(() => useSeoAndTitle(), { wrapper });
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
			})
		);
	});

	it("should send analytics page_view event with formatted title for instructions tracer route", () => {
		i18n.addResource(
			"en",
			"translation",
			"seo.instructionsPageTitle",
			"How to Optimize Your Tech Layout"
		);
		i18n.addResource("en", "translation", "appName", "NMS Optimizer");
		const instructionsWrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={["/instructions/"]}>{children}</MemoryRouter>
			</I18nextProvider>
		);
		renderHook(() => useSeoAndTitle(), { wrapper: instructionsWrapper });
		expect(sendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "page_view",
				category: "engagement",
				page: "/instructions/",
				page_title: "How to Optimize Your Tech Layout | NMS Optimizer",
			})
		);
	});
});
