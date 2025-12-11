/**
 * @file errorHandler utility tests
 * @description Tests for error handling logic including localStorage cleanup,
 * service worker unregistration, and analytics event sending.
 */

import { ErrorInfo } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as analytics from "../../utils/analytics";
import { handleError } from "./errorHandler";

describe("errorHandler", () => {
	let sendEventSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// No need to spy on localStorage.clear since we mock it directly when needed

		// Spy on analytics.sendEvent
		sendEventSpy = vi.spyOn(analytics, "sendEvent").mockImplementation(async () => {});

		// Spy on console
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		// Mock navigator.serviceWorker
		const mockServiceWorker = {
			getRegistrations: vi.fn().mockResolvedValue([]),
		};
		Object.defineProperty(navigator, "serviceWorker", {
			value: mockServiceWorker,
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("localStorage handling", () => {
		it("should clear localStorage on error", () => {
			const error = new Error("Test error");

			handleError(error);

			// Verify console.log was called with the success message, proving clear() was called
			expect(consoleLogSpy).toHaveBeenCalledWith("ErrorBoundary: Cleared localStorage.");
		});

		it("should log success message when localStorage is cleared", () => {
			const error = new Error("Test error");

			handleError(error);

			expect(consoleLogSpy).toHaveBeenCalledWith("ErrorBoundary: Cleared localStorage.");
		});

		it("should handle localStorage.clear() failures gracefully", () => {
			// Mock localStorage directly
			const originalClear = localStorage.clear;
			localStorage.clear = vi.fn(() => {
				throw new Error("localStorage is disabled");
			});

			const error = new Error("Test error");

			// Should not throw
			expect(() => {
				handleError(error);
			}).not.toThrow();

			// Should have logged the error message about failed clear
			const errorCalls = consoleErrorSpy.mock.calls;
			const hasClearError = errorCalls.some(
				(call: unknown[]) =>
					typeof call[0] === "string" &&
					call[0].includes("ErrorBoundary: Failed to clear localStorage")
			);
			expect(hasClearError).toBe(true);

			// Restore
			localStorage.clear = originalClear;
		});
	});

	describe("analytics event sending", () => {
		it("should send error event to analytics", () => {
			const error = new Error("Test error");
			const errorInfo: ErrorInfo = {
				componentStack: "Component > ErrorBoundary",
			};

			handleError(error, errorInfo);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					category: "error",
					action: "Error",
					label: "Test error",
					nonInteraction: true,
				})
			);
		});

		it("should include componentStack in analytics event", () => {
			const error = new Error("Test error");
			const errorInfo: ErrorInfo = {
				componentStack: "Component > ErrorBoundary > Parent",
			};

			handleError(error, errorInfo);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					componentStack: expect.any(String),
				})
			);
		});

		it("should include stack trace in analytics event", () => {
			const error = new Error("Test error");
			error.stack = "Error: Test error\n  at test.ts:10:15\n  at Object.<anonymous>";

			handleError(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					stackTrace: expect.any(String),
				})
			);
		});

		it("should handle missing componentStack", () => {
			const error = new Error("Test error");

			handleError(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					componentStack: "N/A",
				})
			);
		});

		it("should handle missing stack trace", () => {
			const error = new Error("Test error");
			error.stack = undefined;

			handleError(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					stackTrace: "N/A",
				})
			);
		});

		it("should truncate componentStack to 100 characters", () => {
			const error = new Error("Test error");
			const longComponentStack =
				"Component > " + "ParentComponent > ".repeat(20) + "ErrorBoundary";
			const errorInfo: ErrorInfo = {
				componentStack: longComponentStack,
			};

			handleError(error, errorInfo);

			const call = sendEventSpy.mock.calls[0][0];
			expect(call.componentStack).toHaveLength(100);
		});

		it("should truncate stack trace to 500 characters", () => {
			const error = new Error("Test error");
			error.stack = "a".repeat(600); // 600 chars, will be truncated to 500

			handleError(error);

			const call = sendEventSpy.mock.calls[0][0];
			expect(call.stackTrace).toHaveLength(500);
		});

		it("should replace newlines with spaces in error data", () => {
			const error = new Error("Test error\nwith newlines");
			error.stack = "Error:\n  at test.ts:10:15\n  at Object.<anonymous>";
			const errorInfo: ErrorInfo = {
				componentStack: "Component\n> ErrorBoundary",
			};

			handleError(error, errorInfo);

			const call = sendEventSpy.mock.calls[0][0];
			expect(call.stackTrace).not.toContain("\n");
			expect(call.componentStack).not.toContain("\n");
		});
	});

	describe("service worker handling", () => {
		it("should attempt to unregister service workers", async () => {
			const mockRegistration = {
				unregister: vi.fn().mockResolvedValue(true),
			};

			vi.mocked(navigator.serviceWorker.getRegistrations).mockResolvedValue([
				mockRegistration,
			] as unknown as ServiceWorkerRegistration[]);

			const error = new Error("Test error");
			handleError(error);

			// Give async handler time to run
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockRegistration.unregister).toHaveBeenCalled();
		});

		it("should log service worker unregistration", async () => {
			const mockRegistration = {
				unregister: vi.fn().mockResolvedValue(true),
			};

			vi.mocked(navigator.serviceWorker.getRegistrations).mockResolvedValue([
				mockRegistration,
			] as unknown as ServiceWorkerRegistration[]);

			const error = new Error("Test error");
			handleError(error);

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(consoleLogSpy).toHaveBeenCalledWith(
				"ErrorBoundary: Unregistered service worker."
			);
		});

		it("should handle multiple service worker registrations", async () => {
			const mockReg1 = { unregister: vi.fn().mockResolvedValue(true) };
			const mockReg2 = { unregister: vi.fn().mockResolvedValue(true) };

			vi.mocked(navigator.serviceWorker.getRegistrations).mockResolvedValue([
				mockReg1,
				mockReg2,
			] as unknown as ServiceWorkerRegistration[]);

			const error = new Error("Test error");
			handleError(error);

			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockReg1.unregister).toHaveBeenCalled();
			expect(mockReg2.unregister).toHaveBeenCalled();
		});

		it("should handle missing serviceWorker gracefully", () => {
			// Redefine navigator to not have serviceWorker property
			Object.defineProperty(navigator, "serviceWorker", {
				value: undefined,
				writable: true,
				configurable: true,
			});

			const error = new Error("Test error");

			// Should not throw even with missing serviceWorker
			expect(() => {
				handleError(error);
			}).not.toThrow();

			// Should still log the error to console
			expect(consoleErrorSpy).toHaveBeenCalledWith("Uncaught error:", error, undefined);
		});
	});

	describe("error object properties", () => {
		it("should use error name as action", () => {
			const error = new TypeError("Cannot read properties");

			handleError(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "TypeError",
				})
			);
		});

		it("should use error message as label", () => {
			const error = new Error("Specific error message");

			handleError(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					label: "Specific error message",
				})
			);
		});

		it("should handle errors without messages", () => {
			const error = new Error("");

			handleError(error);

			expect(sendEventSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					label: "",
				})
			);
		});
	});

	describe("console logging", () => {
		it("should log the original error to console", () => {
			const error = new Error("Test error");
			const errorInfo: ErrorInfo = { componentStack: "Test" };

			handleError(error, errorInfo);

			expect(consoleErrorSpy).toHaveBeenCalledWith("Uncaught error:", error, errorInfo);
		});
	});
});
