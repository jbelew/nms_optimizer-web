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
 * @param _options - SDK configuration options.
 *
 * @returns Side-effects only.
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
 * @param _error - Exception to report.
 * @param [_options] - Capture context.
 *
 * @returns Side-effects only.
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
 * @param _message - Message to report.
 * @param [_options] - Capture context.
 *
 * @returns Side-effects only.
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
 * @param [_options] - Integration config.
 *
 * @returns Mock integration.
 *
 * @example
 * ```ts
 * breadcrumbsIntegration();
 * // returns object
 * ```
 */
export const breadcrumbsIntegration = (
	_options?: Parameters<typeof SentryBreadcrumbsIntegration>[0],
): SentryIntegration => ({ name: "mock-breadcrumbs" }) as SentryIntegration;

/**
 * Mock browser tracing integration.
 *
 * @param [_options] - Integration config.
 *
 * @returns Mock integration.
 *
 * @example
 * ```ts
 * reactRouterV7BrowserTracingIntegration();
 * // returns object
 * ```
 */
export const reactRouterV7BrowserTracingIntegration = (
	_options?: Parameters<typeof SentryRouterTracingIntegration>[0],
): SentryIntegration => ({ name: "mock-tracing" }) as SentryIntegration;

/**
 * Mock router wrapper.
 *
 * @param cb - The callback to wrap.
 *
 * @returns Instrumented creator.
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
 * @returns Side-effects only.
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
 * @returns Side-effects only.
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
 * @returns Side-effects only.
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
 * @returns Side-effects only.
 *
 * @example
 * ```ts
 * addBreadcrumb({ message: "test" });
 * // returns void
 * ```
 */
export const addBreadcrumb = () => {};
