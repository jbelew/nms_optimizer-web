import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import i18n from "@/test/i18n";

import AppHeader from "./AppHeader";

// Mock hooks
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

describe("AppHeader Component", () => {
	const renderComponent = () => {
		return render(
			<I18nextProvider i18n={i18n}>
				<MemoryRouter>
					<Theme>
						<AppHeader onShowChangelog={vi.fn()} />
					</Theme>
				</MemoryRouter>
			</I18nextProvider>
		);
	};

	it("should render the application title", () => {
		// Mock mobile/desktop breakpoints to ensure elements render
		vi.mocked(useBreakpoint).mockReturnValue(true);

		renderComponent();

		expect(screen.getByText(/NO MAN'S SKY/i)).toBeDefined();
	});
});
