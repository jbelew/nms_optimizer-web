import * as Sentry from "@sentry/react";

/**
 * Log levels for the application.
 * @enum {string}
 */
export enum LogLevel {
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
}

/**
 * Represents a single log entry.
 * @typedef {object} LogEntry
 * @property {LogLevel} level - The log level.
 * @property {string} message - The message to log.
 * @property {Record<string, unknown>} [data] - Optional data to include in the log.
 * @property {number} timestamp - The timestamp of the log entry.
 */
export interface LogEntry {
	level: LogLevel;
	message: string;
	data?: Record<string, unknown>;
	timestamp: number;
}

const MAX_LOGS = 100;

/**
 * A centralized logger for the application.
 * Collects logs in memory and optionally sends them to external services like Sentry.
 */
export class Logger {
	private static logs: LogEntry[] = [];

	/**
	 * Logs an info message.
	 * @param {string} message - The message to log.
	 * @param {Record<string, unknown>} [data] - Optional data to include in the log.
	 */
	public static info(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, data);
		console.log(`[INFO] ${message}`, data);
	}

	/**
	 * Logs a warning message and sends it to Sentry.
	 * @param {string} message - The message to log.
	 * @param {Record<string, unknown>} [data] - Optional data to include in the log.
	 */
	public static warn(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.WARN, message, data);
		console.warn(`[WARN] ${message}`, data);
		Sentry.captureMessage(message, { level: "warning", extra: data });
	}

	/**
	 * Logs an error message and sends it to Sentry.
	 * @param {string} message - The message to log.
	 * @param {unknown} [error] - The error object to log.
	 * @param {Record<string, unknown>} [data] - Optional data to include in the log.
	 */
	public static error(message: string, error?: unknown, data?: Record<string, unknown>) {
		this.log(LogLevel.ERROR, message, {
			...(typeof error === "object" && error !== null ? error : { error }),
			...data,
		} as Record<string, unknown>);
		console.error(`[ERROR] ${message}`, error);

		if (error instanceof Error) {
			Sentry.captureException(error, { extra: { message, ...data } });
		} else {
			Sentry.captureMessage(message, { level: "error", extra: { error, ...data } });
		}
	}

	/**
	 * Retrieves all logs collected in memory.
	 * @returns {LogEntry[]} An array of log entries.
	 */
	public static getLogs(): LogEntry[] {
		return [...this.logs];
	}

	/**
	 * Clears all logs from memory.
	 */
	public static clearLogs() {
		this.logs = [];
	}

	/**
	 * Adds a log entry to memory and maintains the maximum log limit.
	 * @param {LogLevel} level - The log level.
	 * @param {string} message - The message to log.
	 * @param {Record<string, unknown>} [data] - Optional data to include in the log.
	 * @private
	 */
	private static log(level: LogLevel, message: string, data?: Record<string, unknown>) {
		const entry: LogEntry = {
			level,
			message,
			data,
			timestamp: Date.now(),
		};

		this.logs.push(entry);

		if (this.logs.length > MAX_LOGS) {
			this.logs.shift();
		}
	}
}
