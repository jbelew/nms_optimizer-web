import { env } from "./analytics";

/**
 * Initializes Sentry for error tracking and performance monitoring.
 *
 * Configures Sentry with React Router integration and sets up sampling rates
 * based on the environment. Initialization is skipped if `VITE_SENTRY_DSN` is missing.
 *
 * @returns {void}
 *
 * @example
 * initializeSentry();
 */
export const initializeSentry = async () => {
	// We can use a public DSN or a dummy one for now if the user hasn't provided one.
	// For this task, I'll use a placeholder or check if it's in env.
	const dsn = import.meta.env.VITE_SENTRY_DSN || "";

	if (!dsn && !env.isDevMode()) {
		console.warn("Sentry DSN not found. Sentry will not be initialized.");

		return;
	}

	const Sentry = await import("@sentry/react");

	Sentry.init({
		dsn,
		integrations: [Sentry.browserTracingIntegration()],
		environment: import.meta.env.VITE_SENTRY_ENV || "production",
		// Performance Monitoring
		tracesSampleRate: env.isDevMode() ? 1.0 : 0.2,

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
