import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as trackingModule from "@/utils/analytics/tracking";
import i18n from "@/test/i18n";
import { sendDeferredEvent } from "@/utils/analytics/tracking";
import { DialogProvider } from "@/utils/system/dialogUtils";

import AppFooter from "./AppFooter";

vi.mock("@/utils/analytics/tracking", async (importOriginal) => {
	const actual = await importOriginal<typeof trackingModule>();

	return {
		...actual,
		sendDeferredEvent: vi.fn(),
	};
});

const LocationDisplay = () => {
	const location = useLocation();

	return <div data-testid="router-location">{`${location.pathname}${location.search}`}</div>;
};

describe("AppFooter Component", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		await i18n.changeLanguage("en");
	});

	const renderComponent = (initialEntry = "/") => {
		return render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={[initialEntry]}>
					<DialogProvider>
						<Theme>
							<AppFooter buildVersion="1.0.0" />
							<LocationDisplay />
						</Theme>
					</DialogProvider>
				</MemoryRouter>
			</I18nextProvider>,
		);
	};

	it("should render build version", () => {
		renderComponent();
		expect(screen.getByText(/1.0.0/)).toBeDefined();
	});

	it("should render developer name", () => {
		renderComponent();
		expect(screen.getByText(/void23/i)).toBeDefined();
	});

	it("renders Privacy Policy as a crawlable <a href> link with SPA primary click and native modifier click", async () => {
		await i18n.changeLanguage("es");
		const { unmount } = renderComponent("/es/?platform=corvette");

		try {
			const privacyLink = screen.getByRole("link", { name: "buttons.privacy" });

			expect(privacyLink.tagName).toBe("A");
			expect(privacyLink).toHaveClass("app-footer__link");
			expect(privacyLink).toHaveAttribute("href", "/es/privacy/?platform=corvette");

			expect(fireEvent.click(privacyLink, { button: 0, metaKey: true })).toBe(true);
			expect(fireEvent.click(privacyLink, { button: 1 })).toBe(true);
			expect(screen.getByTestId("router-location")).toHaveTextContent(
				"/es/?platform=corvette",
			);

			expect(fireEvent.click(privacyLink, { button: 0 })).toBe(false);
			expect(screen.getByTestId("router-location")).toHaveTextContent(
				"/es/privacy/?platform=corvette",
			);
		} finally {
			unmount();
			await i18n.changeLanguage("en");
		}
	});

	it("emits outbound_link select_content telemetry for footer external links", () => {
		renderComponent();

		fireEvent.click(screen.getByRole("link", { name: i18n.t("buttons.viewSourceOnGithub") }));
		expect(sendDeferredEvent).toHaveBeenCalledWith({
			action: "select_content",
			category: "engagement",
			content_type: "outbound_link",
			item_id: "github_repo",
			nonInteraction: false,
		});

		fireEvent.click(
			screen.getByRole("link", { name: i18n.t("buttons.viewProfileOnLinkedin") }),
		);
		expect(sendDeferredEvent).toHaveBeenCalledWith({
			action: "select_content",
			category: "engagement",
			content_type: "outbound_link",
			item_id: "linkedin",
			nonInteraction: false,
		});

		fireEvent.click(screen.getByRole("link", { name: i18n.t("footer.ratingPill") }));
		expect(sendDeferredEvent).toHaveBeenCalledWith({
			action: "select_content",
			category: "engagement",
			content_type: "outbound_link",
			item_id: "github_star",
			nonInteraction: false,
		});
	});
});
