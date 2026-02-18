import * as Sentry from "@sentry/react";

export enum LogLevel {
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
}

export interface LogEntry {
	level: LogLevel;
	message: string;
	data?: Record<string, unknown>;
	timestamp: number;
}

const MAX_LOGS = 100;

export class Logger {
	private static logs: LogEntry[] = [];

	public static info(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, data);
		console.log(`[INFO] ${message}`, data);
	}

	public static warn(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.WARN, message, data);
		console.warn(`[WARN] ${message}`, data);
		Sentry.captureMessage(message, { level: "warning", extra: data });
	}

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

	public static getLogs(): LogEntry[] {
		return [...this.logs];
	}

	public static clearLogs() {
		this.logs = [];
	}

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
