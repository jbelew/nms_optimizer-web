/**
 * System monitoring and logging utility module.
 *
 * @remarks
 * This module provides centralized logging and error tracking services.
 * It integrates with Sentry for remote monitoring and maintains an in-memory
 * circular buffer of recent log entries.
 *
 * @category Utilities
 */

import type {
	BrowserOptions,
	breadcrumbsIntegration as SentryBreadcrumbsIntegration,
	reactRouterV7BrowserTracingIntegration as SentryRouterTracingIntegration,
} from "@sentry/react";
import type { RouteObject } from "react-router-dom";
import { useEffect } from "react";
import {
	createBrowserRouter,
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";

/**
 * Log levels for the application.
 */
export enum LogLevel {
	/** Error messages for critical failures. */
	ERROR = "ERROR",
	/** Informational messages for tracking execution flow. */
	INFO = "INFO",
	/** Warning messages for non-critical issues that should be investigated. */
	WARN = "WARN",
}

/**
 * Represents a single log entry captured by the `Logger`.
 */
export interface LogEntry {
	/** Optional metadata associated with the log. */
	data?: Record<string, unknown>;
	/** The severity level of the log. */
	level: LogLevel;
	/** The log message. */
	message: string;
	/** Unix timestamp when the log entry was created. */
	timestamp: number;
}

/**
 * Type definition for Sentry Integration.
 * Extracted from existing integration functions to avoid using 'any' or @sentry/core directly.
 */
type SentryIntegration =
	| ReturnType<typeof SentryBreadcrumbsIntegration>
	| ReturnType<typeof SentryRouterTracingIntegration>;

/**
 * Type definition for the Sentry SDK interface we interact with.
 * This allows us to maintain strict typing while supporting both the real SDK and mocks.
 *
 * @private
 */
interface SentrySDK {
	/** Automatic breadcrumb collection */
	breadcrumbsIntegration: (
		options: Parameters<typeof SentryBreadcrumbsIntegration>[0]
	) => SentryIntegration;
	/** Captures an exception and sends it to Sentry */
	captureException: (error: unknown, options?: Record<string, unknown>) => void;
	/** Captures a message and sends it to Sentry */
	captureMessage: (message: string, options?: Record<string, unknown>) => void;
	/** Initializes the Sentry SDK */
	init: (options: BrowserOptions) => void;
	/** Performance tracing integration for React Router v7 */
	reactRouterV7BrowserTracingIntegration: (
		options: Parameters<typeof SentryRouterTracingIntegration>[0]
	) => SentryIntegration;
	/** Instrumentation for React Router v7 */
	wrapCreateBrowserRouterV7: (
		cb: typeof createBrowserRouter
	) => (routes: RouteObject[]) => ReturnType<typeof createBrowserRouter>;
}

const MAX_LOGS = 100;

/**
 * Internal reference to Sentry SDK if initialized.
 * This is used to proxy calls to Sentry without requiring static imports
 * that would bloat the bundle even when Sentry is disabled.
 *
 * @private
 */
let sentryInstance: null | SentrySDK = null;

/** In-memory log buffer. */
let logs: LogEntry[] = [];

/**
 * A centralized logger for the application.
 *
 * @remarks
 * Collects logs in memory and automatically forwards warnings and errors to Sentry.
 * Maintains a circular buffer of the last 100 log entries.
 *
 * @category Utilities
 */
export const Logger = {
	/**
	 * Clears the in-memory log buffer.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * Logger.clearLogs();
	 * // returns void
	 * ```
	 */
	clearLogs() {
		logs = [];
	},

	/**
	 * Logs an error message and sends it to Sentry.
	 *
	 * Automatically handles both `Error` objects and generic error messages.
	 *
	 * @param {string} message - The error description. **Must not be empty.**
	 * @param {unknown} [error] - The error object or exception caught.
	 * @param {Record<string, unknown>} [data] - Additional context for the error report.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * Logger.error("Failed to fetch user", error, { userId: 123 });
	 * // returns void
	 * ```
	 */
	error(message: string, error?: unknown, data?: Record<string, unknown>) {
		this.log(LogLevel.ERROR, message, {
			...(typeof error === "object" && error !== null ? error : { error }),
			...data,
		} as Record<string, unknown>);
		console.error(`[ERROR] ${message}`, error, data);

		if (sentryInstance) {
			if (error instanceof Error) {
				sentryInstance.captureException(error, { extra: { message, ...data } });
			} else {
				sentryInstance.captureMessage(message, {
					extra: { error, ...data },
					level: "error",
				});
			}
		}
	},

	/**
	 * Retrieves the current circular buffer of log entries.
	 *
	 * @returns {LogEntry[]} A copy of the current log entries in memory.
	 *
	 * @example
	 * ```ts
	 * const history = Logger.getLogs();
	 * // returns LogEntry[]
	 * ```
	 */
	getLogs(): LogEntry[] {
		return [...logs];
	},

	/**
	 * Logs an informational message to the console and memory.
	 *
	 * @param {string} message - The message to log. **Must not be empty.**
	 * @param {Record<string, unknown>} [data] - Optional metadata to include.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * Logger.info("Application started", { version: "1.0.0" });
	 * // returns void
	 * ```
	 */
	info(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, data);
		console.info(`[INFO] ${message}`, data);
	},

	/**
	 * Internal method to add a log entry to memory and maintain the buffer size.
	 *
	 * @param {LogLevel} level - The log level.
	 * @param {string} message - The log message.
	 * @param {Record<string, unknown>} [data] - Optional metadata.
	 *
	 * @example Internal log dispatch
	 * ```ts
	 * Logger.log(LogLevel.INFO, \"test message\");
	 * ```
	 *
	 * @private
	 */
	log(level: LogLevel, message: string, data?: Record<string, unknown>) {
		const entry: LogEntry = {
			data,
			level,
			message,
			timestamp: Date.now(),
		};

		logs.push(entry);

		if (logs.length > MAX_LOGS) {
			logs.shift();
		}
	},

	/**
	 * Logs a warning message and sends it to Sentry.
	 *
	 * @param {string} message - The warning message. **Must not be empty.**
	 * @param {Record<string, unknown>} [data] - Optional metadata to include in the Sentry report.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * Logger.warn("Deprecated API called", { api: "legacyFetch" });
	 * // returns void
	 * ```
	 */
	warn(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.WARN, message, data);
		console.warn(`[WARN] ${message}`, data);

		if (sentryInstance) {
			sentryInstance.captureMessage(message, { extra: data, level: "warning" });
		}
	},
};

