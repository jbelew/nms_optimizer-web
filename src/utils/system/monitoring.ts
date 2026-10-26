/**
 * System monitoring and logging utility module.
 *
 * @remarks
 * Provides centralized logging, breadcrumb tracking, and deferred error reporting via Sentry.
 * Maintains an in-memory circular buffer of recent log entries and queues early startup
 * exceptions until `@sentry/react` is dynamically initialized.
 *
 * @see {@link ./monitoring.test.ts Unit Tests}
 *
 * @category Utilities
 */

import type {
	Breadcrumb,
	BrowserOptions,
	breadcrumbsIntegration as SentryBreadcrumbsIntegration,
	browserApiErrorsIntegration as SentryBrowserApiErrorsIntegration,
	globalHandlersIntegration as SentryGlobalHandlersIntegration,
} from "@sentry/react";

import type { SentryIntegration } from "./sentryMock";

/**
 * Log levels for the application.
 *
 * @category Utilities
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
 * Represents a single log entry captured by the {@link Logger}.
 *
 * @category Utilities
 */
export interface LogEntry {
	/** Optional metadata associated with the log. */
	data?: Record<string, unknown>;
	/** The severity level of the log. */
	level: LogLevel;
	/** The log message. */
	message: string;
	/** Whether to skip attaching this log entry as a Sentry breadcrumb during replay. */
	skipSentry?: boolean;
	/** Unix timestamp when the log entry was created. */
	timestamp: number;
}

/**
 * Optional metadata and Sentry capture options accepted by {@link Logger.error}.
 *
 * @remarks
 * When `level` or `tags` are present on the `data` object passed to {@link Logger.error},
 * they are promoted to top-level Sentry capture options while remaining properties
 * are attached under `extra`.
 *
 * @see {@link Logger.error}
 *
 * @category Utilities
 */
export interface LoggerErrorData extends Record<string, unknown> {
	/** Optional Sentry severity level override (e.g., `"fatal"`, `"error"`). */
	level?: string;
	/** Optional Sentry key-value tags promoted to top-level capture options. */
	tags?: Record<string, unknown>;
}

/**
 * Queued error payload buffered when an error occurs before Sentry finishes initializing.
 */
interface PendingSentryEvent {
	/** Error instance or message string. */
	errorOrMessage: unknown;
	/** Whether to report via `captureException` or `captureMessage`. */
	kind: "exception" | "message";
	/** Capture options (`extra`, `level`, `tags`). */
	options?: Record<string, unknown>;
}

/**
 * Type definition for the Sentry SDK interface we interact with.
 * Maintains strict typing while supporting both the real SDK and test mocks.
 *
 * @private
 */
interface SentrySDK {
	/** Records a diagnostic breadcrumb on the active Sentry scope. */
	addBreadcrumb: (breadcrumb: Breadcrumb) => void;
	/** Automatic breadcrumb collection integration. */
	breadcrumbsIntegration: (
		options: Parameters<typeof SentryBreadcrumbsIntegration>[0],
	) => SentryIntegration;
	/** Browser timer/event listener wrapper integration configuration. */
	browserApiErrorsIntegration?: (
		options: Parameters<typeof SentryBrowserApiErrorsIntegration>[0],
	) => SentryIntegration;
	/** Captures an exception and sends it to Sentry. */
	captureException: (error: unknown, options?: Record<string, unknown>) => void;
	/** Captures a message and sends it to Sentry. */
	captureMessage: (message: string, options?: Record<string, unknown>) => void;
	/** Flushes pending Sentry events with an optional timeout in milliseconds. */
	flush?: (timeout?: number) => Promise<boolean>;
	/** Global `onerror` / `onunhandledrejection` integration configuration. */
	globalHandlersIntegration?: (
		options: Parameters<typeof SentryGlobalHandlersIntegration>[0],
	) => SentryIntegration;
	/** Initializes the Sentry SDK. */
	init: (options: BrowserOptions) => void;
}

const MAX_LOGS = 100;

/**
 * Shared regular expressions matching intentional `AbortController` / `AbortSignal` cancellations.
 *
 * @private
 */
const ABORT_ERROR_PATTERNS = [/\bAbortError\b/i, /signal is aborted/i] as const;

