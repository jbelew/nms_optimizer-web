import { render, screen } from "@testing-library/react";
import { describe, expect, it, Mock, vi } from "vitest";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import { ErrorContent } from "./ErrorContent";

// Mock useBreakpoint hook
vi.mock("../../hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

// Mock splashScreen utility
vi.mock("../../utils/splashScreen", () => ({
	hideSplashScreenAndShowBackground: vi.fn(),
}));

describe("ErrorContent", () => {
	const mockError = new Error("Test error");
	const mockErrorInfo = { componentStack: "Test stack" };

	it("should call hideSplashScreenAndShowBackground on mount", () => {
		render(<ErrorContent variant="page" error={mockError} errorInfo={mockErrorInfo} />);

		expect(hideSplashScreenAndShowBackground).toHaveBeenCalledTimes(1);
	});

	it("should render page variant correctly", () => {
		render(<ErrorContent variant="page" error={mockError} errorInfo={mockErrorInfo} />);

		expect(screen.getByText("Boundary Error!")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		// Check for default page message
		expect(screen.getByText(/This page may be/)).toBeInTheDocument();
	});

	it("should render inset variant correctly", () => {
		(useBreakpoint as Mock).mockReturnValue(false); // Mobile view
		render(<ErrorContent variant="inset" error={mockError} errorInfo={mockErrorInfo} />);

		expect(screen.getByText("Boundary Error!")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		// Check for inset message
		expect(screen.getByText(/Try/)).toBeInTheDocument();
	});

	it("should render children if provided", () => {
		render(
			<ErrorContent variant="page" error={mockError} errorInfo={mockErrorInfo}>
				Custom Error Message
			</ErrorContent>
		);

		expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
		// Should not render default message
		expect(screen.queryByText(/This page may be/)).not.toBeInTheDocument();
	});

	it("should render large inset variant with scroll area", () => {
		(useBreakpoint as Mock).mockReturnValue(true); // Desktop view
		const { container } = render(
			<ErrorContent variant="inset" error={mockError} errorInfo={mockErrorInfo} />
		);

		// Check for scroll area container class or style
		expect(container.querySelector(".rt-ScrollAreaRoot")).toBeInTheDocument();
	});
});
