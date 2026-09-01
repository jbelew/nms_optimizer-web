/**
 * Application Lifecycle Coordinator state machine module.
 *
 * @remarks
 * Manages discrete application lifecycle phases (`BOOTING` -> `HYDRATED` -> `READY` -> `IDLE` -> `FATAL`).
 * Orchestrates splash screen dismissal, pre-rendered SSG fallback cleanup, and phase transitions.
 *
 * @category Utilities
 */

import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { UI_TIMING } from "@/constants";
import { runWhenIdle } from "@/utils/system/idle";
import { Logger } from "@/utils/system/monitoring";

/**
 * Discrete lifecycle phases of the application.
 *
 * @remarks
 * - `BOOTING`: Initial startup phase; storage migrations, early error handlers, and telemetry init.
 * - `HYDRATED`: The React tree has successfully mounted into the target DOM container.
 * - `READY`: The primary application view has mounted and signaled readiness; splash dismissal and SSG cleanup occur.
 * - `IDLE`: Browser idle cycles reached; deferred background services (analytics, service worker, warmup) execute.
 * - `FATAL`: A fatal initialization or mounting error occurred before reaching `READY`.
 */
export type AppLifecyclePhase = "BOOTING" | "FATAL" | "HYDRATED" | "IDLE" | "READY";

/**
 * Configuration options for initializing a {@link LifecycleCoordinator} instance.
 */
export interface LifecycleCoordinatorOptions {
	/**
	 * Whether to automatically schedule the transition to `IDLE` when reaching `READY`.
	 *
	 * @default true
	 */
	autoTransitionToIdle?: boolean;
	/**
	 * Timeout in milliseconds before transitioning to the `IDLE` phase after `READY`.
	 *
	 * @default UI_TIMING.IDLE_TIMEOUT_MS
	 */
	idleTimeoutMs?: number;
	/**
	 * Custom static pre-rendered SSG fallback cleanup handler.
	 * If omitted, defaults to querying and removing `.ssg-fallback` DOM nodes.
	 */
	onCleanupSsgFallback?: () => void;
	/**
	 * Custom splash screen dismissal handler.
	 * If omitted, defaults to calling `hideSplashScreen()` and adding the `background-visible` class.
	 */
	onDismissSplashScreen?: () => Promise<void> | void;
	/**
	 * Custom fatal error handler.
	 */
	onFatal?: (error: unknown) => void;
}

/**
 * Callback function signature for listening to application lifecycle phase changes.
 *
 * @param {AppLifecyclePhase} phase - The newly entered lifecycle phase.
 * @param {AppLifecyclePhase} prevPhase - The previous lifecycle phase.
 *
 * @returns {void}
 */
export type LifecycleListener = (phase: AppLifecyclePhase, prevPhase: AppLifecyclePhase) => void;

/**
 * State machine managing application startup, hydration, readiness, and background lifecycle phases.
 *
 * @remarks
 * The `LifecycleCoordinator` provides an explicit, testable, and observable alternative to untyped
 * global window flags and ad-hoc DOM event dispatching. When the application primary view mounts,
 * calling {@link LifecycleCoordinator.markReady} initiates the transition to `READY`, triggering splash screen fade-out,
 * DOM cleanup of pre-rendered static content, and subsequent scheduling of `IDLE` background tasks.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const coordinator = new LifecycleCoordinator();
 * coordinator.markHydrated();
 * coordinator.markReady();
 * // coordinator.getPhase() === "READY"
 * ```
 */
export class LifecycleCoordinator {
	private fatalError: unknown = null;
	private listeners = new Set<LifecycleListener>();
	private options: LifecycleCoordinatorOptions;
	private phase: AppLifecyclePhase = "BOOTING";
	private phaseOnceListeners = new Map<AppLifecyclePhase, Set<() => void>>();

	/**
	 * Creates a new {@link LifecycleCoordinator} instance.
	 *
	 * @param {LifecycleCoordinatorOptions} [options={}] - Optional lifecycle configuration.
	 */
	constructor(options: LifecycleCoordinatorOptions = {}) {
		this.options = options;
	}

	/**
	 * Retrieves the fatal error that caused the `FATAL` phase transition, if any.
	 *
	 * @returns {unknown} The captured error or null.
	 */
	public getFatalError(): unknown {
		return this.fatalError;
	}

	/**
	 * Retrieves the current lifecycle phase.
	 *
	 * @returns {AppLifecyclePhase} The current application lifecycle phase.
	 *
	 * @example
	 * ```ts
	 * const currentPhase = lifecycleCoordinator.getPhase();
	 * // returns "BOOTING" | "HYDRATED" | "READY" | "IDLE" | "FATAL"
	 * ```
	 */
	public getPhase(): AppLifecyclePhase {
		return this.phase;
	}

