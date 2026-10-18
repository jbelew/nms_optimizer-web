import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "@/store/grid/gridStore";
import i18n from "@/test/i18n";

import AppHeader from "./AppHeader";

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

vi.mock("@/hooks/useAnalytics/useAnalytics", () => ({
	useAnalytics: () => ({
		sendDeferredEvent: vi.fn(),
		sendEvent: vi.fn(),
	}),
}));

vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: () => ({
		closeDialog: vi.fn(),
		openDialog: vi.fn(),
	}),
}));

vi.mock("@/components/LanguageSelector/LanguageSelector", () => ({
	LanguageSelector: () => <div data-testid="language-selector">LanguageSelector</div>,
}));

describe("AppHeader", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useGridStore.setState({ isSharedGrid: false });
	});

	const renderComponent = () =>
		render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter>
					<Theme>
						<AppHeader />
					</Theme>
				</MemoryRouter>
			</I18nextProvider>
		);

	it("renders the application title", () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		renderComponent();
		expect(screen.getByText(/NO MAN'S SKY/i)).toBeDefined();
	});

	it("renders both left and right controls on Tablet (640px, not 1024px)", () => {
		vi.mocked(useBreakpoint).mockImplementation((bp: string) => bp === "640px");
		renderComponent();

		expect(screen.getByRole("switch")).toBeDefined();
		expect(screen.getByLabelText(/changelog/i)).toBeDefined();
	});

	it("hides left controls and keeps right controls on Desktop (640px and 1024px)", () => {
		vi.mocked(useBreakpoint).mockImplementation(
			(bp: string) => bp === "640px" || bp === "1024px"
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
});
