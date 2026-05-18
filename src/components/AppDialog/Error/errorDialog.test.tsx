import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { useOptimizeStore } from "@/store/app/optimizeStore";

import { ErrorDialog } from "./errorDialog";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock optimizeStore
vi.mock("@/store/app/optimizeStore", () => ({
	useOptimizeStore: vi.fn(),
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
			<div data-testid="app-dialog" role="dialog">
				<h2>{titleKey}</h2>
				<div>{content}</div>
				<div>{footer}</div>
				<button onClick={onClose}>Close</button>
			</div>
		);
	},
}));

// Mock ErrorContent component
vi.mock("./ErrorContent", () => ({
	default: () => <div data-testid="error-content" />,
}));

describe("ErrorDialog", () => {
	const mockSetShowError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
			const state = {
				setShowError: mockSetShowError,
				status: { type: "idle" },
			};

			return selector ? selector(state) : state;
		});
	});

	test("should not render when status is not error", () => {
		const { container } = render(<ErrorDialog />);
		expect(container.firstChild).toBeNull();
	});

	test("should render when status is error", async () => {
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
			const state = {
				setShowError: mockSetShowError,
				status: { details: null, severity: "recoverable", type: "error" },
			};

			return selector ? selector(state) : state;
		});

		render(<ErrorDialog />);

		expect(await screen.findByTestId("app-dialog")).toBeInTheDocument();
		expect(await screen.findByTestId("error-content")).toBeInTheDocument();
	});

	test("should call setShowError(false) when dialog is closed", async () => {
		(useOptimizeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
			const state = {
				setShowError: mockSetShowError,
				status: { details: null, severity: "recoverable", type: "error" },
			};

			return selector ? selector(state) : state;
		});

		render(<ErrorDialog />);

		const closeButton = await screen.findByText("Close");
		closeButton.click();

		expect(mockSetShowError).toHaveBeenCalledWith(false);
	});
});
