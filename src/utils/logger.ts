/**
 * Log levels for the application.
 */
export enum LogLevel {
	/** Informational messages for tracking execution flow. */
	INFO = "INFO",
	/** Warning messages for non-critical issues that should be investigated. */
	WARN = "WARN",
	/** Error messages for critical failures. */
	ERROR = "ERROR",
}

/**
 * Represents a single log entry captured by the `Logger`.
 */
export interface LogEntry {
	/** The severity level of the log. */
	level: LogLevel;
	/** The log message. */
	message: string;
	/** Optional metadata associated with the log. */
	data?: Record<string, unknown>;
	/** Unix timestamp when the log entry was created. */
	timestamp: number;
}

const MAX_LOGS = 100;

/**
 * A centralized logger for the application.
 *
 * Collects logs in memory and automatically forwards warnings and errors to Sentry.
 * Maintains a circular buffer of the last 100 log entries.
 */
export class Logger {
	private static logs: LogEntry[] = [];

	/**
	 * Logs an informational message to the console and memory.
	 *
	 * @param {string} message - The message to log. **Must not be empty.**
	 * @param {Record<string, unknown>} [data] - Optional metadata to include.
	 * @returns {void}
	 *
	 * @example
	 * Logger.info("Application started", { version: "1.0.0" });
	 */
	public static info(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, data);
		console.log(`[INFO] ${message}`, data);
	}

	/**
	 * Logs a warning message and sends it to Sentry.
	 *
	 * @param {string} message - The warning message. **Must not be empty.**
	 * @param {Record<string, unknown>} [data] - Optional metadata to include in the Sentry report.
	 * @returns {void}
	 *
	 * @example
	 * Logger.warn("Deprecated API called", { api: "legacyFetch" });
	 */
	public static warn(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.WARN, message, data);
		console.warn(`[WARN] ${message}`, data);
		import("@sentry/react")
			.then(({ captureMessage }) => {
				captureMessage(message, { level: "warning", extra: data });
			})
			.catch(() => {});
	}

	/**
	 * Logs an error message and sends it to Sentry.
	 *
	 * Automatically handles both `Error` objects and generic error messages.
	 *
	 * @param {string} message - The error description. **Must not be empty.**
	 * @param {unknown} [error] - The error object or exception caught.
	 * @param {Record<string, unknown>} [data] - Additional context for the error report.
	 * @returns {void}
	 *
	 * @example
	 * Logger.error("Failed to fetch user", error, { userId: 123 });
	 */
	public static error(message: string, error?: unknown, data?: Record<string, unknown>) {
		this.log(LogLevel.ERROR, message, {
			...(typeof error === "object" && error !== null ? error : { error }),
			...data,
		} as Record<string, unknown>);
		console.error(`[ERROR] ${message}`, error);

		import("@sentry/react")
			.then(({ captureException, captureMessage }) => {
				if (error instanceof Error) {
					captureException(error, { extra: { message, ...data } });
				} else {
					captureMessage(message, { level: "error", extra: { error, ...data } });
				}
			})
			.catch(() => {});
	}

	/**
	 * Retrieves the current circular buffer of log entries.
	 *
	 * @returns {LogEntry[]} A copy of the current log entries in memory.
	 *
	 * @example
	 * const history = Logger.getLogs();
	 */
	public static getLogs(): LogEntry[] {
		return [...this.logs];
	}

	/**
	 * Clears the in-memory log buffer.
	 *
	 * @returns {void}
	 *
	 * @example
	 * Logger.clearLogs();
	 */
	public static clearLogs() {
		this.logs = [];
	}

	/**
	 * Internal method to add a log entry to memory and maintain the buffer size.
	 *
	 * @param {LogLevel} level - The log level.
	 * @param {string} message - The log message.
	 * @param {Record<string, unknown>} [data] - Optional metadata.
	 * @private
	 * @example
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
