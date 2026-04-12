/**
 * Sentry error tracking and performance monitoring configuration.
 *
 * @remarks
 * This module initializes the Sentry SDK, integrating it with React Router
 * and configuring environment-based sampling rates.
 *
 * @see {@link initializeSentry}
 *
 * @category Utilities
 */

import * as Sentry from "@sentry/react";

import { env } from "./analytics";

/**
 * Initializes Sentry for error tracking and performance monitoring.
 *
 * @remarks
 * Configures Sentry with React Router integration and sets up sampling rates
 * based on the environment (DEV vs PROD). Initialization is skipped if
 * `VITE_SENTRY_DSN` is missing from the environment.
 *
 * @returns {void} Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * initializeSentry();
 * // returns void
 * ```
 */
export const initializeSentry = () => {
	// We can use a public DSN or a dummy one for now if the user hasn't provided one.
	// For this task, I'll use a placeholder or check if it's in env.
	const dsn = import.meta.env.VITE_SENTRY_DSN || "";

	if (!dsn && !env.isDevMode()) {
		console.warn("Sentry DSN not found. Sentry will not be initialized.");

		return;
	}

	Sentry.init({
		dsn,
		integrations: [Sentry.browserTracingIntegration()],
		environment: import.meta.env.VITE_SENTRY_ENV || "production",
		// Performance Monitoring
		tracesSampleRate: env.isDevMode() ? 1.0 : 0.5,

		// Set release if available
		release: __APP_VERSION__,
		enabled: !!dsn,
		ignoreErrors: ["Invalid call to runtime.sendMessage(). Tab not found."],
		beforeSend(event) {
			// Don't send events in dev mode unless explicitly enabled via DSN
			if (env.isDevMode() && !import.meta.env.VITE_SENTRY_DSN) {
				return null;
			}

			return event;
		},
	});
};