/**
 * Checks whether an error name or message represents an intentional `AbortController` / `AbortSignal` cancellation.
 *
 * @remarks
 * Shared between `bootApp`'s global `error` and `unhandledrejection` listeners and Sentry's
 * `ignoreErrors` filter so aborted `AbortSignal` reasons (such as `AbortError: signal is aborted without reason`)
 * are suppressed consistently.
 *
 * @param name - The `error.name` string if available.
 * @param message - The `error.message` or stringified rejection reason.
 *
 * @returns `true` if the error represents an `AbortError` cancellation.
 *
 * @see {@link initializeSentry}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * isAbortError("AbortError", "signal is aborted without reason");
 * // returns true
 * ```
 */
export const isAbortError = (name: string, message: string): boolean =>
	name === "AbortError" || ABORT_ERROR_PATTERNS.some((pattern) => pattern.test(message));

/**
 * Shared regular expressions matching browser-translation or extension DOM mutation errors.
 *
 * @private
 */
const DOM_MUTATION_ERROR_PATTERNS = [
	/Failed to execute 'removeChild' on 'Node'/i,
	/Failed to execute 'insertBefore' on 'Node'/i,
] as const;

/**
 * Checks whether an error name or message represents an external DOM mutation `NotFoundError`.
 *
 * @remarks
 * Browser page translators (Google Translate, Microsoft Edge Translate) and DOM-mutating extensions
 * wrap or replace text nodes inside React-managed containers, causing React's commit phase to throw
 * `NotFoundError: Failed to execute 'removeChild' on 'Node'` or `'insertBefore' on 'Node'`. Shared
 * between `bootApp`'s global listeners and Sentry's `ignoreErrors` filter so these non-actionable
 * external DOM errors are suppressed consistently.
 *
 * @param name - The `error.name` string if available.
 * @param message - The `error.message` or stringified rejection reason.
 *
 * @returns `true` if the error represents an external `removeChild` or `insertBefore` DOM mutation failure.
 *
 * @see {@link initializeSentry}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * isDomMutationError("NotFoundError", "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.");
 * // returns true
 * ```
 */
export const isDomMutationError = (name: string, message: string): boolean =>
	DOM_MUTATION_ERROR_PATTERNS.some((pattern) => pattern.test(message))
	|| (name === "NotFoundError" && /\b(removeChild|insertBefore)\b/i.test(message));

/**
 * Internal reference to Sentry SDK if initialized.
 * Proxies calls to Sentry without requiring static imports that would bloat the initial bundle.
 *
 * @private
 */
let sentryInstance: null | SentrySDK = null;

/**
 * In-flight initialization promise to deduplicate concurrent `initializeSentry` calls.
 *
 * @private
 */
let sentryInitPromise: null | Promise<void> = null;

/** In-memory log buffer. */
let logs: LogEntry[] = [];

/** Buffer of early error events captured before `initializeSentry` completes. */
let pendingErrorQueue: PendingSentryEvent[] = [];

/**
 * Dispatches a Sentry event immediately if the SDK is initialized, or queues it in memory
 * and triggers on-demand initialization when Sentry is enabled in the build.
 *
 * @param event - The Sentry event descriptor to dispatch or queue.
 *
 * @returns Side-effects only.
 */
const dispatchOrQueueSentryEvent = (event: PendingSentryEvent): void => {
	if (sentryInstance) {
		if (event.kind === "exception") {
			sentryInstance.captureException(event.errorOrMessage, event.options);
		} else {
			sentryInstance.captureMessage(String(event.errorOrMessage), event.options);
		}

		return;
	}

	if (import.meta.env.VITE_SENTRY_ENABLED !== "true") {
		return;
	}

	pendingErrorQueue.push(event);

	if (pendingErrorQueue.length > MAX_LOGS) {
		pendingErrorQueue.shift();
	}

	if (!sentryInitPromise) {
		void initializeSentry();
	}
};

/**
 * Builds normalized Sentry capture options from `extra`, optional `level`, and optional `tags`.
 *
 * @param extra - Extra diagnostic metadata.
 * @param level - Optional Sentry severity level.
 * @param tags - Optional Sentry tags object.
 *
 * @returns Normalized capture options object.
 */
const buildSentryCaptureOptions = (
	extra: Record<string, unknown>,
	level?: string,
	tags?: Record<string, unknown>,
): Record<string, unknown> => {
	const options: Record<string, unknown> = { extra };

	if (typeof level === "string") {
		options.level = level;
	}

	if (tags && typeof tags === "object") {
		options.tags = tags;
	}

	return options;
};

