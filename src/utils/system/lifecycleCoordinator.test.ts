import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
});
