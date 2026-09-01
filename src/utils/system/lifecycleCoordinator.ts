/**
 * Application Lifecycle Coordinator state machine module.
 *
 * @remarks
 * Manages discrete application lifecycle phases (`BOOTING` -> `HYDRATED` -> `READY` -> `IDLE` -> `FATAL`).
 * Orchestrates splash screen dismissal, pre-rendered SSG fallback cleanup, and phase transitions.
 *
 * @see {@link ./lifecycleCoordinator.test.ts Unit Tests}
 *
 * @category Utilities
 */

import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import { UI_TIMING } from "@/constants";
import { runWhenIdle } from "@/utils/system/idle";
import { captureException, Logger } from "@/utils/system/monitoring";

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
 * Task definition for deferred execution in the {@link LifecycleCoordinator} idle pipeline.
 */
export interface DeferredTask {
	/**
	 * Unique identifier for the deferred task (e.g., `"api-preload"`, `"ga4-analytics"`, `"service-worker"`).
	 */
	name: string;
	/**
	 * Execution priority for the task. Higher numbers execute before lower numbers.
	 *
	 * @default 0
	 */
	priority?: number;
	/**
	 * Asynchronous or synchronous task function executed when entering the `IDLE` phase.
	 */
	run: DeferredTaskHandler;
}

/**
 * Handler callback for a registered deferred task.
 *
 * @returns {Promise<void> | void} A promise that resolves when the task finishes, or void.
 */
