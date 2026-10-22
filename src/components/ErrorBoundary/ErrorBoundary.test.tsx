/**
 * @file ErrorBoundary, RouteError, ErrorContent, and ErrorDisplay unit tests.
 */

import type { ErrorInfo, FC } from "react";
import { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useRouteError } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import * as analytics from "@/utils/analytics/tracking";
import { lifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";

import ErrorBoundary, { ErrorContent, ErrorDisplay, RouteError } from "./ErrorBoundary";

// Mock splash screen runtime
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

// Mock React Router hook
vi.mock("react-router-dom", () => ({
	useRouteError: vi.fn(),
}));

// Mock useBreakpoint hook
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

/**
 * Test component that throws an error.
 *
 * @example Test usage
 * ```tsx
 * <ThrowError shouldThrow={true} />
 * ```
 */
const ThrowError: FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
	if (shouldThrow) {
		throw new Error("Test error from child component");
	}

	return <div>Child rendered successfully</div>;
};

/**
 * Test component that renders safely.
 *
 * @example Test usage
 * ```tsx
 * <SafeComponent />
 * ```
 */
const SafeComponent: FC = () => <div>Safe component</div>;

describe("ErrorBoundary", () => {
	beforeEach(() => {
		// Suppress console errors during tests
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(analytics, "sendEvent").mockImplementation(async () => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("rendering", () => {
		it("should render children when no error occurs", () => {
			render(
				<ErrorBoundary>
					<SafeComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Safe component")).toBeInTheDocument();
		});

		it("should render ErrorPage when error is thrown", async () => {
			render(
				<Suspense fallback={null}>
					<ErrorBoundary>
						<ThrowError shouldThrow={true} />
					</ErrorBoundary>
				</Suspense>,
			);

			await waitFor(() =>
				expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument(),
			);
		});

		it("should not render children when error is caught", () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			);

			expect(screen.queryByText("Child rendered successfully")).not.toBeInTheDocument();
		});
	});

	describe("error handling", () => {
		it("should report error to analytics and call lifecycleCoordinator.markReady when error is caught", () => {
			const sendEventSpy = vi.spyOn(analytics, "sendEvent");
			const markReadySpy = vi.spyOn(lifecycleCoordinator, "markReady");

			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "Error",
					category: "error",
					label: "Test error from child component",
					nonInteraction: true,
				}),
			);
			expect(markReadySpy).toHaveBeenCalled();
		});

		it("should update state with error and errorInfo", async () => {
			render(
				<Suspense fallback={null}>
					<ErrorBoundary>
						<ThrowError shouldThrow={true} />
					</ErrorBoundary>
				</Suspense>,
			);

			await waitFor(() =>
				expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument(),
			);
		});

		it("should catch errors and set hasError to true", async () => {
			render(
				<Suspense fallback={null}>
					<ErrorBoundary>
						<ThrowError shouldThrow={true} />
					</ErrorBoundary>
				</Suspense>,
			);

			await waitFor(() =>
				expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument(),
			);
		});
	});

	describe("nested error boundaries", () => {
		it("should handle errors from nested components", async () => {
			render(
				<Suspense fallback={null}>
					<ErrorBoundary>
						<div>
							<SafeComponent />
							<ThrowError shouldThrow={true} />
						</div>
					</ErrorBoundary>
				</Suspense>,
			);

			await waitFor(() =>
				expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument(),
			);
		});
	});

	describe("getDerivedStateFromError", () => {
		it("should return correct state when error occurs", () => {
			const testError = new Error("Test error");
			const result = ErrorBoundary.getDerivedStateFromError(testError);

			expect(result).toEqual({
				error: testError,
				hasError: true,
			});
		});
	});

	describe("edge cases", () => {
		it("should handle multiple errors gracefully", async () => {
			const { rerender } = render(
				<Suspense fallback={null}>
					<ErrorBoundary>
						<ThrowError shouldThrow={true} />
					</ErrorBoundary>
				</Suspense>,
			);

			await waitFor(() =>
				expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument(),
			);

			rerender(
				<Suspense fallback={null}>
					<ErrorBoundary>
						<ThrowError shouldThrow={true} />
					</ErrorBoundary>
				</Suspense>,
			);

			await waitFor(() =>
				expect(
					screen.getByText((content) => content.includes("errorContent.defaultMessage")),
				).toBeInTheDocument(),
			);
		});

		it("should render children after boundary is reset", () => {
			const { rerender } = render(
				<ErrorBoundary>
					<SafeComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Safe component")).toBeInTheDocument();

			rerender(
				<ErrorBoundary>
					<SafeComponent />
				</ErrorBoundary>,
			);

			expect(screen.getByText("Safe component")).toBeInTheDocument();
		});
	});

	describe("error reporting telemetry", () => {
		let sendEventSpy: ReturnType<typeof vi.spyOn>;
		let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			sendEventSpy = vi.spyOn(analytics, "sendEvent").mockImplementation(async () => {});
			consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		});

		const triggerCatch = (error: Error, errorInfo: ErrorInfo = { componentStack: "" }) => {
			const boundary = new ErrorBoundary({ children: null });
			vi.spyOn(boundary, "setState").mockImplementation(() => {});
			boundary.componentDidCatch(error, errorInfo);
		};

		it("should include componentStack in analytics event", () => {
			const error = new Error("Test error");
			const errorInfo: ErrorInfo = {
				componentStack: "Component > ErrorBoundary > Parent",
			};

			triggerCatch(error, errorInfo);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					componentStack: expect.any(String),
				}),
			);
		});

		it("should include stack trace in analytics event", () => {
			const error = new Error("Test error");
			error.stack = "Error: Test error\n  at test.ts:10:15\n  at Object.<anonymous>";

			triggerCatch(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					stackTrace: expect.any(String),
				}),
			);
		});

		it("should handle missing componentStack", () => {
			const error = new Error("Test error");

			triggerCatch(error, {});

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					componentStack: "N/A",
				}),
			);
		});

		it("should handle missing stack trace", () => {
			const error = new Error("Test error");
			error.stack = undefined;

			triggerCatch(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					stackTrace: "N/A",
				}),
			);
		});

		it("should truncate componentStack to 100 characters", () => {
			const error = new Error("Test error");
			const longComponentStack =
				"Component > " + "ParentComponent > ".repeat(20) + "ErrorBoundary";
			const errorInfo: ErrorInfo = {
				componentStack: longComponentStack,
			};

			triggerCatch(error, errorInfo);

			const call = sendEventSpy.mock.calls[0][0];
			expect(call.componentStack).toHaveLength(100);
		});

		it("should truncate stack trace to 500 characters", () => {
			const error = new Error("Test error");
			error.stack = "a".repeat(600);

			triggerCatch(error);

			const call = sendEventSpy.mock.calls[0][0];
			expect(call.stackTrace).toHaveLength(500);
		});

		it("should replace newlines with spaces in error data", () => {
			const error = new Error("Test error\nwith newlines");
			error.stack = "Error:\n  at test.ts:10:15\n  at Object.<anonymous>";
			const errorInfo: ErrorInfo = {
				componentStack: "Component\n> ErrorBoundary",
			};

			triggerCatch(error, errorInfo);

			const call = sendEventSpy.mock.calls[0][0];
			expect(call.stackTrace).not.toContain("\n");
			expect(call.componentStack).not.toContain("\n");
		});

		it("should use error name as action and error message as label", () => {
			const error = new TypeError("Cannot read properties");

			triggerCatch(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "TypeError",
					label: "Cannot read properties",
				}),
			);
		});

		it("should handle errors without messages", () => {
			const error = new Error("");

			triggerCatch(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					label: "",
				}),
			);
		});

		it("should log the original error to console", () => {
			const error = new Error("Test error");
			const errorInfo: ErrorInfo = { componentStack: "Test" };

			triggerCatch(error, errorInfo);

			expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR] %s", "Uncaught error:", error, {
				errorInfo,
			});
		});
	});
});

