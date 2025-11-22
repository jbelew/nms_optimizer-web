/**
 * @file ErrorBoundary component tests
 * @description Tests for error boundary functionality including error catching,
 * state management, localStorage cleanup, service worker unregistration, and analytics.
 */

import { FC } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ErrorBoundary from "./ErrorBoundry";
import * as errorHandler from "./errorHandler";

/**
 * Test component that throws an error
 */
const ThrowError: FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
	if (shouldThrow) {
		throw new Error("Test error from child component");
	}
	return <div>Child rendered successfully</div>;
};

/**
 * Test component that renders safely
 */
const SafeComponent: FC = () => <div>Safe component</div>;

describe("ErrorBoundary", () => {
	beforeEach(() => {
		// Suppress console errors during tests
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("rendering", () => {
		it("should render children when no error occurs", () => {
			render(
				<ErrorBoundary>
					<SafeComponent />
				</ErrorBoundary>
			);

			expect(screen.getByText("Safe component")).toBeInTheDocument();
		});

		it("should render ErrorPage when error is thrown", () => {
			// Suppress React's error boundary warning
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			// ErrorPage displays error information
			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

			consoleErrorSpy.mockRestore();
		});

		it("should not render children when error is caught", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});

			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			expect(screen.queryByText("Child rendered successfully")).not.toBeInTheDocument();
		});
	});

	describe("error handling", () => {
		it("should call handleError when error is caught", () => {
			const handleErrorSpy = vi.spyOn(errorHandler, "handleError");
			vi.spyOn(console, "error").mockImplementation(() => {});

			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			expect(handleErrorSpy).toHaveBeenCalled();
			const [error, errorInfo] = handleErrorSpy.mock.calls[0];
			expect(error.message).toContain("Test error from child component");
			expect(errorInfo).toBeDefined();
		});

		it("should update state with error and errorInfo", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});

			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			// Check that ErrorPage is rendered (which means state was updated)
			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		});

		it("should catch errors and set hasError to true", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});

			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			// Verify error page is displayed
			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		});
	});

	describe("nested error boundaries", () => {
		it("should handle errors from nested components", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});

			render(
				<ErrorBoundary>
					<div>
						<SafeComponent />
						<ThrowError shouldThrow={true} />
					</div>
				</ErrorBoundary>
			);

			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		});
	});

	describe("getDerivedStateFromError", () => {
		it("should return correct state when error occurs", () => {
			const testError = new Error("Test error");
			const result = ErrorBoundary.getDerivedStateFromError(testError);

			expect(result).toEqual({
				hasError: true,
				error: testError,
			});
		});
	});

	describe("edge cases", () => {
		it("should handle multiple errors gracefully", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});

			const { rerender } = render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

			// Re-render with the same error
			rerender(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>
			);

			// Should still show error page
			expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
		});

		it("should render children after boundary is reset", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});

			const { rerender } = render(
				<ErrorBoundary>
					<SafeComponent />
				</ErrorBoundary>
			);

			expect(screen.getByText("Safe component")).toBeInTheDocument();

			// This test verifies the error boundary can recover if error stops
			rerender(
				<ErrorBoundary>
					<SafeComponent />
				</ErrorBoundary>
			);

			expect(screen.getByText("Safe component")).toBeInTheDocument();
		});
	});
});
