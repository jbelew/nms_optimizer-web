/**
 * Headless application boot pipeline.
 *
 * @remarks
 * Encapsulates the end-to-end application startup sequence: pre-mount storage migrations,
 * telemetry initialization, scoped error trapping, React root mounting, and lifecycle transitions.
 *
 * @see {@link ./bootPipeline.test.tsx Unit Tests}
 *
 * @category Utilities
 */

import React from "react";
import type { Root as ReactRoot } from "react-dom/client";
import { createRoot } from "react-dom/client";

import type { LifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";
import type { setupServiceWorkerRegistration } from "@/utils/system/setupServiceWorker";
import { fetchTechTreeAsync } from "@/hooks/useTechTree/useTechTree";
import { Root } from "@/Root";
import { fetchPlatforms, resolveInitialPlatform } from "@/store/app/platformStore";
import { initializeAnalytics, initializeAnalyticsClient } from "@/utils/analytics/tracking";
import { performBootstrapMigrations } from "@/utils/system/bootstrap";
import {
	handleFatalBootstrapError,
	lifecycleCoordinator,
} from "@/utils/system/lifecycleCoordinator";
import { initializeSentry, Logger } from "@/utils/system/monitoring";

export { handleFatalBootstrapError };

/**
 * Initiates critical Platform Catalog and technology tree fetches early during idle bootstrap.
 *
 * @remarks
 * Populates the React Suspense caches for {@link fetchPlatforms} and {@link fetchTechTreeAsync}
 * using the heuristically resolved initial Platform Type.
 *
 * @returns Side-effects only.
 *
 * @see {@link fetchPlatforms}
 * @see {@link fetchTechTreeAsync}
 * @see {@link resolveInitialPlatform}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * preloadInitialState();
 * // initiates Platform Catalog and technology tree fetches into Suspense caches
 * ```
 */
export const preloadInitialState = (): void => {
	if (typeof window === "undefined") return;

	void fetchPlatforms();
	const guessedPlatform = resolveInitialPlatform();
	void fetchTechTreeAsync(guessedPlatform);
};

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
	 */
	unmount: () => void;
}

/**
 * Registers the deferred Sentry monitoring task on the lifecycle coordinator when enabled.
 *
 * @param coordinator - The lifecycle coordinator instance.
 * @param enableSentry - Whether Sentry monitoring is enabled.
 *
 * @returns Side-effects only.
 */
const registerSentryDeferredTask = (
	coordinator: LifecycleCoordinator,
	enableSentry: boolean,
): void => {
	if (!enableSentry) {
		return;
	}

	coordinator.registerDeferredTask({
		name: "sentry-monitoring",
		priority: 2,
		run: async () => {
			await initializeSentry();
		},
	});
};

/**
 * Registers default background capabilities into the {@link LifecycleCoordinator} deferred task registry.
 *
 * @remarks
 * Registers non-critical background services to run during browser idle cycles once the application
 * enters the `IDLE` phase:
 * 1. `api-preload`: Initial state preloading for platforms and tech tree (priority 10).
 * 2. `ga4-analytics`: GA4 analytics client and event tracker initialization (priority 5).
 * 3. `sentry-monitoring`: Deferred Sentry error monitoring initialization when enabled (priority 2).
 * 4. `service-worker`: PWA service worker registration and update listeners (priority 0).
 *
 * @param coordinator - The lifecycle coordinator instance to register tasks on.
 * @param [options] - Optional configuration for conditional deferred services.
 *
 * @returns Side-effects only.
 *
 * @see {@link preloadInitialState}
 * @see {@link initializeAnalyticsClient}
 * @see {@link initializeAnalytics}
 * @see {@link initializeSentry}
 * @see {@link setupServiceWorkerRegistration}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * registerDefaultDeferredServices(lifecycleCoordinator);
 * // returns void
 * ```
 */
