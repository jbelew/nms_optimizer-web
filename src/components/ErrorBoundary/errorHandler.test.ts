/**
 * @file errorHandler utility tests
 * @description Tests for error handling logic including Sentry reporting
 * and analytics event sending.
 */

import type { ErrorInfo } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as analytics from "@/utils/analytics/tracking";

import { handleError } from "./errorHandler";

describe("errorHandler", () => {
	let sendEventSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// Spy on analytics.sendEvent
		sendEventSpy = vi.spyOn(analytics, "sendEvent").mockImplementation(async () => {});

		// Spy on console
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
					action: "Error",
					category: "error",
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
