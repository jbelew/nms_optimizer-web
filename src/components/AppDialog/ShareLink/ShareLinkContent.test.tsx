import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { ShareLinkContent } from "./ShareLinkContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

// Mock clipboard API
const mockClipboard = {
	writeText: vi.fn(),
};

// Setup clipboard mock
Object.defineProperty(navigator, "clipboard", {
	value: mockClipboard,
	configurable: true,
});

// Helper to render component within Dialog context
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>{component}</Dialog.Content>
		</Dialog.Root>
	);
};

describe("ShareLinkContent", () => {
	const testUrl = "https://example.com/build?layout=abc123";

	beforeEach(() => {
		vi.clearAllMocks();
		mockClipboard.writeText.mockResolvedValue(undefined);
	});

	test("should render description text", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} />);
		expect(screen.getByText("dialogs.shareLink.description")).toBeInTheDocument();
	});

	test("should render share URL in textarea", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue(testUrl);
		expect(textarea).toHaveAttribute("readonly");
	});

	test("should render tip text", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} />);
		expect(screen.getByText("dialogs.shareLink.tip")).toBeInTheDocument();
	});

	test("should render open link button with external link icon", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} />);
		const openLink = screen.getByRole("link");
		expect(openLink).toHaveAttribute("href", testUrl);
		expect(openLink).toHaveAttribute("target", "_blank");
		expect(openLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("should render textarea with 8 rows", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveAttribute("rows", "8");
	});

	test("should handle long URLs correctly", () => {
		const longUrl =
			"https://example.com/build?layout=very-long-uuid-string-with-many-characters-1234567890";
		renderWithDialog(<ShareLinkContent shareUrl={longUrl} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue(longUrl);
	});
});