/**
 * Centralized logger for the application.
 *
 * @remarks
 * Collects logs in a 100-entry circular memory buffer, attaches `INFO` and `WARN` entries
 * as Sentry breadcrumbs, and forwards `ERROR` entries to Sentry as captured exceptions.
 *
 * @see {@link LogEntry}
 * @see {@link LogLevel}
 * @see {@link initializeSentry}
 *
 * @category Utilities
 */
export const Logger = {
	/**
	 * Clears the in-memory log buffer and any queued early error events.
	 *
	 * @remarks
	 * Resets internal diagnostic state between sessions or unit tests.
	 *
	 * @returns Side-effects only.
	 *
	 * @example
	 * ```ts
	 * Logger.clearLogs();
	 * // returns void
	 * ```
	 */
	clearLogs() {
		logs = [];
		pendingErrorQueue = [];
	},

	/**
	 * Logs an error message and reports the exception to Sentry.
	 *
	 * @remarks
	 * Automatically handles both `Error` objects (`captureException`) and non-Error values (`captureMessage`).
	 * Optional `level` and `tags` fields inside `data` are promoted to top-level Sentry capture options
	 * so callers such as `ErrorBoundary` and `LifecycleCoordinator` do not need a separate `captureException` call.
	 *
	 * @param message - The error description. **Must not be empty.**
	 * @param [error] - The error object or exception caught.
	 * @param [data] - Additional metadata, optional `level`, and optional `tags` for the error report.
	 *
	 * @returns Side-effects only.
	 *
	 * @example
	 * ```ts
	 * Logger.error("Failed to fetch tech tree", error, { tags: { area: "api" } });
	 * // returns void
	 * ```
	 */
	error(message: string, error?: unknown, data?: LoggerErrorData) {
		this.log(LogLevel.ERROR, message, {
			...(typeof error === "object" && error !== null ? error : { error }),
			...data,
		} as Record<string, unknown>);
		console.error("[ERROR] %s", message, error, data);

		const { level, tags, ...extraData } = data ?? {};

		const isWrappedErrorObject =
			!(error instanceof Error)
			&& typeof error === "object"
			&& error !== null
			&& "error" in error
			&& (error as { error?: unknown }).error instanceof Error;

		const resolvedError =
			error instanceof Error ? error
			: isWrappedErrorObject ? (error as { error: Error }).error
			: undefined;

		const unwrappedExtra =
			isWrappedErrorObject ?
				Object.fromEntries(
					Object.entries(error as Record<string, unknown>).filter(
						([key]) => key !== "error",
					),
				)
			:	{};

		if (resolvedError) {
			dispatchOrQueueSentryEvent({
				errorOrMessage: resolvedError,
				kind: "exception",
				options: buildSentryCaptureOptions(
					{ message, ...unwrappedExtra, ...extraData },
					level,
					tags,
				),
			});
		} else {
			dispatchOrQueueSentryEvent({
				errorOrMessage: message,
				kind: "message",
				options: buildSentryCaptureOptions(
					{ error, ...extraData },
					typeof level === "string" ? level : "error",
					tags,
				),
			});
		}
	},

	/**
	 * Retrieves the current circular buffer of log entries.
	 *
	 * @remarks
	 * Returns a shallow copy so callers cannot mutate the internal buffer.
	 *
	 * @returns A copy of the current log entries in memory.
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
	 * Logs an informational message to the console, memory buffer, and Sentry breadcrumbs.
	 *
	 * @remarks
	 * Records execution flow milestones that provide context leading up to any subsequent error.
	 *
	 * @param message - The message to log. **Must not be empty.**
	 * @param [data] - Optional metadata to include.
	 *
	 * @returns Side-effects only.
	 *
	 * @example
	 * ```ts
	 * Logger.info("Application started", { version: "1.0.0" });
	 * // returns void
	 * ```
	 */
	info(message: string, data?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, data);
		// eslint-disable-next-line no-console
		console.info("[INFO] %s", message, data);

		if (sentryInstance?.addBreadcrumb) {
			sentryInstance.addBreadcrumb({
				category: "logger",
				data,
				level: "info",
				message,
			});
		}
	},

	/**
	 * Internal method to add a log entry to memory and maintain the buffer size.
	 *
	 * @param level - The log level.
	 * @param message - The log message.
	 * @param [data] - Optional metadata.
	 * @param [skipSentry] - Whether to omit this entry when replaying Sentry breadcrumbs.
	 *
	 * @returns Side-effects only.
	 *
	 * @example Internal log dispatch
	 * ```ts
	 * Logger.log(LogLevel.INFO, "test message");
	 * ```
	 *
	 * @private
	 */
	log(level: LogLevel, message: string, data?: Record<string, unknown>, skipSentry?: boolean) {
		const entry: LogEntry = {
			data,
			level,
			message,
			...(skipSentry ? { skipSentry } : {}),
			timestamp: Date.now(),
		};

		logs.push(entry);

		if (logs.length > MAX_LOGS) {
			logs.shift();
		}
	},

	/**
	 * Logs a warning message to the console, memory buffer, and Sentry breadcrumbs.
	 *
	 * @remarks
	 * Warnings attach diagnostic breadcrumbs rather than creating standalone Sentry issues.
	 *
	 * @param message - The warning message. **Must not be empty.**
	 * @param [data] - Optional metadata to include in the breadcrumb.
	 * @param [skipSentry=false] - If true, skips attaching a Sentry breadcrumb.
	 *
	 * @returns Side-effects only.
	 *
	 * @example
	 * ```ts
	 * Logger.warn("Deprecated API called", { api: "legacyFetch" });
	 * // returns void
	 * ```
	 */
	warn(message: string, data?: Record<string, unknown>, skipSentry = false) {
		this.log(LogLevel.WARN, message, data, skipSentry);
		console.warn("[WARN] %s", message, data);

		if (sentryInstance?.addBreadcrumb && !skipSentry) {
			sentryInstance.addBreadcrumb({
				category: "logger",
				data,
				level: "warning",
				message,
			});
		}
	},
};

