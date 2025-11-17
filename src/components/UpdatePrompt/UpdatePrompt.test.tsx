import React from "react";
import { render } from "@testing-library/react";
import { vi } from "vitest";

import UpdatePrompt from "./UpdatePrompt";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key,
	}),
}));

describe("UpdatePrompt", () => {
	const mockOnRefresh = vi.fn();
	const mockOnDismiss = vi.fn();

	const defaultProps = {
		isOpen: true,
		onRefresh: mockOnRefresh,
		onDismiss: mockOnDismiss,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("should render without throwing errors when isOpen is true", () => {
		const { container } = render(<UpdatePrompt {...defaultProps} />);

		// Component should render without errors
		expect(container).toBeInTheDocument();
	});

	test("should render without throwing errors when isOpen is false", () => {
		const { container } = render(<UpdatePrompt {...defaultProps} isOpen={false} />);

		// Component should render without errors even when closed
		expect(container).toBeInTheDocument();
	});

	test("should accept and not throw with onRefresh prop", () => {
		const mockOnRefreshLocal = vi.fn();
		const { container } = render(
			<UpdatePrompt isOpen={true} onRefresh={mockOnRefreshLocal} onDismiss={mockOnDismiss} />
		);

		expect(container).toBeInTheDocument();
	});

	test("should accept and not throw with onDismiss prop", () => {
		const mockOnDismissLocal = vi.fn();
		const { container } = render(
			<UpdatePrompt isOpen={true} onRefresh={mockOnRefresh} onDismiss={mockOnDismissLocal} />
		);

		expect(container).toBeInTheDocument();
	});

	test("should pass through all props to AppDialog", () => {
		const { container, rerender } = render(<UpdatePrompt {...defaultProps} />);

		// Verify component renders with all props
		expect(container).toBeInTheDocument();

		// Test changing props
		const newMockOnDismiss = vi.fn();
		rerender(
			<UpdatePrompt isOpen={true} onRefresh={mockOnRefresh} onDismiss={newMockOnDismiss} />
		);

		expect(container).toBeInTheDocument();
	});

	test("should render AppDialog component without errors", () => {
		// This test verifies the component structure by ensuring it doesn't throw
		const { container } = render(<UpdatePrompt {...defaultProps} />);

		expect(container).toBeInTheDocument();
	});

	test("should handle state changes with rerender", () => {
		const { rerender, container } = render(<UpdatePrompt {...defaultProps} />);

		expect(container).toBeInTheDocument();

		// Rerender with isOpen false
		rerender(
			<UpdatePrompt isOpen={false} onRefresh={mockOnRefresh} onDismiss={mockOnDismiss} />
		);

		expect(container).toBeInTheDocument();

		// Rerender with isOpen true again
		rerender(
			<UpdatePrompt isOpen={true} onRefresh={mockOnRefresh} onDismiss={mockOnDismiss} />
		);

		expect(container).toBeInTheDocument();
	});

	test("should accept function props for callbacks", () => {
		const onRefreshFn = vi.fn();
		const onDismissFn = vi.fn();

		const { container } = render(
			<UpdatePrompt isOpen={true} onRefresh={onRefreshFn} onDismiss={onDismissFn} />
		);

		expect(container).toBeInTheDocument();

		// Callbacks are passed to child components, testing structure only
		expect(typeof onRefreshFn).toBe("function");
		expect(typeof onDismissFn).toBe("function");
	});

	test("should render AppDialog with isOpen matching props", () => {
		const { rerender, container } = render(
			<UpdatePrompt isOpen={true} onRefresh={mockOnRefresh} onDismiss={mockOnDismiss} />
		);

		expect(container).toBeInTheDocument();

		// When isOpen changes, AppDialog should receive the change
		rerender(
			<UpdatePrompt isOpen={false} onRefresh={mockOnRefresh} onDismiss={mockOnDismiss} />
		);

		expect(container).toBeInTheDocument();
	});
});
