/**
 * @file ErrorDisplay component tests
 * @description Tests for error display UI component that shows error details and error info.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorDisplay } from "./ErrorDisplay";

describe("ErrorDisplay", () => {
	const mockError = new Error("Test error message");
	mockError.stack =
		"Error: Test error message\n  at Function.test (test.ts:10:15)\n  at Object.<anonymous>";

	const mockErrorInfo = {
		componentStack: "Component > Parent > ErrorBoundary",
	};

	describe("rendering", () => {
		it("should render error display container", () => {
			render(<ErrorDisplay error={mockError} errorInfo={mockErrorInfo} />);

			// Check for error display elements - look for the main h1 title
			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		});

		it("should display error message", () => {
			render(<ErrorDisplay error={mockError} errorInfo={mockErrorInfo} />);

			expect(screen.getByText("Test error message")).toBeInTheDocument();
		});

		it("should handle undefined error", () => {
			render(<ErrorDisplay error={undefined} errorInfo={mockErrorInfo} />);

			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		});

		it("should handle undefined errorInfo", () => {
			render(<ErrorDisplay error={mockError} errorInfo={undefined} />);

			expect(screen.getByText("Test error message")).toBeInTheDocument();
		});

		it("should handle both undefined error and errorInfo", () => {
			render(<ErrorDisplay error={undefined} errorInfo={undefined} />);

			expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		});
	});

	describe("error stack display", () => {
		it("should display stack trace when available", () => {
			render(<ErrorDisplay error={mockError} errorInfo={mockErrorInfo} />);

			// Stack traces should be visible in the document
			expect(document.body.textContent).toContain("test.ts");
		});

		it("should handle error without stack trace", () => {
			const errorNoStack = new Error("No stack trace");
			errorNoStack.stack = undefined;

			expect(() => {
				render(<ErrorDisplay error={errorNoStack} errorInfo={mockErrorInfo} />);
			}).not.toThrow();
		});
	});

	describe("error info display", () => {
		it("should display component stack", () => {
			render(<ErrorDisplay error={mockError} errorInfo={mockErrorInfo} />);

			expect(document.body.textContent).toContain("Component > Parent > ErrorBoundary");
		});

		it("should handle long component stack", () => {
			const longComponentStack = "Component > ".repeat(20) + "ErrorBoundary";
			const longErrorInfo = { componentStack: longComponentStack };

			render(<ErrorDisplay error={mockError} errorInfo={longErrorInfo} />);

			expect(document.body.textContent).toContain("Component");
		});
	});

	describe("accessibility", () => {
		it("should have accessible structure", () => {
			render(<ErrorDisplay error={mockError} errorInfo={mockErrorInfo} />);

			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("should handle error with empty message", () => {
			const errorEmptyMsg = new Error("");

			expect(() => {
				render(<ErrorDisplay error={errorEmptyMsg} errorInfo={mockErrorInfo} />);
			}).not.toThrow();
		});

		it("should handle very long error messages", () => {
			const longMessage = "Error message: " + "a".repeat(1000);
			const longError = new Error(longMessage);

			render(<ErrorDisplay error={longError} errorInfo={mockErrorInfo} />);

			expect(document.body.textContent).toContain("Error message:");
		});

		it("should handle special characters in error message", () => {
			const specialError = new Error("Error: <script>alert('xss')</script>");

			render(<ErrorDisplay error={specialError} errorInfo={mockErrorInfo} />);

			// Should be rendered as text, not HTML - check for the exact message
			expect(document.body.textContent).toContain("Error: <script>alert('xss')</script>");
		});
	});
});