export type DeferredTaskHandler = () => Promise<void> | void;

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
	private deferredTasks = new Map<string, DeferredTask>();
	private executedTaskNames = new Set<string>();
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

		if (typeof window !== "undefined") {
			(
				window as Window & { lifecycleCoordinator?: LifecycleCoordinator }
			).lifecycleCoordinator = this;
		}
	}

	/**
	 * Deterministically executes all registered deferred tasks that have not yet run.
	 *
	 * @remarks
	 * Tasks are executed sequentially in descending order of priority.
	 * If a task fails or throws an exception, the error is logged and captured via Sentry,
	 * but execution continues for all remaining registered deferred tasks.
	 *
	 * @returns {Promise<void>} Resolves when all registered deferred tasks have settled.
	 *
	 * @see {@link registerDeferredTask}
	 *
	 * @category Utilities
	 *
	 * @example
	 * ```ts
	 * await lifecycleCoordinator.flushDeferredTasks();
	 * // returns Promise<void>
	 * ```
	 */
	public async flushDeferredTasks(): Promise<void> {
		const tasks = this.getDeferredTasks();

		for (const task of tasks) {
			if (!this.executedTaskNames.has(task.name)) {
				await this.executeDeferredTask(task);
			}
		}
	}

	/**
	 * Retrieves all registered deferred tasks, sorted by priority in descending order.
	 *
	 * @returns {DeferredTask[]} Array of registered deferred tasks.
	 *
	 * @category Utilities
	 *
	 * @example
	 * ```ts
	 * const tasks = lifecycleCoordinator.getDeferredTasks();
	 * // returns DeferredTask[]
	 * ```
	 */
	public getDeferredTasks(): DeferredTask[] {
		return Array.from(this.deferredTasks.values()).sort(
			(a, b) => (b.priority ?? 0) - (a.priority ?? 0)
		);
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
	 * Checks if a deferred task with the given name is currently registered.
	 *
	 * @param {string} name - Name of the deferred task.
	 *
	 * @returns {boolean} True if registered, false otherwise.
	 *
	 * @category Utilities
	 *
	 * @example
	 * ```ts
	 * if (lifecycleCoordinator.hasDeferredTask("service-worker")) {
	 *   // Task is registered
	 * }
	 * ```
	 */
	public hasDeferredTask(name: string): boolean {
		return this.deferredTasks.has(name);
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
	 * Registers a task to execute during the `IDLE` lifecycle phase.
	 *
	 * @remarks
	 * If the coordinator has already reached the `IDLE` phase, the registered task
	 * executes asynchronously. Tasks are executed in descending order of their
	 * `priority` values (higher priority runs first).
	 *
	 * @param {DeferredTask | string} taskOrName - The deferred task descriptor or the task name string.
	 * @param {DeferredTaskHandler} [run] - The task execution handler (if task name string is provided).
	 * @param {number} [priority=0] - Optional execution priority (if task name string is provided).
	 *
	 * @returns {() => void} Unsubscribe function to unregister the task before execution.
	 *
	 * @see {@link DeferredTask}
	 * @see {@link flushDeferredTasks}
	 *
	 * @category Utilities
	 *
	 * @example
	 * ```ts
	 * const unregister = lifecycleCoordinator.registerDeferredTask({
	 *   name: "ga4-analytics",
	 *   priority: 5,
	 *   run: async () => {
	 *     await initializeAnalytics();
	 *   },
	 * });
	 * ```
	 */
	public registerDeferredTask(task: DeferredTask): () => void;
	public registerDeferredTask(
		name: string,
		run: DeferredTaskHandler,
		priority?: number
	): () => void;
	public registerDeferredTask(
		taskOrName: DeferredTask | string,
		run?: DeferredTaskHandler,
		priority?: number
	): () => void {
		const task: DeferredTask =
			typeof taskOrName === "string"
				? { name: taskOrName, priority: priority ?? 0, run: run! }
				: { ...taskOrName, priority: taskOrName.priority ?? 0 };

		this.deferredTasks.set(task.name, task);

		if (this.phase === "IDLE" && !this.executedTaskNames.has(task.name)) {
			void this.executeDeferredTask(task);
		}

		return () => {
			this.unregisterDeferredTask(task.name);
		};
	}
	/**
	 * Resets the coordinator to its initial `BOOTING` state and clears all listeners and tasks.
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
		this.deferredTasks.clear();
		this.executedTaskNames.clear();
	}

	/**
	 * Sets or overrides the fatal error handler callback.
	 *
	 * @param {(error: unknown) => void} handler - Custom fatal error callback to execute when entering `FATAL`.
	 *
	 * @returns {void}
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.setOnFatal((error) => {
	 *   console.error("Fatal boot failure", error);
	 * });
	 * ```
	 */
	public setOnFatal(handler: (error: unknown) => void): void {
		this.options.onFatal = handler;
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
		} else if (nextPhase === "IDLE") {
			void this.flushDeferredTasks();
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
	 * Unregisters a deferred task by name.
	 *
	 * @param {string} name - Name of the deferred task to unregister.
	 *
	 * @returns {boolean} True if the task was found and removed, false otherwise.
	 *
	 * @category Utilities
	 *
	 * @example
	 * ```ts
	 * lifecycleCoordinator.unregisterDeferredTask("ga4-analytics");
	 * // returns boolean
	 * ```
	 */
	public unregisterDeferredTask(name: string): boolean {
		return this.deferredTasks.delete(name);
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
	 * Executes a single deferred task with isolated error trapping.
	 *
	 * @param {DeferredTask} task - The deferred task descriptor to execute.
	 *
	 * @returns {Promise<void>} Resolves when task execution completes or fails safely.
	 *
	 * @private
	 *
	 */
	private async executeDeferredTask(task: DeferredTask): Promise<void> {
		if (this.executedTaskNames.has(task.name)) {
			return;
		}

		this.executedTaskNames.add(task.name);

		try {
			await task.run();
		} catch (error) {
			Logger.error(`Deferred task "${task.name}" failed:`, error);
			captureException(error, {
				level: "error",
				tags: { area: "deferred-services", task: task.name },
			});
		}
	}

	/**
	 * Executes fatal error handling.
	 *
	 * @param {unknown} error - The fatal error to process.
	 *
	 * @private
	 */
	private handleFatal(error: unknown): void {
		Logger.error("Fatal lifecycle error:", error);
		captureException(error, {
			level: "fatal",
			tags: { area: "lifecycle-coordinator" },
		});

		if (this.options.onFatal) {
			this.options.onFatal(error);

			return;
		}

		handleFatalBootstrapError(error);
	}

	/**
	 * Executes side-effects for the `READY` phase transition:
	 * 1. Dismiss splash screen
	 * 2. Cleanup pre-rendered SSG fallback elements
	 * 3. Clear recovery marker from session storage
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

		// 3. Clear preload recovery attempt marker
		if (typeof window !== "undefined") {
			try {
				sessionStorage.removeItem("__preload_recovery__");
			} catch (_e) {
				// ignore
			}
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
 * Handles fatal application bootstrap and initialization failures.
 *
 * @remarks
 * If an error or unhandled promise rejection occurs during the initial application mount
 * or data loading sequence (before reaching the `READY` phase), this handler:
 * 1. Purges the splash screen components (`#vpss`, `#vpss-style`) to clean up the DOM.
 * 2. Redirects the browser to the static `/500.html` error recovery page, passing the error description.
 *
 * @param {unknown} error - The fatal error or rejection reason captured during startup.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link LifecycleCoordinator}
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
 * Global singleton instance of the {@link LifecycleCoordinator}.
 *
 * @category Utilities
 */
export const lifecycleCoordinator = new LifecycleCoordinator();

if (typeof window !== "undefined") {
	(window as Window & { lifecycleCoordinator?: LifecycleCoordinator }).lifecycleCoordinator =
		lifecycleCoordinator;
}
