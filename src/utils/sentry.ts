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
				dom: false,
			}),
		],
		environment: import.meta.env.VITE_SENTRY_ENV || "production",
		tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.25,
		maxBreadcrumbs: 50,
		release: __APP_VERSION__,
		ignoreErrors: [/runtime\.sendMessage\(\).*Tab not found/i],
	});
};
