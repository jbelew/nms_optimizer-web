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
vi.mock("./AppDialog", () => ({
	default: ({
		isOpen,
		onClose,
		titleKey,
		content,
	}: {
		isOpen?: boolean;
		onClose?: () => void;
		titleKey?: string;
		content?: React.ReactNode;
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
	ShareLinkContent: ({ shareUrl, onClose }: { shareUrl?: string; onClose?: () => void }) => (
		<div data-testid="share-link-content">
			<input readOnly value={shareUrl} />
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
			<ShareLinkDialog isOpen={false} shareUrl={testUrl} onClose={mockOnClose} />
		);

		expect(container.firstChild).toBeNull();
	});

	test("should render when isOpen is true", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		expect(screen.getByTestId("app-dialog")).toBeInTheDocument();
	});

	test("should render with correct title key", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		expect(screen.getByText("dialogs.titles.shareLink")).toBeInTheDocument();
	});

	test("should pass shareUrl to ShareLinkContent", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		const input = screen.getByRole("textbox");
		expect(input).toHaveValue(testUrl);
	});

	test("should pass onClose callback to AppDialog", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		const closeButton = screen.getByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should handle different share URLs", () => {
		const { rerender } = render(
			<ShareLinkDialog
				isOpen={true}
				shareUrl="https://example.com/url1"
				onClose={mockOnClose}
			/>
		);

		let input = screen.getByRole("textbox");
		expect(input).toHaveValue("https://example.com/url1");

		rerender(
			<ShareLinkDialog
				isOpen={true}
				shareUrl="https://example.com/url2"
				onClose={mockOnClose}
			/>
		);

		input = screen.getByRole("textbox");
		expect(input).toHaveValue("https://example.com/url2");
	});

	test("should render ShareLinkContent component", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		expect(screen.getByTestId("share-link-content")).toBeInTheDocument();
	});

	test("should properly use translation for title", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		// Both titleKey (i18n) and translated title are passed
		expect(screen.getByText("dialogs.titles.shareLink")).toBeInTheDocument();
	});

	test("should call onClose from AppDialog", () => {
		render(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		const closeButton = screen.getByText("Close");
		closeButton.click();

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should toggle visibility based on isOpen prop", () => {
		const { rerender, container } = render(
			<ShareLinkDialog isOpen={false} shareUrl={testUrl} onClose={mockOnClose} />
		);

		expect(container.firstChild).toBeNull();

		rerender(<ShareLinkDialog isOpen={true} shareUrl={testUrl} onClose={mockOnClose} />);

		expect(screen.getByTestId("app-dialog")).toBeInTheDocument();

		rerender(<ShareLinkDialog isOpen={false} shareUrl={testUrl} onClose={mockOnClose} />);

		expect(screen.queryByTestId("app-dialog")).not.toBeInTheDocument();
	});
});