/**
 * Initializes Sentry for error tracking and performance monitoring.
 *
 * @remarks
 * Configures Sentry with React Router v7 integration and sets up sampling rates
 * based on the environment (DEV vs PROD). Initialization is skipped if
 * `VITE_SENTRY_ENABLED` is not \"true\" or `VITE_SENTRY_DSN` is missing.
 *
 * This function uses dynamic imports to ensure Sentry SDK is only bundled
 * and loaded if enabled via feature flag.
 *
 * @returns {Promise<void>} Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await initializeSentry();
 * // returns void
 * ```
 */
export const initializeSentry = async () => {
	// Build-time feature flag to completely tree-shake Sentry out
	if (import.meta.env.VITE_SENTRY_ENABLED !== "true") {
		return;
	}

	const dsn = import.meta.env.VITE_SENTRY_DSN || "";

	if (!dsn) {
		return;
	}

	try {
		// Dynamically import Sentry to avoid bundling it when disabled
		const Sentry = (await import("@sentry/react")) as unknown as SentrySDK;
		sentryInstance = Sentry;

		Sentry.init({
			allowUrls: [/localhost/, /127\\.0\\.0\\.1/, /nms-optimizer\\.app/i],
			dsn,
			environment: (import.meta.env.VITE_SENTRY_ENV as string) || "production",
			ignoreErrors: [
				/runtime\\.sendMessage\\(\\).*Tab not found/i,
				/Extension/i,
				/vendor/i,
				/^Network Error$/i,
				/^Failed to fetch$/i,
				/^Load failed$/i,
				/Importing a module script failed/i,
				/Non-Error promise rejection captured/i,
			],
			integrations: [
				Sentry.reactRouterV7BrowserTracingIntegration({
					createRoutesFromChildren,
					matchRoutes,
					useEffect,
					useLocation,
					useNavigationType,
				}),
				Sentry.breadcrumbsIntegration({
					dom: false, // Good performance practice: disables expensive DOM click serialization
				}),
			],
			maxBreadcrumbs: 50,
			release: __APP_VERSION__,
			tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.25,
		});
	} catch (e) {
		console.error("Failed to initialize Sentry:", e);
	}
};

/**
 * Wrapper for Sentry's `captureException` that is safe to use when Sentry is disabled.
 *
 * @param {unknown} error - The caught exception or error object.
 * @param {Record<string, unknown>} [options] - Additional context for the error report.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```ts
 * captureException(new Error("Network failure"), { tags: { retry: true } });
 * // returns void
 * ```
 */
export const captureException = (error: unknown, options?: Record<string, unknown>) => {
	if (sentryInstance) {
		sentryInstance.captureException(error, options);
	}
};

/**
 * Wrapper for createBrowserRouter that includes Sentry tracing if enabled.
 * Uses a dynamic check to avoid static Sentry imports in the main entry point.
 *
 * @param {RouteObject[]} routes - Array of route objects to initialize.
 *
 * @returns {ReturnType<typeof createBrowserRouter>} The instrumented or standard router.
 *
 * @example
 * ```ts
 * const router = createAppRouter([{ path: "/", element: <Home /> }]);
 * // returns Router
 * ```
 */
export const createAppRouter = (routes: RouteObject[]) => {
	// If Sentry is enabled and initialized, wrap the router creator
	if (import.meta.env.VITE_SENTRY_ENABLED === "true" && sentryInstance) {
		return sentryInstance.wrapCreateBrowserRouterV7(createBrowserRouter)(routes);
	}

	return createBrowserRouter(routes);
};

/**
 * Internal test helper to inject a Sentry mock.
 *
 * @param {SentrySDK | null} instance - The mock object to use as Sentry SDK.
 *
 * @returns {void} Side-effects only.
 *
 * @example
 * ```ts
 * __setSentryInstance(mockSDK as unknown as SentrySDK);
 * // returns void
 * ```
 *
 * @private
 */
export const __setSentryInstance = (instance: null | SentrySDK) => {
	sentryInstance = instance;
};
