import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captureException, Logger } from "@/utils/system/monitoring";

import { LifecycleCoordinator, lifecycleCoordinator } from "./lifecycleCoordinator";

// Mock the vite-plugin-splash-screen/runtime
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

// Mock idle runner to execute synchronously when requested
vi.mock("@/utils/system/idle", () => ({
	runWhenIdle: vi.fn((cb: () => void) => {
		cb();
	}),
}));

// Mock monitoring logger and error capture
vi.mock("@/utils/system/monitoring", () => ({
	captureException: vi.fn(),
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
}));

describe("LifecycleCoordinator", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		lifecycleCoordinator.reset();
		document.documentElement.classList.remove("background-visible");
		document.getElementById("vpss")?.remove();
		document.getElementById("vpss-style")?.remove();
		document.querySelectorAll(".ssg-fallback").forEach((el) => {
			el.remove();
		});

		// Mock requestAnimationFrame to execute synchronously
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
			cb(0);

			return 0;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Initial State & Queries", () => {
		it("should initialize in BOOTING phase", () => {
			const coordinator = new LifecycleCoordinator();

			expect(coordinator.getPhase()).toBe("BOOTING");
			expect(coordinator.isHydrated()).toBe(false);
			expect(coordinator.isReady()).toBe(false);
			expect(coordinator.isFatal()).toBe(false);
			expect(coordinator.getFatalError()).toBeNull();
		});

		it("should reflect correct query flags across state transitions", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });

			coordinator.markHydrated();
			expect(coordinator.getPhase()).toBe("HYDRATED");
			expect(coordinator.isHydrated()).toBe(true);
			expect(coordinator.isReady()).toBe(false);

			coordinator.markReady();
			expect(coordinator.getPhase()).toBe("READY");
			expect(coordinator.isHydrated()).toBe(true);
			expect(coordinator.isReady()).toBe(true);

			coordinator.transitionTo("IDLE");
			expect(coordinator.getPhase()).toBe("IDLE");
			expect(coordinator.isHydrated()).toBe(true);
			expect(coordinator.isReady()).toBe(true);
		});
	});

	describe("Phase Transitions & Subscriptions", () => {
		it("should notify subscribers when phase transitions", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const listener = vi.fn();
			const unsubscribe = coordinator.subscribe(listener);

			coordinator.markHydrated();
			expect(listener).toHaveBeenCalledWith("HYDRATED", "BOOTING");

			coordinator.markReady();
			expect(listener).toHaveBeenCalledWith("READY", "HYDRATED");

			unsubscribe();
			coordinator.transitionTo("IDLE");
			expect(listener).toHaveBeenCalledTimes(2);
		});

		it("should ignore transitions to the already active phase", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const listener = vi.fn();
			coordinator.subscribe(listener);

			coordinator.markHydrated();
			expect(listener).toHaveBeenCalledTimes(1);

			// Redundant call
			coordinator.markHydrated();
			expect(listener).toHaveBeenCalledTimes(1);
		});

		it("should trigger onPhase once-listeners when the target phase is reached", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const onReadyCb = vi.fn();
			const onIdleCb = vi.fn();

			coordinator.onPhase("READY", onReadyCb);
			coordinator.onPhase("IDLE", onIdleCb);

			coordinator.markHydrated();
			expect(onReadyCb).not.toHaveBeenCalled();

			coordinator.markReady();
			expect(onReadyCb).toHaveBeenCalledTimes(1);
			expect(onIdleCb).not.toHaveBeenCalled();

			coordinator.transitionTo("IDLE");
			expect(onIdleCb).toHaveBeenCalledTimes(1);
		});

		it("should immediately execute onPhase callback if coordinator is already at the target phase", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			coordinator.markHydrated();

			const callback = vi.fn();
			coordinator.onPhase("HYDRATED", callback);

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it("should allow unsubscribing an onPhase callback before it triggers", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const onReadyCb = vi.fn();
			const unsubscribe = coordinator.onPhase("READY", onReadyCb);

			unsubscribe();
			coordinator.markReady();

			expect(onReadyCb).not.toHaveBeenCalled();
		});
	});

	describe("Ready Phase Side-Effects", () => {
		it("should dismiss splash screen and add background-visible class on READY", () => {
			const coordinator = new LifecycleCoordinator();
			coordinator.markReady();

			expect(document.documentElement.classList.contains("background-visible")).toBe(true);
			expect((window as typeof window & { __APP_READY__?: boolean }).__APP_READY__).toBe(
				true
			);
		});

		it("should clean up .ssg-fallback elements from DOM on READY", () => {
			const fallback1 = document.createElement("main");
			fallback1.className = "ssg-fallback";
			document.body.appendChild(fallback1);

			const fallback2 = document.createElement("div");
			fallback2.className = "ssg-fallback";
			document.body.appendChild(fallback2);

			expect(document.querySelectorAll(".ssg-fallback").length).toBe(2);

			const coordinator = new LifecycleCoordinator();
			coordinator.markReady();

			expect(document.querySelectorAll(".ssg-fallback").length).toBe(0);
		});

		it("should dispatch legacy app-ready custom event on READY", () => {
			const dispatchSpy = vi.spyOn(window, "dispatchEvent");
			const coordinator = new LifecycleCoordinator();

			coordinator.markReady();

			expect(dispatchSpy).toHaveBeenCalled();
			expect(
				dispatchSpy.mock.calls.find((call) => call[0].type === "app-ready")
			).toBeDefined();
		});

		it("should invoke custom dismissal and cleanup callbacks if provided", () => {
			const onDismissSplashScreen = vi.fn();
			const onCleanupSsgFallback = vi.fn();

			const coordinator = new LifecycleCoordinator({
				onCleanupSsgFallback,
				onDismissSplashScreen,
			});

			coordinator.markReady();

			expect(onDismissSplashScreen).toHaveBeenCalledTimes(1);
			expect(onCleanupSsgFallback).toHaveBeenCalledTimes(1);
		});

		it("should remove vpss elements after timer", () => {
			vi.useFakeTimers();

			const vpss = document.createElement("div");
			vpss.id = "vpss";
			document.body.appendChild(vpss);

			const vpssStyle = document.createElement("style");
			vpssStyle.id = "vpss-style";
			document.body.appendChild(vpssStyle);

			const coordinator = new LifecycleCoordinator();
			coordinator.markReady();

			expect(document.getElementById("vpss")).not.toBeNull();

			vi.advanceTimersByTime(1100);

			expect(document.getElementById("vpss")).toBeNull();
			expect(document.getElementById("vpss-style")).toBeNull();

			vi.useRealTimers();
		});
	});

	describe("Fatal Error Handling", () => {
		it("should transition to FATAL and record fatal error", () => {
			const onFatal = vi.fn();
			const coordinator = new LifecycleCoordinator({ onFatal });
			const error = new Error("Bootstrap crash");

			coordinator.markFatal(error);

			expect(coordinator.getPhase()).toBe("FATAL");
			expect(coordinator.isFatal()).toBe(true);
			expect(coordinator.getFatalError()).toBe(error);
			expect(onFatal).toHaveBeenCalledWith(error);
		});

		it("should prevent further phase transitions once in FATAL", () => {
			const onFatal = vi.fn();
			const coordinator = new LifecycleCoordinator({ onFatal });

			coordinator.markFatal(new Error("Fatal crash"));
			expect(coordinator.getPhase()).toBe("FATAL");

			// Attempts to transition should be ignored
			coordinator.markHydrated();
			expect(coordinator.getPhase()).toBe("FATAL");

			coordinator.markReady();
			expect(coordinator.getPhase()).toBe("FATAL");
		});

		it("should reset state and error on reset()", () => {
			const coordinator = new LifecycleCoordinator();
			coordinator.markFatal(new Error("Crash"));

			expect(coordinator.isFatal()).toBe(true);

			coordinator.reset();

			expect(coordinator.getPhase()).toBe("BOOTING");
			expect(coordinator.isFatal()).toBe(false);
			expect(coordinator.getFatalError()).toBeNull();
		});
	});

	describe("Deferred Task Registry & IDLE Pipeline", () => {
		it("should register tasks using object or parameter overloads", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const task1 = vi.fn();
			const task2 = vi.fn();

			coordinator.registerDeferredTask({
				name: "task-1",
				priority: 10,
				run: task1,
			});

			coordinator.registerDeferredTask("task-2", task2, 5);

			expect(coordinator.hasDeferredTask("task-1")).toBe(true);
			expect(coordinator.hasDeferredTask("task-2")).toBe(true);
			expect(coordinator.hasDeferredTask("non-existent")).toBe(false);

			const tasks = coordinator.getDeferredTasks();
			expect(tasks).toHaveLength(2);
			expect(tasks[0].name).toBe("task-1");
			expect(tasks[1].name).toBe("task-2");
		});

		it("should unregister a task by name or via returned unsubscribe callback", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const unregister = coordinator.registerDeferredTask("task-1", vi.fn());
			coordinator.registerDeferredTask("task-2", vi.fn());

			expect(coordinator.hasDeferredTask("task-1")).toBe(true);
			expect(coordinator.hasDeferredTask("task-2")).toBe(true);

			unregister();
			expect(coordinator.hasDeferredTask("task-1")).toBe(false);

			const deleted = coordinator.unregisterDeferredTask("task-2");
			expect(deleted).toBe(true);
			expect(coordinator.hasDeferredTask("task-2")).toBe(false);
		});

		it("should NOT execute deferred tasks during BOOTING, HYDRATED, or READY phases", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const taskFn = vi.fn();
			coordinator.registerDeferredTask("test-task", taskFn);

			expect(taskFn).not.toHaveBeenCalled();

			coordinator.markHydrated();
			expect(taskFn).not.toHaveBeenCalled();

			coordinator.markReady();
			expect(taskFn).not.toHaveBeenCalled();
		});

		it("should execute deferred tasks when entering IDLE phase in descending priority order", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const executionOrder: string[] = [];

			coordinator.registerDeferredTask({
				name: "low-priority",
				priority: 1,
				run: () => {
					executionOrder.push("low");
				},
			});

			coordinator.registerDeferredTask({
				name: "high-priority",
				priority: 10,
				run: () => {
					executionOrder.push("high");
				},
			});

			coordinator.registerDeferredTask({
				name: "mid-priority",
				priority: 5,
				run: () => {
					executionOrder.push("mid");
				},
			});

			coordinator.markReady();
			expect(executionOrder).toEqual([]);

			coordinator.transitionTo("IDLE");
			await coordinator.flushDeferredTasks();

			expect(executionOrder).toEqual(["high", "mid", "low"]);
		});

		it("should flush deferred tasks deterministically without phase transition", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const taskFn = vi.fn();

			coordinator.registerDeferredTask("deterministic-task", taskFn);
			expect(taskFn).not.toHaveBeenCalled();

			await coordinator.flushDeferredTasks();
			expect(taskFn).toHaveBeenCalledTimes(1);

			// Calling flush again should not re-execute already completed tasks
			await coordinator.flushDeferredTasks();
			expect(taskFn).toHaveBeenCalledTimes(1);
		});

		it("should execute a task immediately if registered when already in IDLE phase", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			coordinator.transitionTo("IDLE");

			const lateTaskFn = vi.fn();
			coordinator.registerDeferredTask("late-task", lateTaskFn);

			await coordinator.flushDeferredTasks();
			expect(lateTaskFn).toHaveBeenCalledTimes(1);
		});

		it("should isolate errors in deferred tasks, log them, capture via Sentry, and continue remaining tasks", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const executionOrder: string[] = [];
			const failingError = new Error("Background task failure");

			coordinator.registerDeferredTask({
				name: "failing-task",
				priority: 10,
				run: () => {
					executionOrder.push("fail");
					throw failingError;
				},
			});

			coordinator.registerDeferredTask({
				name: "healthy-task",
				priority: 5,
				run: () => {
					executionOrder.push("healthy");
				},
			});

			coordinator.transitionTo("IDLE");
			await coordinator.flushDeferredTasks();

			expect(executionOrder).toEqual(["fail", "healthy"]);
			expect(Logger.error).toHaveBeenCalledWith(
				'Deferred task "failing-task" failed:',
				failingError
			);
			expect(captureException).toHaveBeenCalledWith(failingError, {
				level: "error",
				tags: { area: "deferred-services", task: "failing-task" },
			});
		});

		it("should clear registered tasks and execution history on reset()", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const taskFn = vi.fn();

			coordinator.registerDeferredTask("task-1", taskFn);
			coordinator.transitionTo("IDLE");
			await coordinator.flushDeferredTasks();
			expect(taskFn).toHaveBeenCalledTimes(1);

			coordinator.reset();
			expect(coordinator.hasDeferredTask("task-1")).toBe(false);
			expect(coordinator.getDeferredTasks()).toHaveLength(0);

			// Re-registering after reset allows execution again
			const newTaskFn = vi.fn();
			coordinator.registerDeferredTask("task-1", newTaskFn);
			coordinator.transitionTo("IDLE");
			await coordinator.flushDeferredTasks();
			expect(newTaskFn).toHaveBeenCalledTimes(1);
		});
	});
});