	/**
	 * Checks if the application is in a fatal boot error state.
	 *
	 * @returns {boolean} True if the phase is `FATAL`.
	 *
	 * @example
	 * ```ts
	 * if (lifecycleCoordinator.isFatal()) {
	 *   // Render recovery UI or inspect error
	 * }
	 * ```
	 */
	public isFatal(): boolean {
		return this.phase === "FATAL";
	}

	/**
	 * Checks if the application React tree has hydrated (`HYDRATED`, `READY`, or `IDLE`).
	 *
	 * @returns {boolean} True if mounted/hydrated, false otherwise.
	 *
	 * @example
	 * ```ts
	 * const mounted = lifecycleCoordinator.isHydrated();
	 * ```
	 */
	public isHydrated(): boolean {
		return this.phase === "HYDRATED" || this.phase === "READY" || this.phase === "IDLE";
	}

	/**
	 * Checks if the application has reached or passed the `READY` phase (`READY` or `IDLE`).
	 *
	 * @returns {boolean} True if ready or idle, false otherwise.
	 *
	 * @example
	 * ```ts
	 * if (lifecycleCoordinator.isReady()) {
	 *   // Application is fully interactive
	 * }
	 * ```
	 */
	public isReady(): boolean {
		return this.phase === "READY" || this.phase === "IDLE";
	}

	/**
	 * Transitions the coordinator to the `FATAL` phase and invokes fatal error handling.
	 *
	 * @param {unknown} error - The fatal error or rejection reason.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.markFatal(new Error("Failed to mount"));
	 * ```
	 */
	public markFatal(error: unknown): void {
		this.transitionTo("FATAL", error);
	}

	/**
	 * Signals that the React tree has mounted to the DOM, transitioning to `HYDRATED`.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.markHydrated();
	 * ```
	 */
	public markHydrated(): void {
		if (this.phase === "BOOTING") {
			this.transitionTo("HYDRATED");
		}
	}

	/**
	 * Signals that the primary application view has mounted and rendered, transitioning to `READY`.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.markReady();
	 * ```
	 */
	public markReady(): void {
		if (this.phase === "BOOTING" || this.phase === "HYDRATED") {
			this.transitionTo("READY");
		}
	}

	/**
	 * Registers a one-shot callback to be executed when the specified lifecycle phase is reached.
	 * If the coordinator is already in the target phase, the callback executes synchronously.
	 *
	 * @param {AppLifecyclePhase} targetPhase - The lifecycle phase to wait for.
	 * @param {() => void} callback - The function to execute once the phase is reached.
	 *
	 * @returns {() => void} Unsubscribe function to cancel the listener before it fires.
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.onPhase("READY", () => {
	 *   console.log("App reached READY phase");
	 * });
	 * ```
	 */
	public onPhase(targetPhase: AppLifecyclePhase, callback: () => void): () => void {
		if (this.phase === targetPhase) {
			callback();

			return () => {};
		}

		if (!this.phaseOnceListeners.has(targetPhase)) {
			this.phaseOnceListeners.set(targetPhase, new Set());
		}

		const set = this.phaseOnceListeners.get(targetPhase)!;
		set.add(callback);

		return () => {
			set.delete(callback);
		};
	}

	/**
	 * Resets the coordinator to its initial `BOOTING` state and clears all listeners.
	 * Useful for isolating test cases.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.reset();
	 * ```
	 */
	public reset(): void {
		this.phase = "BOOTING";
		this.fatalError = null;
		this.listeners.clear();
		this.phaseOnceListeners.clear();
	}

