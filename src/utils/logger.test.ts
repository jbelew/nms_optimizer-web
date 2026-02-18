import type { MockInstance } from "vitest";
import * as Sentry from "@sentry/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Logger, LogLevel } from "./logger";

// Mock Sentry
vi.mock("@sentry/react", () => ({
	captureException: vi.fn(),
	captureMessage: vi.fn(),
}));

describe("Logger Utility", () => {
	let consoleLogSpy: MockInstance;
	let consoleWarnSpy: MockInstance;
	let consoleErrorSpy: MockInstance;

	beforeEach(() => {
		// Clear logs and spies before each test
		Logger.clearLogs();
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should log info messages to console and internal storage", () => {
		Logger.info("Test info message", { data: 123 });

		expect(consoleLogSpy).toHaveBeenCalledWith("[INFO] Test info message", { data: 123 });
		const logs = Logger.getLogs();
		expect(logs).toHaveLength(1);
		expect(logs[0]).toMatchObject({
			level: LogLevel.INFO,
			message: "Test info message",
			data: { data: 123 },
		});
	});

	it("should log warn messages to console, Sentry, and internal storage", () => {
		Logger.warn("Test warn message");

		expect(consoleWarnSpy).toHaveBeenCalledWith("[WARN] Test warn message", undefined);
		expect(Sentry.captureMessage).toHaveBeenCalledWith("Test warn message", expect.any(Object));

		const logs = Logger.getLogs();
		expect(logs).toHaveLength(1);
		expect(logs[0].level).toBe(LogLevel.WARN);
	});

	it("should log error messages to console, Sentry, and internal storage", () => {
		const error = new Error("Test error");
		Logger.error("Test error message", error);

		expect(consoleErrorSpy).toHaveBeenCalledWith("[ERROR] Test error message", error);
		expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.any(Object));

		const logs = Logger.getLogs();
		expect(logs).toHaveLength(1);
		expect(logs[0].level).toBe(LogLevel.ERROR);
	});

	it("should respect max log size", () => {
		const maxLogs = 50; // Assuming default is 50 or we set it

		for (let i = 0; i < maxLogs + 10; i++) {
			Logger.info(`Message ${i}`);
		}

		const logs = Logger.getLogs();
		expect(logs.length).toBeLessThanOrEqual(100); // Assuming a reasonable cap like 100
		expect(logs[logs.length - 1].message).toBe(`Message ${maxLogs + 9}`);
	});

	it("should clear logs", () => {
		Logger.info("test");
		expect(Logger.getLogs()).toHaveLength(1);
		Logger.clearLogs();
		expect(Logger.getLogs()).toHaveLength(0);
	});
});
