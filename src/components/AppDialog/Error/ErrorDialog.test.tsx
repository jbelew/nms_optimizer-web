import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { useOptimizeStore } from "../../../store/app/optimizeStore";
import ErrorDialog from "./ErrorDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock optimizeStore
vi.mock("../../../store/app/optimizeStore", () => ({
	useOptimizeStore: vi.fn(),
}));

// Mock AppDialog component
vi.mock("../Base/AppDialog", () => ({
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

// Mock ErrorContent component
vi.mock("./ErrorContent", () => ({
	default: ({ onClose }: { onClose?: () => void }) => (
		<div data-testid="error-content">
			<button onClick={onClose}>Dismiss Error</button>
		</div>
	),
}));

describe("ErrorDialog", () => {
	const mockSetShowError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			showError: false,
			setShowError: mockSetShowError,
		});
	});

	test("should not render when showError is false", () => {
		const { container } = render(<ErrorDialog />);
		expect(container.firstChild).toBeNull();
	});

	test("should render when showError is true", async () => {
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			showError: true,
			setShowError: mockSetShowError,
		});

		render(<ErrorDialog />);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
		expect(await screen.findByTestId("error-content")).toBeInTheDocument();
	});

	test("should call setShowError(false) when dialog is closed", async () => {
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			showError: true,
			setShowError: mockSetShowError,
		});

		render(<ErrorDialog />);

		const closeButton = await screen.findByText("Close");
		closeButton.click();

		expect(mockSetShowError).toHaveBeenCalledWith(false);
	});

	test("should call setShowError(false) when error content is dismissed", async () => {
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			showError: true,
			setShowError: mockSetShowError,
		});

		render(<ErrorDialog />);

		const dismissButton = await screen.findByText("Dismiss Error");
		dismissButton.click();

		expect(mockSetShowError).toHaveBeenCalledWith(false);
	});
});