/**
 * Initializes Sentry asynchronously for error tracking and breadcrumb collection.
 *
 * @remarks
 * Dynamically imports `@sentry/react` so the monitoring chunk stays out of the critical rendering path.
 * Disables Sentry's built-in `globalHandlersIntegration`, `browserApiErrorsIntegration`, and default
 * `BrowserApiErrors` / `Console` integrations because `bootApp` owns global `error` and
 * `unhandledrejection` listeners and `Logger` explicitly attaches log breadcrumbs. Once initialized,
 * replays buffered `INFO`/`WARN` log entries as breadcrumbs and flushes any early error events
 * queued prior to initialization.
 *
 * @returns Resolves when Sentry initialization and early-event flushing complete.
 *
 * @see {@link Logger}
 * @see {@link flushSentry}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await initializeSentry();
 * // returns Promise<void>
 * ```
 */
export const initializeSentry = async (): Promise<void> => {
	// Build-time feature flag to completely tree-shake Sentry out
	if (import.meta.env.VITE_SENTRY_ENABLED !== "true") {
		return;
	}

	const dsn = import.meta.env.VITE_SENTRY_DSN || "";

	if (!dsn || sentryInstance) {
		return;
	}

	if (sentryInitPromise) {
		return sentryInitPromise;
	}

	sentryInitPromise = (async () => {
		try {
			const {
				addBreadcrumb,
				breadcrumbsIntegration,
				browserApiErrorsIntegration,
				captureException: sentryCaptureException,
				captureMessage,
				flush,
				globalHandlersIntegration,
				init,
			} = await import("@sentry/react");

			if (typeof init !== "function") {
				return;
			}

			const integrations: SentryIntegration[] = [
				breadcrumbsIntegration({
					dom: false, // Good performance practice: disables expensive DOM click serialization
				}),
			];

			if (browserApiErrorsIntegration) {
				integrations.push(
					browserApiErrorsIntegration({
						eventTarget: false,
						requestAnimationFrame: false,
						setInterval: false,
						setTimeout: false,
						XMLHttpRequest: false,
					}),
				);
			}

			if (globalHandlersIntegration) {
				integrations.push(
					globalHandlersIntegration({
						onerror: false,
						onunhandledrejection: false,
					}),
				);
			}

			init({
				allowUrls: [/localhost/, /127\.0\.0\.1/, /nms-optimizer\.app/i],
				dsn,
				environment: (import.meta.env.VITE_SENTRY_ENV as string) || "production",
				ignoreErrors: [
					/runtime\.sendMessage\(\).*Tab not found/i,
					/Extension/i,
					/vendor/i,
					/^Network Error$/i,
					/^Failed to fetch$/i,
					/^Load failed$/i,
					/Request timeout after \d+ms/i,
					/Importing a module script failed/i,
					/Failed to fetch dynamically imported module/i,
					/error loading dynamically imported module/i,
					/Unable to preload CSS/i,
					/Stylesheet append timeout/i,
					...ABORT_ERROR_PATTERNS,
					...DOM_MUTATION_ERROR_PATTERNS,
					/Non-Error promise rejection captured/i,
					/QuotaExceededError/i,
				],
				integrations: (defaultIntegrations) => [
					...defaultIntegrations.filter(
						(integration) =>
							integration.name !== "BrowserApiErrors"
							&& integration.name !== "Console",
					),
					...integrations,
				],
				maxBreadcrumbs: 50,
				release: __APP_VERSION__,
			});

			sentryInstance = {
				addBreadcrumb,
				breadcrumbsIntegration,
				browserApiErrorsIntegration,
				captureException: sentryCaptureException,
				captureMessage,
				flush,
				globalHandlersIntegration,
				init,
			};

			// Replay early in-memory INFO/WARN logs as breadcrumbs (respecting skipSentry)
			if (sentryInstance.addBreadcrumb) {
				for (const entry of logs) {
					if (
						(entry.level === LogLevel.INFO || entry.level === LogLevel.WARN)
						&& !entry.skipSentry
					) {
						sentryInstance.addBreadcrumb({
							category: "logger",
							data: entry.data,
							level: entry.level === LogLevel.WARN ? "warning" : "info",
							message: entry.message,
							timestamp: entry.timestamp / 1000,
						});
					}
				}
			}

			// Flush any early errors captured before Sentry finished loading
			const queuedEvents = pendingErrorQueue;
			pendingErrorQueue = [];

			for (const event of queuedEvents) {
				dispatchOrQueueSentryEvent(event);
			}
		} catch (e) {
			console.error("Failed to initialize Sentry:", e);
		} finally {
			sentryInitPromise = null;
		}
	})();

	return sentryInitPromise;
};

