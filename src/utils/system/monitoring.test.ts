import type { MockInstance } from "vitest";
import * as reactRouter from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	__setSentryInstance,
	captureException,
	createAppRouter,
	initializeSentry,
	Logger,
	LogLevel,
} from "./monitoring";

// Mock Sentry-like object
const sentryMock = {
	breadcrumbsIntegration: vi.fn(),
	captureException: vi.fn(),
	captureMessage: vi.fn(),
	init: vi.fn(),
	reactRouterV7BrowserTracingIntegration: vi.fn(),
	wrapCreateBrowserRouterV7: vi.fn((cb) => cb),
};

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");

	return {
		...actual,
		createBrowserRouter: vi.fn((routes) => ({ mocked: true, routes })),
	};
});

describe("monitoring utilities", () => {
	describe("Logger", () => {
		let consoleWarnSpy: MockInstance;
		let consoleErrorSpy: MockInstance;

		beforeEach(() => {
			Logger.clearLogs();
			vi.spyOn(console, "log").mockImplementation(() => {});
			consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
			consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			vi.clearAllMocks();
			__setSentryInstance(sentryMock);
		});

		afterEach(() => {
			vi.restoreAllMocks();
			__setSentryInstance(null);
		});

		it("should log info messages to internal storage", () => {
			Logger.info("Test info message", { data: 123 });

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0]).toMatchObject({
				data: { data: 123 },
				level: LogLevel.INFO,
				message: "Test info message",
			});
		});

		it("should log warn messages to console, Sentry, and internal storage", () => {
			Logger.warn("Test warn message", { meta: "data" });

			expect(consoleWarnSpy).toHaveBeenCalledWith("[WARN] Test warn message", {
				meta: "data",
			});

			expect(sentryMock.captureMessage).toHaveBeenCalledWith("Test warn message", {
				extra: { meta: "data" },
				level: "warning",
			});

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0].level).toBe(LogLevel.WARN);
		});

		it("should log error messages to console, Sentry, and internal storage", () => {
			const error = new Error("Test error");
			Logger.error("Test error message", error, { extra: "context" });

			expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR] Test error message", error);

			expect(sentryMock.captureException).toHaveBeenCalledWith(error, {
				extra: { extra: "context", message: "Test error message" },
			});

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0].level).toBe(LogLevel.ERROR);
		});

		it("should handle non-Error objects in Logger.error", () => {
			Logger.error("String error", "oops");
			expect(sentryMock.captureMessage).toHaveBeenCalledWith("String error", {
				extra: { error: "oops" },
				level: "error",
			});
		});

		it("should respect max log size", () => {
			for (let i = 0; i < 110; i++) {
				Logger.info(`Message ${i}`);
			}

			const logs = Logger.getLogs();
			expect(logs.length).toBe(100);
			expect(logs[logs.length - 1].message).toBe("Message 109");
		});

		it("should clear logs", () => {
			Logger.info("test");
			expect(Logger.getLogs()).toHaveLength(1);
			Logger.clearLogs();
			expect(Logger.getLogs()).toHaveLength(0);
		});
	});

	describe("Sentry Wrappers", () => {
		beforeEach(() => {
			vi.clearAllMocks();
			__setSentryInstance(sentryMock);
		});

		it("captureException should proxy to Sentry if initialized", () => {
			const err = new Error("test");
			captureException(err, { tag: "val" });
			expect(sentryMock.captureException).toHaveBeenCalledWith(err, { tag: "val" });
		});

		it("createAppRouter should wrap router if Sentry enabled", () => {
			// Mock env
			vi.stubEnv("VITE_SENTRY_ENABLED", "true");

			const routes = [{ path: "/" }];
			createAppRouter(routes);

			expect(sentryMock.wrapCreateBrowserRouterV7).toHaveBeenCalled();
			expect(reactRouter.createBrowserRouter).toHaveBeenCalledWith(routes);

			vi.unstubAllEnvs();
		});

		it("createAppRouter should NOT wrap router if Sentry disabled", () => {
			vi.stubEnv("VITE_SENTRY_ENABLED", "false");

			const routes = [{ path: "/" }];
			createAppRouter(routes);

			expect(sentryMock.wrapCreateBrowserRouterV7).not.toHaveBeenCalled();
			expect(reactRouter.createBrowserRouter).toHaveBeenCalledWith(routes);

			vi.unstubAllEnvs();
		});
	});

	describe("initializeSentry", () => {
		it("should skip if disabled", async () => {
			vi.stubEnv("VITE_SENTRY_ENABLED", "false");
			await initializeSentry();
			expect(sentryMock.init).not.toHaveBeenCalled();
			vi.unstubAllEnvs();
		});
	});
});
