import React from "react";
import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initializeAnalytics, initializeAnalyticsClient } from "@/utils/analytics/tracking";
import { preloadInitialState } from "@/utils/api/apiPreload";
import { setupServiceWorkerRegistration } from "@/utils/system/setupServiceWorker";

import {
	bootApp,
	handleFatalBootstrapError,
	registerDefaultDeferredServices,
} from "./bootPipeline";
import { performBootstrapMigrations } from "./bootstrap";
import { LifecycleCoordinator } from "./lifecycleCoordinator";
import { initializeSentry } from "./monitoring";

vi.mock("./bootstrap", () => ({
	performBootstrapMigrations: vi.fn(),
}));

vi.mock("@/utils/analytics/tracking", () => ({
	initializeAnalytics: vi.fn(),
	initializeAnalyticsClient: vi.fn(),
}));

vi.mock("@/utils/api/apiPreload", () => ({
	preloadInitialState: vi.fn(),
}));

vi.mock("@/utils/system/setupServiceWorker", () => ({
	setupServiceWorkerRegistration: vi.fn(),
}));

vi.mock("./monitoring", () => ({
	captureException: vi.fn(),
	createAppRouter: vi.fn(() => ({})),
	initializeSentry: vi.fn(),
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
}));

vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

describe("bootPipeline", () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		vi.clearAllMocks();
		container = document.createElement("div");
		container.id = "root";
		document.body.appendChild(container);
	});

	afterEach(() => {
		container.remove();
		vi.restoreAllMocks();
	});

	describe("Successful Boot", () => {
		it("should execute migrations, initialize sentry, and mount component to target", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const TestComponent = () => <div data-testid="test-app">App Rendered</div>;

			let result!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				result = await bootApp({
					coordinator,
					enableSentry: true,
					rootComponent: <TestComponent />,
					skipGlobalErrorHandlers: true,
					target: container,
				});
			});

			expect(performBootstrapMigrations).toHaveBeenCalledTimes(1);
			expect(initializeSentry).toHaveBeenCalledTimes(1);
			expect(coordinator.getPhase()).toBe("HYDRATED");
			expect(coordinator.isHydrated()).toBe(true);

			// Check DOM has rendered component
			await waitFor(() => {
				expect(container.querySelector('[data-testid="test-app"]')).not.toBeNull();
			});

			await act(async () => {
				result.unmount();
			});
			expect(result.root).toBeDefined();
		});

		it("should skip Sentry when disabled", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });

			let result!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				result = await bootApp({
					coordinator,
					enableSentry: false,
					rootComponent: <div>Simple</div>,
					skipGlobalErrorHandlers: true,
					target: container,
				});
			});

			expect(initializeSentry).not.toHaveBeenCalled();
			await act(async () => {
				result.unmount();
			});
		});

		it("should fallback to document.getElementById('root') if target is not explicitly passed", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });

			let result!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				result = await bootApp({
					coordinator,
					rootComponent: <div data-testid="fallback-app">Fallback</div>,
					skipGlobalErrorHandlers: true,
				});
			});

			await waitFor(() => {
				expect(container.querySelector('[data-testid="fallback-app"]')).not.toBeNull();
			});

			await act(async () => {
				result.unmount();
			});
		});
	});

	describe("Fatal Bootstrap Failures", () => {
		it("should throw and mark FATAL if target element cannot be found", async () => {
			container.remove(); // Remove #root from DOM
			const coordinator = new LifecycleCoordinator();
			const onFatalError = vi.fn();

			await expect(
				bootApp({
					coordinator,
					onFatalError,
					skipGlobalErrorHandlers: true,
					target: null,
				})
			).rejects.toThrow("Target root element not found for application mount.");

			expect(coordinator.isFatal()).toBe(true);
			expect(onFatalError).toHaveBeenCalled();
		});

		it("should redirect to /500.html on handleFatalBootstrapError in browser", () => {
			const replaceMock = vi.fn();
			const originalLocation = window.location;
			Object.defineProperty(window, "location", {
				configurable: true,
				value: {
					...originalLocation,
					replace: replaceMock,
				},
				writable: true,
			});

			handleFatalBootstrapError(new Error("Test Error"));

			expect(replaceMock).toHaveBeenCalledWith(
				expect.stringContaining(
					"/500.html?error_type=initialization_error&error_cause=Test%20Error"
				)
			);

			Object.defineProperty(window, "location", {
				configurable: true,
				value: originalLocation,
				writable: true,
			});
		});
	});

	describe("Global Error Interception", () => {
		it("should catch window errors during BOOTING/HYDRATED and trigger fatal handler", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const onFatalError = vi.fn();

			let result!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				result = await bootApp({
					coordinator,
					onFatalError,
					rootComponent: <div>App</div>,
					skipGlobalErrorHandlers: false,
					target: container,
				});
			});

			expect(coordinator.getPhase()).toBe("HYDRATED");

			// Simulate uncaught error during boot
			const errorEvent = new ErrorEvent("error", {
				error: new Error("Early boot runtime error"),
				filename: window.location.origin + "/src/index.ts",
				message: "Early boot runtime error",
			});
			window.dispatchEvent(errorEvent);

			expect(coordinator.isFatal()).toBe(true);
			expect(onFatalError).toHaveBeenCalled();

			await act(async () => {
				result.unmount();
			});
		});

		it("should suppress benign errors (ResizeObserver loop)", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const onFatalError = vi.fn();

			let result!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				result = await bootApp({
					coordinator,
					onFatalError,
					rootComponent: <div>App</div>,
					skipGlobalErrorHandlers: false,
					target: container,
				});
			});

			const errorEvent = new ErrorEvent("error", {
				message: "ResizeObserver loop completed with undelivered notifications.",
			});
			window.dispatchEvent(errorEvent);

			expect(coordinator.isFatal()).toBe(false);
			expect(onFatalError).not.toHaveBeenCalled();

			await act(async () => {
				result.unmount();
			});
		});

		it("should not trigger fatal handler for errors occurring after reaching READY", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			const onFatalError = vi.fn();

			let result!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				result = await bootApp({
					coordinator,
					onFatalError,
					rootComponent: <div>App</div>,
					skipGlobalErrorHandlers: false,
					target: container,
				});
			});

			coordinator.markReady();
			expect(coordinator.isReady()).toBe(true);

			const errorEvent = new ErrorEvent("error", {
				error: new Error("Late runtime error"),
				filename: window.location.origin + "/src/someComponent.tsx",
				message: "Late runtime error",
			});
			window.dispatchEvent(errorEvent);

			// Fatal handler should not be called since app has already reached READY
			expect(coordinator.isFatal()).toBe(false);
			expect(onFatalError).not.toHaveBeenCalled();

			await act(async () => {
				result.unmount();
			});
		});
	});

	describe("Deferred Services Registration & Execution", () => {
		it("should register default deferred background services on coordinator", () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			registerDefaultDeferredServices(coordinator);

			expect(coordinator.hasDeferredTask("api-preload")).toBe(true);
			expect(coordinator.hasDeferredTask("ga4-analytics")).toBe(true);
			expect(coordinator.hasDeferredTask("service-worker")).toBe(true);

			const tasks = coordinator.getDeferredTasks();
			expect(tasks.map((t) => t.name)).toEqual([
				"api-preload",
				"ga4-analytics",
				"service-worker",
			]);
		});

		it("should execute registered deferred services when IDLE is reached or flushed", async () => {
			const coordinator = new LifecycleCoordinator({ autoTransitionToIdle: false });
			registerDefaultDeferredServices(coordinator);

			expect(preloadInitialState).not.toHaveBeenCalled();
			expect(initializeAnalyticsClient).not.toHaveBeenCalled();
			expect(initializeAnalytics).not.toHaveBeenCalled();
			expect(setupServiceWorkerRegistration).not.toHaveBeenCalled();

			await coordinator.flushDeferredTasks();

			expect(preloadInitialState).toHaveBeenCalledTimes(1);
			expect(initializeAnalyticsClient).toHaveBeenCalledTimes(1);
			expect(initializeAnalytics).toHaveBeenCalledTimes(1);
			expect(setupServiceWorkerRegistration).toHaveBeenCalledTimes(1);
		});

		it("should register default deferred services in bootApp unless skipDeferredServices is true", async () => {
			const coordinator1 = new LifecycleCoordinator({ autoTransitionToIdle: false });

			let res1!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				res1 = await bootApp({
					coordinator: coordinator1,
					rootComponent: <div>App</div>,
					skipGlobalErrorHandlers: true,
					target: container,
				});
			});

			expect(coordinator1.hasDeferredTask("api-preload")).toBe(true);
			expect(coordinator1.hasDeferredTask("ga4-analytics")).toBe(true);
			expect(coordinator1.hasDeferredTask("service-worker")).toBe(true);

			await act(async () => {
				res1.unmount();
			});

			const coordinator2 = new LifecycleCoordinator({ autoTransitionToIdle: false });
			let res2!: Awaited<ReturnType<typeof bootApp>>;
			await act(async () => {
				res2 = await bootApp({
					coordinator: coordinator2,
					rootComponent: <div>App</div>,
					skipDeferredServices: true,
					skipGlobalErrorHandlers: true,
					target: container,
				});
			});

			expect(coordinator2.hasDeferredTask("api-preload")).toBe(false);
			expect(coordinator2.hasDeferredTask("ga4-analytics")).toBe(false);
			expect(coordinator2.hasDeferredTask("service-worker")).toBe(false);

			await act(async () => {
				res2.unmount();
			});
		});
	});
});
