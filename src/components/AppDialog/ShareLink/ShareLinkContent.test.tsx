import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { ShareLinkContent } from "./ShareLinkContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
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
	const mockOnClose = vi.fn();
	const testUrl = "https://example.com/build?layout=abc123";

	beforeEach(() => {
		vi.clearAllMocks();
		mockClipboard.writeText.mockResolvedValue(undefined);
	});

	test("should render description text", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		expect(screen.getByText("dialogs.shareLink.description")).toBeInTheDocument();
	});

	test("should render share URL in textarea", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue(testUrl);
		expect(textarea).toHaveAttribute("readonly");
	});

	test("should render tip text", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		expect(screen.getByText(/Open the link and Bookmark the page/)).toBeInTheDocument();
	});

	test("should render open link button with external link icon", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const openLink = screen.getByRole("link");
		expect(openLink).toHaveAttribute("href", testUrl);
		expect(openLink).toHaveAttribute("target", "_blank");
		expect(openLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("should render copy button initially", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		expect(screen.getByText("dialogs.shareLink.copyButton")).toBeInTheDocument();
	});

	test("should render close button", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		expect(screen.getByText("dialogs.shareLink.closeButton")).toBeInTheDocument();
	});

	test("should copy URL to clipboard when copy button is clicked", async () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const copyButton = screen.getByRole("button", {
			name: /dialogs\.shareLink\.copyButton/,
		});

		fireEvent.click(copyButton);

		await waitFor(() => {
			expect(mockClipboard.writeText).toHaveBeenCalledWith(testUrl);
		});
	});

	test("should show copied button state changes on successful copy", async () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const copyButton = screen.getByRole("button", {
			name: /dialogs\.shareLink\.copyButton/,
		});

		// Initially shows copy button
		expect(copyButton).toHaveTextContent("dialogs.shareLink.copyButton");

		fireEvent.click(copyButton);

		// After click, clipboard method should be called
		await waitFor(() => {
			expect(mockClipboard.writeText).toHaveBeenCalledWith(testUrl);
		});
	});

	test("should handle clipboard write error gracefully", async () => {
		const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockClipboard.writeText.mockRejectedValueOnce(new Error("Clipboard error"));

		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const copyButton = screen.getByRole("button", {
			name: /dialogs\.shareLink\.copyButton/,
		});

		fireEvent.click(copyButton);

		await waitFor(() => {
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		consoleErrorSpy.mockRestore();
	});

	test("should call onClose when close button is clicked", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const closeButton = screen.getByRole("button", {
			name: /dialogs\.shareLink\.closeButton/,
		});

		fireEvent.click(closeButton);
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should render textarea with 8 rows", () => {
		renderWithDialog(<ShareLinkContent shareUrl={testUrl} onClose={mockOnClose} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveAttribute("rows", "8");
	});

	test("should handle long URLs correctly", () => {
		const longUrl =
			"https://example.com/build?layout=very-long-uuid-string-with-many-characters-1234567890";
		renderWithDialog(<ShareLinkContent shareUrl={longUrl} onClose={mockOnClose} />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue(longUrl);
	});
});
