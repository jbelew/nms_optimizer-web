import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

import { ErrorContent } from "./ErrorContent";

// Mock useBreakpoint hook
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

describe("ErrorContent", () => {
	const mockError = new Error("Test error");
	const mockErrorInfo = { componentStack: "Test stack" };

	it("should toggle error-boundary-visible class on document.body during lifecycle", () => {
		const { unmount } = render(
			<ErrorContent error={mockError} errorInfo={mockErrorInfo} variant="page" />
		);

		expect(document.body.classList.contains("error-boundary-visible")).toBe(true);

		unmount();
		expect(document.body.classList.contains("error-boundary-visible")).toBe(false);
	});

	it("should render page variant correctly", () => {
		render(<ErrorContent error={mockError} errorInfo={mockErrorInfo} variant="page" />);

		expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		// Check for default page message
		expect(
			screen.getByText((content) => content.includes("errorContent.defaultMessage"))
		).toBeInTheDocument();
	});

	it("should render inset variant correctly", () => {
		(useBreakpoint as Mock).mockReturnValue(false); // Mobile view
		render(<ErrorContent error={mockError} errorInfo={mockErrorInfo} variant="inset" />);

		expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		// Check for inset message
		expect(
			screen.getByText((content) => content.includes("errorContent.insetMessage"))
		).toBeInTheDocument();
	});

	it("should render children if provided", () => {
		render(
			<ErrorContent error={mockError} errorInfo={mockErrorInfo} variant="page">
				Custom Error Message
			</ErrorContent>
		);

		expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
		// Should not render default message
		expect(
			screen.queryByText((content) => content.includes("errorContent.defaultMessage"))
		).not.toBeInTheDocument();
	});

	it("should render large inset variant with scroll area", () => {
		(useBreakpoint as Mock).mockReturnValue(true); // Desktop view
		const { container } = render(
			<ErrorContent error={mockError} errorInfo={mockErrorInfo} variant="inset" />
		);

		// Check for scroll area container class or style
		expect(container.querySelector(".rt-ScrollAreaRoot")).toBeInTheDocument();
	});
});
