/**
 * Headless application boot pipeline.
 *
 * @remarks
 * Encapsulates the end-to-end application startup sequence: pre-mount storage migrations,
 * telemetry initialization, scoped error trapping, React root mounting, and lifecycle transitions.
 *
 * @category Utilities
 */

import type { LifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";
import type { setupServiceWorkerRegistration } from "@/utils/system/setupServiceWorker";
import type { Root as ReactRoot } from "react-dom/client";
import React from "react";
import { createRoot } from "react-dom/client";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { Root } from "@/Root";
import { initializeAnalytics, initializeAnalyticsClient } from "@/utils/analytics/tracking";
import { preloadInitialState } from "@/utils/api/apiPreload";
import { performBootstrapMigrations } from "@/utils/system/bootstrap";
import { lifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";
import { initializeSentry, Logger } from "@/utils/system/monitoring";

/**
 * Configuration options for the application {@link bootApp} pipeline.
 */
export interface BootOptions {
	/**
	 * Lifecycle coordinator instance to govern application state.
	 * Defaults to the singleton {@link lifecycleCoordinator}.
	 */
	coordinator?: LifecycleCoordinator;
	/**
	 * Explicit toggle for Sentry initialization. Defaults to `import.meta.env.VITE_SENTRY_ENABLED === "true"`.
	 */
	enableSentry?: boolean;
	/**
	 * Custom handler invoked on fatal bootstrap or mount failure.
	 */
	onFatalError?: (error: unknown) => void;
	/**
	 * Optional custom root React node to render instead of the standard `<Root />`.
	 */
	rootComponent?: React.ReactNode;
	/**
	 * If true, skips registering default background capabilities (analytics, SW, API preload).
	 *
	 * @default false
	 */
	skipDeferredServices?: boolean;
	/**
	 * If true, skips attaching global `window.addEventListener("error")` and `"unhandledrejection"` interceptors.
	 *
	 * @default false
	 */
	skipGlobalErrorHandlers?: boolean;
	/**
	 * Target DOM container element into which the React root will be rendered.
	 * If omitted or null, defaults to `document.getElementById("root")`.
	 */
	target?: HTMLElement | null;
}

/**
 * Result object returned upon successful execution of {@link bootApp}.
 */
export interface BootResult {
	/**
	 * The lifecycle coordinator instance governing this application instance.
	 */
	coordinator: LifecycleCoordinator;
	/**
	 * The mounted React root instance created via `createRoot`.
	 */
	root: ReactRoot;
	/**
	 * Unmounts the React root and cleans up error listeners.
	 *
	 * @returns {void}
	 */
	unmount: () => void;
}

/**
 * Handles fatal application bootstrap and initialization failures.
 *
 * @remarks
 * If an error or unhandled promise rejection occurs during the initial application mount
 * or data loading sequence (before reaching the `READY` phase), this handler:
 * 1. Purges the splash screen components (`#vpss`, `#vpss-style`) to clean up the DOM.
 * 2. Redirects the browser to the static `/500.html` error recovery page, passing the error description.
 *
 * @param {unknown} error - The error or rejection reason captured during bootstrap.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link bootApp}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * handleFatalBootstrapError(new TypeError("Failed to initialize store"));
 * // redirects browser to /500.html?error_type=initialization_error&error_cause=...
 * ```
 */
export const handleFatalBootstrapError = (error: unknown): void => {
	if (typeof window !== "undefined") {
		try {
			hideSplashScreen();
		} catch (_e) {
			// ignore
		}

		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorUrl = `/500.html?error_type=initialization_error&error_cause=${encodeURIComponent(errorMessage)}`;
		window.location.replace(errorUrl);
	}
};

/**
 * Registers default background capabilities into the {@link LifecycleCoordinator} deferred task registry.
 *
 * @remarks
 * Registers three non-critical background services to run during browser idle cycles once the application
 * enters the `IDLE` phase:
 * 1. `api-preload`: Initial state preloading for platforms and tech tree (priority 10).
 * 2. `ga4-analytics`: GA4 analytics client and event tracker initialization (priority 5).
 * 3. `service-worker`: PWA service worker registration and update listeners (priority 0).
 *
 * @param {LifecycleCoordinator} coordinator - The lifecycle coordinator instance to register tasks on.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link preloadInitialState}
 * @see {@link initializeAnalyticsClient}
 * @see {@link initializeAnalytics}
 * @see {@link setupServiceWorkerRegistration}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * registerDefaultDeferredServices(lifecycleCoordinator);
 * ```
 */
export const registerDefaultDeferredServices = (coordinator: LifecycleCoordinator): void => {
	// 1. Initial API state preloading (priority 10)
	coordinator.registerDeferredTask({
		name: "api-preload",
		priority: 10,
		run: () => {
			preloadInitialState();
		},
	});

	// 2. GA4 analytics client and tracker initialization (priority 5)
	coordinator.registerDeferredTask({
		name: "ga4-analytics",
		priority: 5,
		run: async () => {
			initializeAnalyticsClient();
			await initializeAnalytics();
		},
	});

	// 3. PWA Service Worker setup (priority 0)
	coordinator.registerDeferredTask({
		name: "service-worker",
		priority: 0,
		run: async () => {
			const { setupServiceWorkerRegistration } =
				await import("@/utils/system/setupServiceWorker");
			setupServiceWorkerRegistration();
		},
	});
};

/**
 * Bootstraps the application through the headless boot pipeline.
 *
 * @remarks
 * Encapsulates the complete startup sequence:
 * 1. Executes pre-mount data and storage migrations via {@link performBootstrapMigrations}.
 * 2. Initializes Sentry error tracking if enabled.
 * 3. Attaches global error and unhandled rejection interceptors for early error trapping.
 * 4. Resolves the target DOM container and mounts the React root tree.
 * 5. Transitions the application lifecycle to `HYDRATED`.
 *
 * @param {BootOptions} [options={}] - Configuration options for the boot pipeline.
 *
 * @returns {Promise<BootResult>} The boot result containing the mounted root, coordinator, and cleanup function.
 *
 * @throws {Error} Throws if the target DOM root container cannot be found or if mounting fails.
 *
 * @see {@link LifecycleCoordinator}
 * @see {@link performBootstrapMigrations}
 * @see {@link handleFatalBootstrapError}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const { root, coordinator, unmount } = await bootApp({
 *   target: document.getElementById("root"),
 * });
 * // returns BootResult
 * ```
 */
export const bootApp = async (options: BootOptions = {}): Promise<BootResult> => {
	const coordinator = options.coordinator ?? lifecycleCoordinator;

	// Reset coordinator to BOOTING if it was in another state
	if (coordinator.getPhase() !== "BOOTING") {
		coordinator.reset();
	}

	const cleanupFns: Array<() => void> = [];

	const handleFatal = (error: unknown) => {
		Logger.error("Fatal bootstrap error:", error);
		coordinator.markFatal(error);

		if (options.onFatalError) {
			options.onFatalError(error);
		} else {
			handleFatalBootstrapError(error);
		}
	};

	try {
		// 1. Perform pre-mount data migrations and cleanups
		performBootstrapMigrations();

		// 2. Initialize Sentry synchronously as early as possible if enabled
		const isSentryEnabled =
			options.enableSentry ?? import.meta.env.VITE_SENTRY_ENABLED === "true";

		if (isSentryEnabled) {
			initializeSentry();
		}

		// 3. Attach early error interceptors unless skipped
		if (typeof window !== "undefined" && !options.skipGlobalErrorHandlers) {
			const errorHandler = (event: ErrorEvent) => {
				const errorMessage = event.error?.message || event.message || "";
				const errorName = event.error?.name || "";

				if (errorName === "SecurityError" && errorMessage.includes("cross-origin")) {
					event.preventDefault();

					return true;
				}

				if (errorMessage.includes("Importing a module script failed")) {
					event.preventDefault();
					Logger.warn(
						"Caught and suppressed module import failure (Safari flake):",
						{ errorMessage },
						true
					);

					return true;
				}

				if (errorMessage.includes("ResizeObserver loop")) {
					event.preventDefault();

					return true;
				}

				Logger.error("Uncaught initialization error:", event.error || event.message);

				if (!coordinator.isReady()) {
					const filename = event.filename || "";
					const isOurScript =
						!filename ||
						filename.startsWith(window.location.origin) ||
						filename.startsWith("/") ||
						filename.includes("/src/") ||
						filename.includes("/build/");

					if (isOurScript) {
						handleFatal(
							event.error ||
								new Error(errorMessage || "Uncaught initialization error")
						);
					}
				}
			};

			const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
				Logger.error("Unhandled promise rejection:", event.reason);

				if (!coordinator.isReady()) {
					const reason = event.reason;
					const stack = reason?.stack || "";
					const isOurScript =
						!stack ||
						stack.includes(window.location.origin) ||
						stack.includes("/src/") ||
						stack.includes("/build/");

					if (isOurScript) {
						handleFatal(
							reason || new Error("Unhandled promise rejection during bootstrap")
						);
					}
				}
			};

			window.addEventListener("error", errorHandler);
			window.addEventListener("unhandledrejection", unhandledRejectionHandler);

			cleanupFns.push(() => {
				window.removeEventListener("error", errorHandler);
				window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
			});
		}

		// 4. Resolve target DOM container
		let targetElement: HTMLElement | null = options.target ?? null;

		if (!targetElement && typeof document !== "undefined") {
			targetElement = document.getElementById("root");
		}

		if (!targetElement) {
			throw new Error("Target root element not found for application mount.");
		}

		// 5. Expose build date for E2E testing if enabled
		if (typeof window !== "undefined" && import.meta.env.VITE_E2E_TESTING) {
			(window as typeof window & { __BUILD_DATE__?: string }).__BUILD_DATE__ = __BUILD_DATE__;
		}

		// 6. Register deferred background services onto coordinator
		if (!options.skipDeferredServices) {
			registerDefaultDeferredServices(coordinator);
		}

		// 7. Mount React tree
		const root = createRoot(targetElement);
		const componentToRender = options.rootComponent ?? <Root />;
		root.render(componentToRender);

		// 8. Signal hydration
		coordinator.markHydrated();

		return {
			coordinator,
			root,
			unmount: () => {
				cleanupFns.forEach((fn) => {
					fn();
				});
				root.unmount();
			},
		};
	} catch (error) {
		handleFatal(error);
		throw error;
	}
};
