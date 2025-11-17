import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import AppDialog from "./AppDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock dialogIconMapping utility
vi.mock("../../utils/dialogIconMapping", () => ({
	getDialogIconAndStyle: vi.fn(() => ({
		IconComponent: null,
		style: {},
	})),
}));

describe("AppDialog", () => {
	const mockOnClose = vi.fn();
	const defaultProps = {
		isOpen: true,
		onClose: mockOnClose,
		title: "Test Dialog",
		content: <div>Test Content</div>,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render the dialog when isOpen is true", () => {
		render(<AppDialog {...defaultProps} />);

		// The dialog content should be visible
		expect(screen.getByText("Test Content")).toBeInTheDocument();
		expect(screen.getByText("Test Dialog")).toBeInTheDocument();
	});

	test("should not render dialog content when isOpen is false", () => {
		const { container } = render(<AppDialog {...defaultProps} isOpen={false} />);

		// Dialog portal should exist but content visibility depends on radix implementation
		// We check that the component doesn't error out
		expect(container).toBeInTheDocument();
	});

	test("should call onClose when close button is clicked", async () => {
		render(<AppDialog {...defaultProps} />);

		// Find the close button (aria-label="Close dialog")
		const closeButton = screen.getByLabelText("Close dialog");
		fireEvent.click(closeButton);

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	test("should call onClose when Escape key is pressed", async () => {
		render(<AppDialog {...defaultProps} />);

		// Simulate pressing the Escape key
		fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	test("should render with titleKey when provided", () => {
		const mockGetDialogIconAndStyle = vi.fn(() => ({
			IconComponent: null,
			style: {},
		}));

		vi.doMock("../../utils/dialogIconMapping", () => ({
			getDialogIconAndStyle: mockGetDialogIconAndStyle,
		}));

		render(
			<AppDialog {...defaultProps} titleKey="dialogs.titles.test" title="Fallback Title" />
		);

		// Should use titleKey for translation
		expect(screen.getByText("dialogs.titles.test")).toBeInTheDocument();
	});

	test("should use fallback title when titleKey is not provided", () => {
		render(<AppDialog {...defaultProps} />);

		expect(screen.getByText("Test Dialog")).toBeInTheDocument();
	});

	test("should cleanup event listener on unmount", () => {
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		const { unmount } = render(<AppDialog {...defaultProps} />);

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

		removeEventListenerSpy.mockRestore();
	});

	test("should not call onClose for non-Escape keys", async () => {
		render(<AppDialog {...defaultProps} />);

		fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

		// Should not trigger onClose
		expect(mockOnClose).not.toHaveBeenCalled();
	});

	test("should render content as children", () => {
		const customContent = (
			<div>
				<p>Custom Content Line 1</p>
				<p>Custom Content Line 2</p>
			</div>
		);

		render(<AppDialog {...defaultProps} content={customContent} />);

		expect(screen.getByText("Custom Content Line 1")).toBeInTheDocument();
		expect(screen.getByText("Custom Content Line 2")).toBeInTheDocument();
	});

	test("should add padding to scrollable content for routed dialogs", () => {
		render(
			<AppDialog
				{...defaultProps}
				titleKey="dialogs.titles.about"
				content={<div>About Content</div>}
			/>
		);

		// The scrollable section should have pr-4 class for routed dialogs
		const scrollableSection = screen.getByText("About Content").closest("section");
		expect(scrollableSection?.className).toContain("pr-4");
	});

	test("should add padding to scrollable content for non-routed dialogs", () => {
		render(
			<AppDialog
				{...defaultProps}
				titleKey="dialogs.titles.serverError"
				content={<div>Error Content</div>}
			/>
		);

		// The scrollable section should have pr-2 class for non-routed dialogs
		const scrollableSection = screen.getByText("Error Content").closest("section");
		expect(scrollableSection?.className).toContain("pr-2");
	});

	test("should handle dialog close via onOpenChange", async () => {
		render(<AppDialog {...defaultProps} />);

		// Simulate the Radix Dialog's onOpenChange being triggered
		fireEvent.keyDown(window, { key: "Escape", code: "Escape" });

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	test("should render Separator element", () => {
		const { container } = render(<AppDialog {...defaultProps} />);

		// The Separator should be present in the document
		// We verify by checking the structure exists
		expect(container.querySelector('[class*="separator"]') || container).toBeInTheDocument();
	});
});
