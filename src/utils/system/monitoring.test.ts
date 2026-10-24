import type { MockInstance } from "vitest";
import * as SentryReact from "@sentry/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	__setSentryInstance,
	captureException,
	flushSentry,
	initializeSentry,
	Logger,
	LogLevel,
} from "./monitoring";

vi.mock("@sentry/react", () => ({
	addBreadcrumb: vi.fn(),
	breadcrumbsIntegration: vi.fn(() => ({ name: "Breadcrumbs" })),
	browserApiErrorsIntegration: vi.fn(() => ({ name: "BrowserApiErrors" })),
	captureException: vi.fn(),
	captureMessage: vi.fn(),
	flush: vi.fn(async () => true),
	globalHandlersIntegration: vi.fn(() => ({ name: "GlobalHandlers" })),
	init: vi.fn(),
}));

// Mock Sentry-like object
const sentryMock = {
	addBreadcrumb: vi.fn(),
	breadcrumbsIntegration: vi.fn(),
	browserApiErrorsIntegration: vi.fn(),
	captureException: vi.fn(),
	captureMessage: vi.fn(),
	flush: vi.fn(async () => true),
	globalHandlersIntegration: vi.fn(),
	init: vi.fn(),
};

describe("monitoring utilities", () => {
	describe("Logger", () => {
		let consoleWarnSpy: MockInstance;
		let consoleErrorSpy: MockInstance;

		beforeEach(() => {
			Logger.clearLogs();
			vi.spyOn(console, "info").mockImplementation(() => {});
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

		it("should log info messages to internal storage and attach a Sentry breadcrumb", () => {
			Logger.info("Test info message", { data: 123 });

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0]).toMatchObject({
				data: { data: 123 },
				level: LogLevel.INFO,
				message: "Test info message",
			});
			expect(sentryMock.addBreadcrumb).toHaveBeenCalledWith({
				category: "logger",
				data: { data: 123 },
				level: "info",
				message: "Test info message",
			});
		});

		it("should log warn messages to console, internal storage, and Sentry breadcrumbs without creating standalone issues", () => {
			Logger.warn("Test warn message", { meta: "data" });

			expect(consoleWarnSpy).toHaveBeenCalledWith("[WARN] %s", "Test warn message", {
				meta: "data",
			});

			expect(sentryMock.captureMessage).not.toHaveBeenCalled();
			expect(sentryMock.addBreadcrumb).toHaveBeenCalledWith({
				category: "logger",
				data: { meta: "data" },
				level: "warning",
				message: "Test warn message",
			});

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0].level).toBe(LogLevel.WARN);
		});

		it("should log warn messages to console and internal storage but skip Sentry breadcrumb when skipSentry is true", () => {
			Logger.warn("Test skip warn message", { meta: "data" }, true);

			expect(consoleWarnSpy).toHaveBeenCalledWith("[WARN] %s", "Test skip warn message", {
				meta: "data",
			});

			expect(sentryMock.addBreadcrumb).not.toHaveBeenCalled();
			expect(sentryMock.captureMessage).not.toHaveBeenCalled();

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0].level).toBe(LogLevel.WARN);
		});

		it("should log error messages to console, Sentry, and internal storage", () => {
			const error = new Error("Test error");
			Logger.error("Test error message", error, { extra: "context" });

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"[ERROR] %s",
				"Test error message",
				error,
				{
					extra: "context",
				},
			);

			expect(sentryMock.captureException).toHaveBeenCalledWith(error, {
				extra: { extra: "context", message: "Test error message" },
			});

			const logs = Logger.getLogs();
			expect(logs).toHaveLength(1);
			expect(logs[0].level).toBe(LogLevel.ERROR);
		});

		it("should forward level and tags options in Logger.error to Sentry", () => {
			const error = new Error("Fatal crash");
			Logger.error("Fatal lifecycle error:", error, {
				level: "fatal",
				tags: { area: "lifecycle-coordinator" },
			});

			expect(sentryMock.captureException).toHaveBeenCalledWith(error, {
				extra: { message: "Fatal lifecycle error:" },
				level: "fatal",
				tags: { area: "lifecycle-coordinator" },
			});
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

	describe("Sentry Wrappers & Early Queue", () => {
		beforeEach(() => {
			Logger.clearLogs();
			vi.clearAllMocks();
			__setSentryInstance(sentryMock);
		});

		afterEach(() => {
			__setSentryInstance(null);
			vi.unstubAllEnvs();
		});

		it("captureException should proxy to Sentry if initialized", () => {
			const err = new Error("test");
			captureException(err, { tag: "val" });
			expect(sentryMock.captureException).toHaveBeenCalledWith(err, { tag: "val" });
		});

		it("flushSentry should flush active Sentry instance", async () => {
			const result = await flushSentry(1200);
			expect(result).toBe(true);
			expect(sentryMock.flush).toHaveBeenCalledWith(1200);
		});

		it("flushSentry should resolve false when Sentry is not initialized", async () => {
			__setSentryInstance(null);
			const result = await flushSentry(500);
			expect(result).toBe(false);
		});
	});

	describe("initializeSentry", () => {
		beforeEach(() => {
			Logger.clearLogs();
			vi.clearAllMocks();
			__setSentryInstance(null);
			vi.spyOn(console, "info").mockImplementation(() => {});
			vi.spyOn(console, "warn").mockImplementation(() => {});
			vi.spyOn(console, "error").mockImplementation(() => {});
		});

		afterEach(() => {
			__setSentryInstance(null);
			vi.restoreAllMocks();
			vi.unstubAllEnvs();
		});

		it("should skip if disabled", async () => {
			vi.stubEnv("VITE_SENTRY_ENABLED", "false");
			await initializeSentry();
			expect(sentryMock.init).not.toHaveBeenCalled();
		});

		it("should replay early logs as breadcrumbs and flush queued early errors on initialization", async () => {
			vi.stubEnv("VITE_SENTRY_ENABLED", "false");
			Logger.info("Early info breadcrumb", { step: 1 });
			Logger.warn("Early warn breadcrumb", { step: 2 });
			Logger.warn("Muted early warn breadcrumb", { step: 3 }, true);

			vi.stubEnv("VITE_SENTRY_ENABLED", "true");
			vi.stubEnv("VITE_SENTRY_DSN", "https://examplePublicKey@o0.ingest.sentry.io/0");

			const earlyError = new Error("Early bootstrap crash");
			Logger.error("Bootstrap error:", earlyError, {
				level: "fatal",
				tags: { area: "boot" },
			});

			await initializeSentry();

			expect(SentryReact.init).toHaveBeenCalledTimes(1);
			expect(SentryReact.globalHandlersIntegration).toHaveBeenCalledWith({
				onerror: false,
				onunhandledrejection: false,
			});
			expect(SentryReact.addBreadcrumb).toHaveBeenCalledWith(
				expect.objectContaining({
					category: "logger",
					data: { step: 1 },
					level: "info",
					message: "Early info breadcrumb",
				}),
			);
			expect(SentryReact.addBreadcrumb).toHaveBeenCalledWith(
				expect.objectContaining({
					category: "logger",
					data: { step: 2 },
					level: "warning",
					message: "Early warn breadcrumb",
				}),
			);
			expect(SentryReact.addBreadcrumb).not.toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Muted early warn breadcrumb",
				}),
			);
			expect(SentryReact.captureException).toHaveBeenCalledWith(earlyError, {
				extra: { message: "Bootstrap error:" },
				level: "fatal",
				tags: { area: "boot" },
			});
		});

		it("should configure ignoreErrors with Safari, Chromium, Firefox, and web clipper failure patterns and filter out BrowserApiErrors and Console default integrations", async () => {
			vi.stubEnv("VITE_SENTRY_ENABLED", "true");
			vi.stubEnv("VITE_SENTRY_DSN", "https://examplePublicKey@o0.ingest.sentry.io/0");

			await initializeSentry();

			expect(SentryReact.browserApiErrorsIntegration).toHaveBeenCalledWith({
				eventTarget: false,
				requestAnimationFrame: false,
				setInterval: false,
				setTimeout: false,
				XMLHttpRequest: false,
			});

			expect(SentryReact.init).toHaveBeenCalledWith(
				expect.objectContaining({
					ignoreErrors: expect.arrayContaining([
						/Importing a module script failed/i,
						/Failed to fetch dynamically imported module/i,
						/error loading dynamically imported module/i,
						/Unable to preload CSS/i,
						/Stylesheet append timeout/i,
					]),
					integrations: expect.any(Function),
				}),
			);

			const initOptions = vi.mocked(SentryReact.init).mock.calls[0]?.[0];

			if (typeof initOptions?.integrations !== "function") {
				throw new Error("Expected integrations option to be a function");
			}

			const resolvedIntegrations = initOptions.integrations([
				{ name: "InboundFilters" },
				{ name: "BrowserApiErrors" },
				{ name: "Console" },
				{ name: "Dedupe" },
			]);

			expect(resolvedIntegrations.map((i) => i.name)).toEqual([
				"InboundFilters",
				"Dedupe",
				"Breadcrumbs",
				"BrowserApiErrors",
				"GlobalHandlers",
			]);
		});
	});
});
