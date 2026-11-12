import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "@/store/grid/gridStore";
import i18n from "@/test/i18n";
import { sendDeferredEvent } from "@/utils/analytics/tracking";
import { DialogProvider } from "@/utils/system/dialogUtils";

import AppHeader from "./AppHeader";

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

vi.mock("@/utils/analytics/tracking", () => ({
	sendDeferredEvent: vi.fn(),
	sendEvent: vi.fn(),
	syncAnalyticsPlatformProperty: vi.fn(),
}));

vi.mock("@/components/LanguageSelector/LanguageSelector", () => ({
	LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

const LocationDisplay = () => {
	const location = useLocation();

	return <div data-testid="router-location">{`${location.pathname}${location.search}`}</div>;
};

describe("AppHeader", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		useGridStore.setState({ isSharedGrid: false });
		await i18n.changeLanguage("en");
	});

	const renderComponent = (initialEntry = "/") =>
		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter initialEntries={[initialEntry]}>
					<DialogProvider>
						<Theme>
							<AppHeader />
							<LocationDisplay />
						</Theme>
					</DialogProvider>
				</MemoryRouter>
			</I18nextProvider>,
		);

	it("renders the application title", () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		renderComponent();
		expect(screen.getByText("NO MAN'S SKY")).toBeDefined();
	});

	it("renders both left and right controls on Tablet (640px, not 1024px)", () => {
		vi.mocked(useBreakpoint).mockImplementation((bp: string) => bp === "640px");
		renderComponent();

		expect(screen.getByRole("switch")).toBeDefined();
		expect(screen.getByLabelText(/changelog/i)).toBeDefined();
	});

	it("hides left controls and keeps right controls on Desktop (640px and 1024px)", () => {
		vi.mocked(useBreakpoint).mockImplementation(
			(bp: string) => bp === "640px" || bp === "1024px",
		);
		renderComponent();

		expect(screen.getByRole("switch")).toBeDefined();
		expect(screen.getByLabelText(/changelog/i)).toBeDefined();
	});

	it("hides both control sections on Mobile (below 640px)", () => {
		vi.mocked(useBreakpoint).mockReturnValue(false);
		renderComponent();

		expect(screen.queryByRole("switch")).toBeNull();
		expect(screen.queryByLabelText(/changelog/i)).toBeNull();
	});

	it("renders a single workspace h1 starting with sr-only 'No Man's Sky - ' when no Routed Dialog is open", () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		const { container } = renderComponent("/");

		const headings = container.querySelectorAll("h1");
		expect(headings).toHaveLength(1);

		const h1 = headings[0];
		expect(h1.textContent?.startsWith("No Man's Sky - ")).toBe(true);

		const srPrefix = h1.querySelector(".sr-only");
		expect(srPrefix).not.toBeNull();
		expect(srPrefix).toHaveClass("whitespace-pre");
		expect(srPrefix?.textContent).toBe("No Man's Sky - ");
	});

	it("demotes the workspace title from h1 to div when a Routed Dialog route is active", () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		const { container } = renderComponent("/about/");

		expect(container.querySelectorAll("h1")).toHaveLength(0);

		const titleEl = container.querySelector(".app-header__title");
		expect(titleEl).not.toBeNull();
		expect(titleEl?.tagName).toBe("DIV");
	});

	it("renders Changelog and User Statistics as crawlable <a href> links preserving locale and query parameters", async () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		await i18n.changeLanguage("es");

		const { unmount } = renderComponent("/es/?platform=corvette");

		try {
			const changelogLink = screen.getByRole("link", { name: i18n.t("buttons.changelog") });
			const userStatsLink = screen.getByRole("link", { name: i18n.t("buttons.userStats") });

			expect(changelogLink.tagName).toBe("A");
			expect(changelogLink).toHaveAttribute("href", "/es/changelog/?platform=corvette");
			expect(userStatsLink.tagName).toBe("A");
			expect(userStatsLink).toHaveAttribute("href", "/es/userstats/?platform=corvette");

			// Modifier and middle clicks retain native browser navigation (not defaultPrevented, no SPA route push)
			const ctrlClickAllowed = fireEvent.click(userStatsLink, { button: 0, ctrlKey: true });
			expect(ctrlClickAllowed).toBe(true);
			expect(screen.getByTestId("router-location")).toHaveTextContent(
				"/es/?platform=corvette",
			);

			const middleClickAllowed = fireEvent.click(userStatsLink, { button: 1 });
			expect(middleClickAllowed).toBe(true);
			expect(screen.getByTestId("router-location")).toHaveTextContent(
				"/es/?platform=corvette",
			);

			// Primary unmodified left-click intercepts default navigation and opens Routed Dialog via SPA router
			const leftClickAllowed = fireEvent.click(changelogLink, { button: 0 });
			expect(leftClickAllowed).toBe(false);
			expect(screen.getByTestId("router-location")).toHaveTextContent(
				"/es/changelog/?platform=corvette",
			);
		} finally {
			unmount();
			await i18n.changeLanguage("en");
		}
	});

	it("emits focus_mode select_content telemetry when toggling the Focus Mode switch", () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		renderComponent();

		const focusModeSwitch = screen.getByRole("switch");
		fireEvent.click(focusModeSwitch);

		expect(sendDeferredEvent).toHaveBeenCalledWith({
			action: "select_content",
			category: "ui",
			content_type: "focus_mode",
			item_id: expect.stringMatching(/^(enabled|disabled)$/),
			nonInteraction: false,
		});
	});
});
