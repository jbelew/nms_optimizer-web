import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ShareLinkDialog from "./ShareLinkDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock AppDialog component
vi.mock("@/components/AppDialog/Base/AppDialog", () => ({
	default: ({
		content,
		footer,
		isOpen,
		onClose,
		titleKey,
	}: {
		content?: React.ReactNode;
		footer?: React.ReactNode;
		isOpen?: boolean;
		onClose?: () => void;
		titleKey?: string;
	}) => {
		if (!isOpen) return null;

		return (
			<div
				data-testid="app-dialog"
				role="dialog"
			>
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<div>{footer}</div>
				<button onClick={onClose}>Close</button>
			</div>
		);
	},
}));

describe("ShareLinkDialog", () => {
	const mockOnClose = vi.fn();
	const testUrl = "https://example.com/build?layout=abc123";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should not render when isOpen is false", () => {
		const { container } = render(
			<ShareLinkDialog
				isOpen={false}
				onClose={mockOnClose}
				shareUrl={testUrl}
			/>,
		);

		expect(container.firstChild).toBeNull();
	});

	test("should render dialog with description, tip, readonly 8-row textarea, and external link when open", async () => {
		render(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl={testUrl}
			/>,
		);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
		expect(screen.getByText("dialogs.titles.shareLink")).toBeInTheDocument();
		expect(screen.getByText("dialogs.shareLink.description")).toBeInTheDocument();
		expect(screen.getByText("dialogs.shareLink.tip")).toBeInTheDocument();

		const textarea = screen.getByRole("textbox");
		expect(textarea).toHaveValue(testUrl);
		expect(textarea).toHaveAttribute("readonly");
		expect(textarea).toHaveAttribute("rows", "8");

		const openLink = screen.getByRole("link");
		expect(openLink).toHaveAttribute("href", testUrl);
		expect(openLink).toHaveAttribute("target", "_blank");
		expect(openLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("should update textarea value when shareUrl prop changes", async () => {
		const { rerender } = render(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl="https://example.com/url1"
			/>,
		);

		expect(await screen.findByRole("textbox")).toHaveValue("https://example.com/url1");

		rerender(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl="https://example.com/url2"
			/>,
		);

		expect(await screen.findByRole("textbox")).toHaveValue("https://example.com/url2");
	});

	test("should call onClose callback when closed", async () => {
		render(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl={testUrl}
			/>,
		);

		const closeButton = await screen.findByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should toggle visibility based on isOpen prop", async () => {
		const { container, rerender } = render(
			<ShareLinkDialog
				isOpen={false}
				onClose={mockOnClose}
				shareUrl={testUrl}
			/>,
		);

		expect(container.firstChild).toBeNull();

		rerender(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl={testUrl}
			/>,
		);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();

		rerender(
			<ShareLinkDialog
				isOpen={false}
				onClose={mockOnClose}
				shareUrl={testUrl}
			/>,
		);

		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});
});