describe("RouteError", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(analytics, "sendEvent").mockImplementation(async () => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should report error, signal lifecycleCoordinator.markReady, and render ErrorContent", () => {
		const testError = new Error("Route loading failed");
		vi.mocked(useRouteError).mockReturnValue(testError);

		const sendEventSpy = vi.spyOn(analytics, "sendEvent");
		const markReadySpy = vi.spyOn(lifecycleCoordinator, "markReady");

		render(<RouteError />);

		expect(sendEventSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				label: "Route loading failed",
			}),
		);
		expect(markReadySpy).toHaveBeenCalledTimes(1);
		expect(screen.getByText("Route loading failed")).toBeInTheDocument();
		expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument();
	});
});

describe("ErrorContent", () => {
	const mockError = new Error("Test error");
	const mockErrorInfo = { componentStack: "Test stack" };

	it("should toggle error-boundary-visible class on document.body during lifecycle", () => {
		const { unmount } = render(
			<ErrorContent
				error={mockError}
				errorInfo={mockErrorInfo}
				variant="page"
			/>,
		);

		expect(document.body.classList.contains("error-boundary-visible")).toBe(true);

		unmount();
		expect(document.body.classList.contains("error-boundary-visible")).toBe(false);
	});

	it("should render page variant correctly", () => {
		render(
			<ErrorContent
				error={mockError}
				errorInfo={mockErrorInfo}
				variant="page"
			/>,
		);

		expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		expect(
			screen.getByText((content) => content.includes("errorContent.defaultMessage")),
		).toBeInTheDocument();
	});

	it("should render inset variant correctly", () => {
		vi.mocked(useBreakpoint).mockReturnValue(false);
		render(
			<ErrorContent
				error={mockError}
				errorInfo={mockErrorInfo}
				variant="inset"
			/>,
		);

		expect(screen.getByText("errorContent.boundaryError")).toBeInTheDocument();
		expect(screen.getByText("Test error")).toBeInTheDocument();
		expect(
			screen.getByText((content) => content.includes("errorContent.insetMessage")),
		).toBeInTheDocument();
	});

	it("should render children if provided", () => {
		render(
			<ErrorContent
				error={mockError}
				errorInfo={mockErrorInfo}
				variant="page"
			>
				Custom Error Message
			</ErrorContent>,
		);

		expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
		expect(
			screen.queryByText((content) => content.includes("errorContent.defaultMessage")),
		).not.toBeInTheDocument();
	});

	it("should render large inset variant with scroll area", () => {
		vi.mocked(useBreakpoint).mockReturnValue(true);
		const { container } = render(
			<ErrorContent
				error={mockError}
				errorInfo={mockErrorInfo}
				variant="inset"
			/>,
		);

		expect(container.querySelector(".rt-ScrollAreaRoot")).toBeInTheDocument();
	});
});

