/**
 * @category Utilities
 *
 * @file Minimal mock implementation of Sentry SDK to satisfy build-time requirements
 * without bundling the full Sentry library when disabled.
 *
 */

import type {
	BrowserOptions,
	breadcrumbsIntegration as SentryBreadcrumbsIntegration,
	reactRouterV7BrowserTracingIntegration as SentryRouterTracingIntegration,
} from "@sentry/react";
import type { createBrowserRouter, RouteObject } from "react-router-dom";

/**
 * Type definition for Sentry Integration.
 * Matches the definition in monitoring.ts for consistency.
 */
type SentryIntegration =
	| ReturnType<typeof SentryBreadcrumbsIntegration>
	| ReturnType<typeof SentryRouterTracingIntegration>;

/**
 * Mock initialization.
 *
 * @param {BrowserOptions} _options - SDK configuration options.
 *
 * @returns {void}
 *
 * @example
 * ```ts
 * init({ dsn: "..." });
 * // returns void
 * ```
 */
export const init = (_options: BrowserOptions) => {};

/**
 * Mock exception capture.
 *
 * @param {unknown} _error - Exception to report.
 * @param {Record<string, unknown>} [_options] - Capture context.
 *
 * @returns {void}
 *
 * @example
 * ```ts
 * captureException(new Error());
 * // returns void
 * ```
 */
export const captureException = (_error: unknown, _options?: Record<string, unknown>) => {};

/**
 * Mock message capture.
 *
 * @param {string} _message - Message to report.
 * @param {Record<string, unknown>} [_options] - Capture context.
 *
 * @returns {void}
 *
 * @example
 * ```ts
 * captureMessage("test");
 * // returns void
 * ```
 */
export const captureMessage = (_message: string, _options?: Record<string, unknown>) => {};

/**
 * Mock breadcrumbs integration.
 *
 * @param {Parameters<typeof SentryBreadcrumbsIntegration>[0]} [_options] - Integration config.
 *
 * @returns {SentryIntegration} Mock integration.
 *
 * @example
 * ```ts
 * breadcrumbsIntegration();
 * // returns object
 * ```
 */
export const breadcrumbsIntegration = (
	_options?: Parameters<typeof SentryBreadcrumbsIntegration>[0]
): SentryIntegration => ({ name: "mock-breadcrumbs" }) as SentryIntegration;

/**
 * Mock browser tracing integration.
 *
 * @param {Parameters<typeof SentryRouterTracingIntegration>[0]} [_options] - Integration config.
 *
 * @returns {SentryIntegration} Mock integration.
 *
 * @example
 * ```ts
 * reactRouterV7BrowserTracingIntegration();
 * // returns object
 * ```
 */
export const reactRouterV7BrowserTracingIntegration = (
	_options?: Parameters<typeof SentryRouterTracingIntegration>[0]
): SentryIntegration => ({ name: "mock-tracing" }) as SentryIntegration;

/**
 * Mock router wrapper.
 *
 * @param {typeof createBrowserRouter} cb - The callback to wrap.
 *
 * @returns {(routes: RouteObject[]) => ReturnType<typeof createBrowserRouter>} Instrumented creator.
 *
 * @example
 * ```ts
 * wrapCreateBrowserRouterV7(createBrowserRouter);
 * // returns function
 * ```
 */
export const wrapCreateBrowserRouterV7 =
	(cb: typeof createBrowserRouter) => (routes: RouteObject[]) =>
		cb(routes);

/**
 * Mock user setting.
 * @returns {void}
 *
 * @example
 * ```ts
 * setUser();
 * // returns void
 * ```
 */
export const setUser = () => {};

/**
 * Mock tag setting.
 * @returns {void}
 *
 * @example
 * ```ts
 * setTag("a", "b");
 * // returns void
 * ```
 */
export const setTag = () => {};

/**
 * Mock extra context setting.
 * @returns {void}
 *
 * @example
 * ```ts
 * setExtra("a", "b");
 * // returns void
 * ```
 */
export const setExtra = () => {};

/**
 * Mock breadcrumb adding.
 * @returns {void}
 *
 * @example
 * ```ts
 * addBreadcrumb({ message: "test" });
 * // returns void
 * ```
 */
export const addBreadcrumb = () => {};
