/**
 * Minimal mock implementation of the Sentry SDK.
 *
 * @remarks
 * Satisfies build-time imports without bundling the full `@sentry/react` library
 * when `VITE_SENTRY_ENABLED` is disabled.
 *
 * @see {@link SentryIntegration}
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

/**
 * Type definition for Sentry Integration.
 *
 * @remarks
 * Extracted from existing integration functions to avoid using `any` or `@sentry/core` directly.
 *
 * @category Utilities
 */
export type SentryIntegration =
	| ReturnType<typeof SentryBreadcrumbsIntegration>
	| ReturnType<typeof SentryBrowserApiErrorsIntegration>
	| ReturnType<typeof SentryGlobalHandlersIntegration>;

/**
 * Mock breadcrumb adding.
 *
 * @remarks
 * No-op placeholder used when `@sentry/react` is aliased out of the bundle.
 *
 * @param [_breadcrumb] - Breadcrumb payload.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * addBreadcrumb({ message: "test" });
 * // returns void
 * ```
 */
export const addBreadcrumb = (_breadcrumb?: Breadcrumb) => {};

/**
 * Mock breadcrumbs integration.
 *
 * @remarks
 * Returns a stub integration descriptor without registering browser listeners.
 *
 * @param [_options] - Integration config.
 *
 * @returns Mock integration.
 *
 * @see {@link SentryIntegration}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * breadcrumbsIntegration();
 * // returns { name: "mock-breadcrumbs" }
 * ```
 */
export const breadcrumbsIntegration = (
	_options?: Parameters<typeof SentryBreadcrumbsIntegration>[0],
): SentryIntegration => ({ name: "mock-breadcrumbs" }) as SentryIntegration;

/**
 * Mock browser API errors integration.
 *
 * @remarks
 * Returns a stub integration descriptor for `browserApiErrorsIntegration`.
 *
 * @param [_options] - Integration config.
 *
 * @returns Mock integration.
 *
 * @see {@link SentryIntegration}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * browserApiErrorsIntegration({ setTimeout: false });
 * // returns { name: "mock-browser-api-errors" }
 * ```
 */
export const browserApiErrorsIntegration = (
	_options?: Parameters<typeof SentryBrowserApiErrorsIntegration>[0],
): SentryIntegration => ({ name: "mock-browser-api-errors" }) as SentryIntegration;

/**
 * Mock exception capture.
 *
 * @remarks
 * No-op placeholder for exception reporting when Sentry is disabled.
 *
 * @param _error - Exception to report.
 * @param [_options] - Capture context.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
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
 * @remarks
 * No-op placeholder for message reporting when Sentry is disabled.
 *
 * @param _message - Message to report.
 * @param [_options] - Capture context.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * captureMessage("test");
 * // returns void
 * ```
 */
export const captureMessage = (_message: string, _options?: Record<string, unknown>) => {};

/**
 * Mock client flush.
 *
 * @remarks
 * Immediately resolves to `true` when Sentry is disabled.
 *
 * @param [_timeout] - Maximum time in milliseconds to wait for pending events.
 *
 * @returns Resolves to `true`.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await flush(1500);
 * // returns true
 * ```
 */
export const flush = async (_timeout?: number): Promise<boolean> => true;

/**
 * Mock global handlers integration.
 *
 * @remarks
 * Returns a stub integration descriptor for `globalHandlersIntegration`.
 *
 * @param [_options] - Integration config.
 *
 * @returns Mock integration.
 *
 * @see {@link SentryIntegration}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * globalHandlersIntegration({ onerror: false, onunhandledrejection: false });
 * // returns { name: "mock-global-handlers" }
 * ```
 */
export const globalHandlersIntegration = (
	_options?: Parameters<typeof SentryGlobalHandlersIntegration>[0],
): SentryIntegration => ({ name: "mock-global-handlers" }) as SentryIntegration;

/**
 * Mock initialization.
 *
 * @remarks
 * No-op placeholder for `Sentry.init` when Sentry is disabled.
 *
 * @param _options - SDK configuration options.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * init({ dsn: "..." });
 * // returns void
 * ```
 */
export const init = (_options: BrowserOptions) => {};

/**
 * Mock extra context setting.
 *
 * @remarks
 * No-op placeholder for setting extra context when Sentry is disabled.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * setExtra();
 * // returns void
 * ```
 */
export const setExtra = () => {};

/**
 * Mock tag setting.
 *
 * @remarks
 * No-op placeholder for setting tags when Sentry is disabled.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * setTag();
 * // returns void
 * ```
 */
export const setTag = () => {};

/**
 * Mock user setting.
 *
 * @remarks
 * No-op placeholder for setting user context when Sentry is disabled.
 *
 * @returns Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * setUser();
 * // returns void
 * ```
 */
export const setUser = () => {};
