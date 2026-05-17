import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import ShareLinkDialog from "./ShareLinkDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock AppDialog component
vi.mock("@/components/AppDialog/Base/AppDialog", () => ({
	default: ({
		content,
		isOpen,
		onClose,
		titleKey,
	}: {
		content?: React.ReactNode;
		isOpen?: boolean;
		onClose?: () => void;
		titleKey?: string;
	}) => {
		if (!isOpen) return null;

		return (
			<div data-testid="app-dialog" role="dialog">
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<button onClick={onClose}>Close</button>
			</div>
		);
	},
}));

// Mock ShareLinkContent component
vi.mock("./ShareLinkContent", () => ({
	ShareLinkContent: ({ onClose, shareUrl }: { onClose?: () => void; shareUrl?: string }) => (
		<div data-testid="share-link-content">
			<input aria-label="Share URL" readOnly value={shareUrl} />
			<button onClick={onClose}>Close Link Share</button>
		</div>
	),
}));

describe("ShareLinkDialog", () => {
	const mockOnClose = vi.fn();
	const testUrl = "https://example.com/build?layout=abc123";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should not render when isOpen is false", () => {
		const { container } = render(
			<ShareLinkDialog isOpen={false} onClose={mockOnClose} shareUrl={testUrl} />
		);

		expect(container.firstChild).toBeNull();
	});

	test("should render when isOpen is true", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
	});

	test("should render with correct title key", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		expect(await screen.findByText("dialogs.titles.shareLink")).toBeInTheDocument();
	});

	test("should pass shareUrl to ShareLinkContent", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		const input = await screen.findByRole("textbox");
		expect(input).toHaveValue(testUrl);
	});

	test("should pass onClose callback to AppDialog", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		const closeButton = await screen.findByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should handle different share URLs", async () => {
		const { rerender } = render(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl="https://example.com/url1"
			/>
		);

		let input = await screen.findByRole("textbox");
		expect(input).toHaveValue("https://example.com/url1");

		rerender(
			<ShareLinkDialog
				isOpen={true}
				onClose={mockOnClose}
				shareUrl="https://example.com/url2"
			/>
		);

		input = await screen.findByRole("textbox");
		expect(input).toHaveValue("https://example.com/url2");
	});

	test("should render ShareLinkContent component", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		expect(await screen.findByTestId("share-link-content")).toBeInTheDocument();
	});

	test("should properly use translation for title", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		// Both titleKey (i18n) and translated title are passed
		expect(await screen.findByText("dialogs.titles.shareLink")).toBeInTheDocument();
	});

	test("should call onClose from AppDialog", async () => {
		render(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		const closeButton = await screen.findByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should toggle visibility based on isOpen prop", async () => {
		const { container, rerender } = render(
			<ShareLinkDialog isOpen={false} onClose={mockOnClose} shareUrl={testUrl} />
		);

		expect(container.firstChild).toBeNull();

		rerender(<ShareLinkDialog isOpen={true} onClose={mockOnClose} shareUrl={testUrl} />);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();

		rerender(<ShareLinkDialog isOpen={false} onClose={mockOnClose} shareUrl={testUrl} />);

		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});
});