/**
 * Wrapper for Sentry's `captureException` that is safe to use when Sentry is disabled or not yet initialized.
 *
 * @remarks
 * If Sentry is enabled in the build but has not yet initialized, queues the exception and triggers
 * on-demand Sentry initialization.
 *
 * @param error - The caught exception or error object.
 * @param [options] - Additional context for the error report.
 *
 * @returns Side-effects only.
 *
 * @see {@link Logger.error}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * captureException(new Error("Network failure"), { tags: { retry: true } });
 * // returns void
 * ```
 */
export const captureException = (error: unknown, options?: Record<string, unknown>) => {
	dispatchOrQueueSentryEvent({
		errorOrMessage: error,
		kind: "exception",
		options,
	});
};

/**
 * Flushes pending Sentry events before an imminent page unload or fatal redirect.
 *
 * @remarks
 * Awaits any in-flight `initializeSentry()` call before invoking `Sentry.flush(timeoutMs)`
 * with a bounded timeout so fatal recovery redirects are never blocked indefinitely.
 *
 * @param [timeoutMs=1500] - Maximum time in milliseconds to wait for Sentry to drain its queue.
 *
 * @returns Resolves to `true` if flushed cleanly, or `false` if Sentry is inactive or timed out.
 *
 * @see {@link initializeSentry}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await flushSentry(1500);
 * // returns Promise<boolean>
 * ```
 */
export const flushSentry = async (timeoutMs = 1500): Promise<boolean> => {
	try {
		if (sentryInitPromise) {
			await sentryInitPromise;
		}

		if (sentryInstance?.flush) {
			return await sentryInstance.flush(timeoutMs);
		}
	} catch {
		// Never block fatal recovery on telemetry errors
	}

	return false;
};

/**
 * Internal test helper to inject a Sentry mock.
 *
 * @remarks
 * Resets internal initialization promises and pending error queues so unit tests
 * can deterministically inspect SDK interactions.
 *
 * @param instance - The mock object to use as Sentry SDK.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
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
	sentryInitPromise = null;
	pendingErrorQueue = [];
};
