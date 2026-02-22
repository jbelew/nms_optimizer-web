import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";

import { env } from "./analytics";

/**
 * Initializes Sentry for error tracking and performance monitoring.
 * In development, it only logs to the console unless explicitly enabled.
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
		integrations: [
			Sentry.browserTracingIntegration(),
			Sentry.browserProfilingIntegration(),
			Sentry.reactRouterV6BrowserTracingIntegration({
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
		],
		environment: import.meta.env.VITE_SENTRY_ENV || "production",
		// Performance Monitoring
		tracesSampleRate: env.isDevMode() ? 1.0 : 0.2,
		// Profiling sample rate
		profilesSampleRate: env.isDevMode() ? 1.0 : 0.1,
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
