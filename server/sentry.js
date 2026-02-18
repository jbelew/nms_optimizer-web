import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Initializes Sentry for Node.js (Express server).
 */
export const initializeSentry = () => {
	const dsn = process.env.VITE_SENTRY_DSN || "";
	const environment = process.env.VITE_SENTRY_ENV || process.env.NODE_ENV || "production";

	if (!dsn && environment !== "development") {
		console.warn("Server-side Sentry DSN not found. Sentry will not be initialized.");

		return;
	}

	Sentry.init({
		dsn,
		integrations: [
			nodeProfilingIntegration(),
		],
		environment,
		// Performance Monitoring
		tracesSampleRate: environment === "development" ? 1.0 : 0.1,
		// Set release if available (Heroku might provide this)
		release: process.env.HEROKU_RELEASE_VERSION || process.env.npm_package_version,
		// Profiling sample rate is relative to tracesSampleRate
		profilesSampleRate: environment === "development" ? 1.0 : 0.1,
	});
};
