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

import { useEffect } from "react";
import {
	breadcrumbsIntegration,
	init,
	reactRouterV7BrowserTracingIntegration,
} from "@sentry/react";
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from "react-router-dom";

/**
 * Initializes Sentry for error tracking and performance monitoring.
 *
 * @remarks
 * Configures Sentry with React Router v7 integration and sets up sampling rates
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
	const dsn = import.meta.env.VITE_SENTRY_DSN || "";

	if (!dsn) {
		return;
	}

	init({
		dsn,
		integrations: [
			reactRouterV7BrowserTracingIntegration({
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
			breadcrumbsIntegration({
				dom: false, // Good performance practice: disables expensive DOM click serialization
			}),
		],
		environment: import.meta.env.VITE_SENTRY_ENV || "production",
		// Objective: Increasing tracesSampleRate to 50% for improved performance visibility
		tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.25,
		maxBreadcrumbs: 50,
		release: __APP_VERSION__,
		allowUrls: [
			/localhost/,
			/127\.0\.0\.1/,
			/nms-optimizer\.app/i, // Restrict errors to your domain/local configs (ignores third-party browser extensions)
		],
		ignoreErrors: [
			// Chrome/Firefox Extension Noise
			/runtime\.sendMessage\(\).*Tab not found/i,
			/Extension/i,
			/vendor/i,

			// Generic Network/Browser Noise
			/^Network Error$/i,
			/^Failed to fetch$/i,
			/^Load failed$/i,
			/Importing a module script failed/i, // iOS Safari flake
			/Non-Error promise rejection captured/i,
		],
	});
};