	/**
	 * Subscribes a listener callback to all lifecycle phase transitions.
	 *
	 * @param {LifecycleListener} listener - Callback invoked on phase transitions with `(newPhase, prevPhase)`.
	 *
	 * @returns {() => void} Unsubscribe function to remove the listener.
	 *
	 * @example
	 * ```ts
	 * const unsubscribe = lifecycleCoordinator.subscribe((newPhase, prevPhase) => {
	 *   console.log(`Phase changed from ${prevPhase} to ${newPhase}`);
	 * });
	 * ```
	 */
	public subscribe(listener: LifecycleListener): () => void {
		this.listeners.add(listener);

		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Transitions the state machine to a new lifecycle phase.
	 *
	 * @remarks
	 * Transitions are directional and ignore redundant transitions to the active phase.
	 * Once in `FATAL`, no further transitions are permitted.
	 *
	 * @param {AppLifecyclePhase} nextPhase - The destination phase.
	 * @param {unknown} [errorContext] - Optional error context if transitioning to `FATAL`.
	 *
	 * @returns {void} Side-effects only.
	 */
	public transitionTo(nextPhase: AppLifecyclePhase, errorContext?: unknown): void {
		if (this.phase === nextPhase) {
			return;
		}

		if (this.phase === "FATAL") {
			return;
		}

		const prevPhase = this.phase;
		this.phase = nextPhase;

		if (nextPhase === "FATAL") {
			this.fatalError = errorContext;
			this.handleFatal(errorContext);
		} else if (nextPhase === "READY") {
			this.handleReady();
		}

		// Notify global subscribers
		this.listeners.forEach((listener) => {
			try {
				listener(nextPhase, prevPhase);
			} catch (err) {
				Logger.error("Error in lifecycle listener:", err);
			}
		});

		// Trigger one-shot listeners registered for this phase
		const onceSet = this.phaseOnceListeners.get(nextPhase);

		if (onceSet && onceSet.size > 0) {
			const callbacks = Array.from(onceSet);
			this.phaseOnceListeners.delete(nextPhase);
			callbacks.forEach((cb) => {
				try {
					cb();
				} catch (err) {
					Logger.error("Error in onPhase callback:", err);
				}
			});
		}
	}

	/**
	 * Default implementation for removing pre-rendered SSG fallback elements from the DOM.
	 *
	 * @private
	 */
	private defaultCleanupSsgFallback(): void {
		if (typeof document === "undefined") {
			return;
		}

		const fallbacks = document.querySelectorAll(".ssg-fallback");
		fallbacks.forEach((el) => {
			el.remove();
		});
	}

	/**
	 * Default implementation for dismissing the splash screen.
	 *
	 * @private
	 */
	private defaultDismissSplashScreen(): void {
		if (typeof window === "undefined") {
			return;
		}

		try {
			hideSplashScreen();
		} catch (_e) {
			// ignore
		}

		if (typeof document !== "undefined") {
			document.documentElement.classList.add("background-visible");

			const removeVpssElements = () => {
				const vpss = document.getElementById("vpss");

				if (vpss) {
					vpss.remove();
				}

				const vpssStyle = document.getElementById("vpss-style");

				if (vpssStyle) {
					vpssStyle.remove();
				}
			};

			if (typeof requestAnimationFrame !== "undefined") {
				requestAnimationFrame(() => {
					setTimeout(removeVpssElements, 1000);
				});
			} else {
				setTimeout(removeVpssElements, 1000);
			}
		}
	}

	/**
	 * Executes fatal error handling.
	 *
	 * @private
	 */
	private handleFatal(error: unknown): void {
		if (this.options.onFatal) {
			this.options.onFatal(error);

			return;
		}

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
	}

	/**
	 * Executes side-effects for the `READY` phase transition:
	 * 1. Dismiss splash screen
	 * 2. Cleanup pre-rendered SSG fallback elements
	 * 3. Set global compatibility flag & dispatch `app-ready` event
	 * 4. Schedule transition to `IDLE`
	 *
	 * @private
	 */
	private handleReady(): void {
		// 1. Splash screen dismissal
		if (this.options.onDismissSplashScreen) {
			void this.options.onDismissSplashScreen();
		} else {
			this.defaultDismissSplashScreen();
		}

		// 2. SSG static fallback cleanup
		if (this.options.onCleanupSsgFallback) {
			this.options.onCleanupSsgFallback();
		} else {
			this.defaultCleanupSsgFallback();
		}

		// 3. Set global compatibility flag & dispatch legacy event
		if (typeof window !== "undefined") {
			(window as typeof window & { __APP_READY__?: boolean }).__APP_READY__ = true;

			try {
				sessionStorage.removeItem("__preload_recovery__");
			} catch (_e) {
				// ignore
			}

			window.dispatchEvent(new Event("app-ready"));
		}

		// 4. Schedule transition to IDLE
		if (this.options.autoTransitionToIdle !== false) {
			const idleTimeout = this.options.idleTimeoutMs ?? UI_TIMING.IDLE_TIMEOUT_MS;
			runWhenIdle(
				() => {
					if (this.phase === "READY") {
						this.transitionTo("IDLE");
					}
				},
				{ timeout: idleTimeout }
			);
		}
	}
}

/**
 * Global singleton instance of the {@link LifecycleCoordinator}.
 *
 * @category Utilities
 */
export const lifecycleCoordinator = new LifecycleCoordinator();
