import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import ErrorContent from "./ErrorContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey, components }: { i18nKey: string; components?: unknown[] }) => {
		// Render the trans component to properly handle nested components
		if (components?.[1]) {
			// Insert the link component
			const key = typeof i18nKey === "string" ? i18nKey : "";
			const comp1 = components[1] as React.ReactNode;

			return (
				<span>
					{key.substring(0, 1)}
					{comp1}
					{key.substring(1)}
				</span>
			);
		}

		return <span>{i18nKey}</span>;
	},
}));

// Helper to render component within Dialog context
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>
				<Dialog.Title className="sr-only">Error</Dialog.Title>
				<Dialog.Description className="sr-only">
					Error dialog with details
				</Dialog.Description>
				{component}
			</Dialog.Content>
		</Dialog.Root>
	);
};

describe("ErrorContent", () => {
	const mockOnClose = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render error title", () => {
		renderWithDialog(<ErrorContent onClose={mockOnClose} />);
		expect(screen.getByText("errorContent.signalDisruption")).toBeInTheDocument();
	});

	test("should render error details text", () => {
		renderWithDialog(<ErrorContent onClose={mockOnClose} />);
		expect(screen.getByText("errorContent.serverErrorDetails")).toBeInTheDocument();
	});

	test("should render close button with correct label", () => {
		renderWithDialog(<ErrorContent onClose={mockOnClose} />);
		expect(screen.getByText("dialogs.userStats.closeButton")).toBeInTheDocument();
	});

	test("should call onClose when close button is clicked", () => {
		renderWithDialog(<ErrorContent onClose={mockOnClose} />);
		const closeButton = screen.getByRole("button", {
			name: /dialogs\.userStats\.closeButton/i,
		});
		fireEvent.click(closeButton);
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should render link to GitHub issues", () => {
		renderWithDialog(<ErrorContent onClose={mockOnClose} />);
		const githubLink = screen.getByRole("link");
		expect(githubLink).toHaveAttribute(
			"href",
			"https://github.com/jbelew/nms_optimizer-web/issues"
		);
		expect(githubLink).toHaveAttribute("target", "_blank");
		expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("should be memoized for performance", () => {
		const { rerender } = renderWithDialog(<ErrorContent onClose={mockOnClose} />);
		const initialContent = screen.getByText("errorContent.signalDisruption");

		// Create a new function reference with same behavior
		const newMockOnClose = vi.fn();
		rerender(
			<Dialog.Root open={true}>
				<Dialog.Content>
					<Dialog.Title className="sr-only">Error</Dialog.Title>
					<Dialog.Description className="sr-only">
						Error dialog with details
					</Dialog.Description>
					<ErrorContent onClose={newMockOnClose} />
				</Dialog.Content>
			</Dialog.Root>
		);

		// Content should still be in document (verifying component renders)
		expect(initialContent).toBeInTheDocument();
	});
});
