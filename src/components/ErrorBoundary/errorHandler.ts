/**
 * Global error handler and reporting module.
 *
 * @remarks
 * This module provides the `handleError` utility, which logs and reports
 * fatal application crashes to Sentry and Google Analytics.
 *
 * @see {@link handleError}
 * @see {@link ./errorHandler.test.ts Unit Tests}
 *
 * @category Utilities
 */

import { ErrorInfo } from "react";

import { sendEvent } from "../../utils/analytics/tracking";
import { captureException } from "../../utils/system/monitoring";

/**
 * Reports an uncaught application error to monitoring and analytics services.
 *
 * @remarks
 * This function performs the following actions:
 * 1. Logs the error to the console.
 * 2. Reports it to Sentry with component stack context.
 * 3. Sends a diagnostic event to Google Analytics via {@link sendEvent}.
 *
 * Recovery actions (clearing caches, storage, service workers) are intentionally
 * NOT performed here. Destructive cleanup should only happen via explicit user
 * action to avoid wiping local state on every React crash.
 *
 * @param {Error} error - The caught exception. **Must not be null.**
 * @param {ErrorInfo} [errorInfo] - The React component stack metadata.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link sendEvent}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * handleError(new Error("Fatal Crash"), { componentStack: "..." });
 * // returns void (side-effects only)
 * ```
 */
export const handleError = (error: Error, errorInfo?: ErrorInfo) => {
	console.error("Uncaught error:", error, errorInfo);

	captureException(error, {
		extra: {
			componentStack: errorInfo?.componentStack,
		},
	});

	sendEvent({
		action: error.name,
		category: "error",
		componentStack: errorInfo?.componentStack?.replace(/\n/g, " ").substring(0, 100) || "N/A",
		label: error.message,
		nonInteraction: true,
		stackTrace: error.stack?.replace(/\n/g, " ").substring(0, 500) || "N/A",
	});
};