export const registerDefaultDeferredServices = (
	coordinator: LifecycleCoordinator,
	options?: { enableSentry?: boolean },
): void => {
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

	// 3. Sentry error monitoring initialization (priority 2)
	const isSentryEnabled = options?.enableSentry ?? import.meta.env.VITE_SENTRY_ENABLED === "true";
	registerSentryDeferredTask(coordinator, isSentryEnabled);

	// 4. PWA Service Worker setup (priority 0)
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
 * 2. Attaches global `error` and `unhandledrejection` interceptors for early and runtime error trapping.
 * 3. Resolves the target DOM container and registers deferred `IDLE` services (including Sentry error monitoring).
 * 4. Mounts the React root tree and transitions the application lifecycle to `HYDRATED`.
 *
 * @param [options={}] - Configuration options for the boot pipeline.
 *
 * @returns The boot result containing the mounted root, coordinator, and cleanup function.
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

	if (options.onFatalError) {
		coordinator.setOnFatal(options.onFatalError);
	}

	const cleanupFns: Array<() => void> = [];

	const handleFatal = (error: unknown) => {
		if (coordinator.getPhase() !== "FATAL") {
			coordinator.markFatal(error);
		}
	};

	try {
		// 1. Perform pre-mount data migrations and cleanups
		performBootstrapMigrations();

		// 2. Attach early and runtime error interceptors unless skipped
		if (typeof window !== "undefined" && !options.skipGlobalErrorHandlers) {
			const errorHandler = (event: ErrorEvent) => {
				if (event.defaultPrevented) {
					return true;
				}

				const errorMessage = event.error?.message || event.message || "";
				const errorName = event.error?.name || "";

				if (errorName === "SecurityError" && errorMessage.includes("cross-origin")) {
					event.preventDefault();

					return true;
				}

				if (errorMessage.includes("ResizeObserver loop")) {
					event.preventDefault();

					return true;
				}

				const filename = event.filename || "";
				const isOurScript =
					!filename
					|| filename.startsWith(window.location.origin)
					|| filename.startsWith("/")
					|| filename.includes("/src/")
					|| filename.includes("/build/");

				if (!isOurScript) {
					return;
				}

				if (!coordinator.isReady()) {
					handleFatal(
						event.error || new Error(errorMessage || "Uncaught initialization error"),
					);

					return;
				}

				Logger.error("Uncaught runtime error:", event.error || event.message);
			};

			const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
				const reason = event.reason;
				const stack = reason?.stack || "";
				const isOurScript =
					!stack
					|| stack.includes(window.location.origin)
					|| stack.includes("/src/")
					|| stack.includes("/build/");

				if (!isOurScript) {
					return;
				}

				if (!coordinator.isReady()) {
					handleFatal(
						reason || new Error("Unhandled promise rejection during bootstrap"),
					);

					return;
				}

				Logger.error("Unhandled promise rejection:", reason);
			};

			window.addEventListener("error", errorHandler);
			window.addEventListener("unhandledrejection", unhandledRejectionHandler);

			cleanupFns.push(() => {
				window.removeEventListener("error", errorHandler);
				window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
			});
		}

		// 3. Resolve target DOM container
		let targetElement: HTMLElement | null = options.target ?? null;

		if (!targetElement && typeof document !== "undefined") {
			targetElement = document.getElementById("root");
		}

		if (!targetElement) {
			throw new Error("Target root element not found for application mount.");
		}

		// 4. Expose build date for E2E testing if enabled
		if (typeof window !== "undefined" && import.meta.env.VITE_E2E_TESTING) {
			(window as typeof window & { __BUILD_DATE__?: string }).__BUILD_DATE__ = __BUILD_DATE__;
		}

		// 5. Register deferred background services onto coordinator
		if (!options.skipDeferredServices) {
			registerDefaultDeferredServices(coordinator, {
				enableSentry: options.enableSentry,
			});
		} else {
			registerSentryDeferredTask(coordinator, Boolean(options.enableSentry));
		}

		// 6. Mount React tree
		const root = createRoot(targetElement);
		const componentToRender = options.rootComponent ?? <Root />;
		root.render(componentToRender);

		// 7. Signal hydration
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