describe("ErrorDisplay", () => {
	const mockError = new Error("Test error message");
	mockError.stack =
		"Error: Test error message\n  at Function.test (test.ts:10:15)\n  at Object.<anonymous>";

	const mockErrorInfo = {
		componentStack: "Component > Parent > ErrorBoundary",
	};

	describe("rendering", () => {
		it("should display error message", () => {
			render(
				<ErrorDisplay
					error={mockError}
					errorInfo={mockErrorInfo}
				/>,
			);

			expect(screen.getByText("Test error message")).toBeInTheDocument();
		});

		it("should handle undefined error", () => {
			const { container } = render(
				<ErrorDisplay
					error={undefined}
					errorInfo={mockErrorInfo}
				/>,
			);
			expect(container).toBeInTheDocument();
		});

		it("should handle undefined errorInfo", () => {
			render(
				<ErrorDisplay
					error={mockError}
					errorInfo={undefined}
				/>,
			);

			expect(screen.getByText("Test error message")).toBeInTheDocument();
		});

		it("should handle both undefined error and errorInfo", () => {
			const { container } = render(
				<ErrorDisplay
					error={undefined}
					errorInfo={undefined}
				/>,
			);
			expect(container).toBeInTheDocument();
		});
	});

	describe("error stack display", () => {
		it("should display stack trace when available", () => {
			render(
				<ErrorDisplay
					error={mockError}
					errorInfo={mockErrorInfo}
				/>,
			);

			expect(document.body.textContent).toContain("test.ts");
		});

		it("should handle error without stack trace", () => {
			const errorNoStack = new Error("No stack trace");
			errorNoStack.stack = undefined;

			expect(() => {
				render(
					<ErrorDisplay
						error={errorNoStack}
						errorInfo={mockErrorInfo}
					/>,
				);
			}).not.toThrow();
		});
	});

	describe("error info display", () => {
		it("should display component stack", () => {
			render(
				<ErrorDisplay
					error={mockError}
					errorInfo={mockErrorInfo}
				/>,
			);

			expect(document.body.textContent).toContain("Component > Parent > ErrorBoundary");
		});

		it("should handle long component stack", () => {
			const longComponentStack = "Component > ".repeat(20) + "ErrorBoundary";
			const longErrorInfo = { componentStack: longComponentStack };

			render(
				<ErrorDisplay
					error={mockError}
					errorInfo={longErrorInfo}
				/>,
			);

			expect(document.body.textContent).toContain("Component");
		});
	});

	describe("edge cases", () => {
		it("should handle error with empty message", () => {
			const errorEmptyMsg = new Error("");

			expect(() => {
				render(
					<ErrorDisplay
						error={errorEmptyMsg}
						errorInfo={mockErrorInfo}
					/>,
				);
			}).not.toThrow();
		});

		it("should handle very long error messages", () => {
			const longMessage = "Error message: " + "a".repeat(1000);
			const longError = new Error(longMessage);

			render(
				<ErrorDisplay
					error={longError}
					errorInfo={mockErrorInfo}
				/>,
			);

			expect(document.body.textContent).toContain("Error message:");
		});

		it("should handle special characters in error message", () => {
			const specialError = new Error("Error: <script>alert('xss')</script>");

			render(
				<ErrorDisplay
					error={specialError}
					errorInfo={mockErrorInfo}
				/>,
			);

			expect(document.body.textContent).toContain("Error: <script>alert('xss')</script>");
		});
	});
});
