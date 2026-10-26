import React from "react";
import { act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchTechTreeAsync } from "@/hooks/useTechTree/useTechTree";
import { fetchPlatforms, resolveInitialPlatform } from "@/store/app/platformStore";
import { initializeAnalytics } from "@/utils/analytics/tracking";
import { setupServiceWorkerRegistration } from "@/utils/system/setupServiceWorker";

import type * as MonitoringModule from "./monitoring";
import {
	bootApp,
	handleFatalBootstrapError,
	preloadInitialState,
	registerDefaultDeferredServices,
} from "./bootPipeline";
import { performBootstrapMigrations } from "./bootstrap";
import { LifecycleCoordinator } from "./lifecycleCoordinator";
import { initializeSentry, Logger } from "./monitoring";

vi.mock("./bootstrap", () => ({
	performBootstrapMigrations: vi.fn(),
}));

vi.mock("@/utils/analytics/tracking", () => ({
	initializeAnalytics: vi.fn(),
}));

vi.mock("@/store/app/platformStore", () => ({
	fetchPlatforms: vi.fn(),
	resolveInitialPlatform: vi.fn(() => "solar"),
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	fetchTechTreeAsync: vi.fn(),
}));

vi.mock("@/utils/system/setupServiceWorker", () => ({
	setupServiceWorkerRegistration: vi.fn(),
}));

vi.mock("./monitoring", async (importOriginal) => {
	const actual = await importOriginal<typeof MonitoringModule>();

	return {
		...actual,
		flushSentry: vi.fn(async () => true),
		initializeSentry: vi.fn(),
		Logger: {
			error: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
		},
	};
});

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
		it("should execute migrations, defer sentry to IDLE phase, and mount component to target", async () => {
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
			// Sentry initialization is deferred until IDLE phase
			expect(initializeSentry).not.toHaveBeenCalled();
			expect(coordinator.hasDeferredTask("sentry-monitoring")).toBe(true);
			expect(coordinator.getPhase()).toBe("HYDRATED");
			expect(coordinator.isHydrated()).toBe(true);

			// Check DOM has rendered component
			await waitFor(() => {
				expect(container.querySelector('[data-testid="test-app"]')).not.toBeNull();
			});

			await coordinator.flushDeferredTasks();
			expect(initializeSentry).toHaveBeenCalledTimes(1);

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

			expect(coordinator.hasDeferredTask("sentry-monitoring")).toBe(false);
			await coordinator.flushDeferredTasks();
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
				}),
			).rejects.toThrow("Target root element not found for application mount.");

			expect(coordinator.isFatal()).toBe(true);
			expect(onFatalError).toHaveBeenCalled();
		});

		it("should redirect to /500.html on handleFatalBootstrapError in browser", async () => {
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

			await handleFatalBootstrapError(new Error("Test Error"));

			expect(replaceMock).toHaveBeenCalledWith(
				expect.stringContaining(
					"/500.html?error_type=initialization_error&error_cause=Test%20Error",
				),
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

			const lateError = new Error("Late runtime error");
			const errorEvent = new ErrorEvent("error", {
				error: lateError,
				filename: window.location.origin + "/src/someComponent.tsx",
				message: "Late runtime error",
			});
			window.dispatchEvent(errorEvent);

			// Fatal handler should not be called since app has already reached READY
			expect(coordinator.isFatal()).toBe(false);
			expect(onFatalError).not.toHaveBeenCalled();
			expect(Logger.error).toHaveBeenCalledWith("Uncaught runtime error:", lateError);

			await act(async () => {
				result.unmount();
			});
		});

		it("should ignore errors originating from third-party scripts or browser extensions", async () => {
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
				error: new Error("Extension script error"),
				filename: "chrome-extension://abcdefghijklmno/content.js",
				message: "Extension script error",
			});
			window.dispatchEvent(errorEvent);

			expect(coordinator.isFatal()).toBe(false);
			expect(onFatalError).not.toHaveBeenCalled();
			expect(Logger.error).not.toHaveBeenCalled();

			await act(async () => {
				result.unmount();
			});
		});

		it("should ignore unhandled promise rejections with an empty stack or third-party WKWebView stack and report first-party rejections", async () => {
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

			const dispatchUnhandledRejection = (message: string, stack: string) => {
				const error = new Error(message);
				error.stack = stack;
				const event = new Event("unhandledrejection");
				Object.assign(event, { reason: error });
				window.dispatchEvent(event);

				return error;
			};

			dispatchUnhandledRejection("Stylesheet append timeout", "");
			dispatchUnhandledRejection(
				"Stylesheet append timeout",
				"Error: Stylesheet append timeout\n    at @:1:234",
			);

			expect(Logger.error).not.toHaveBeenCalled();

			const firstPartyError = dispatchUnhandledRejection(
				"First-party async failure",
				`Error: First-party async failure\n    at ${window.location.origin}/src/App.tsx:42:10`,
			);

			expect(Logger.error).toHaveBeenCalledTimes(1);
			expect(Logger.error).toHaveBeenCalledWith(
				"Unhandled promise rejection:",
				firstPartyError,
			);

			await act(async () => {
				result.unmount();
			});
		});

		it("should ignore AbortError exceptions and signal abort rejections in global error and unhandledrejection listeners", async () => {
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

			// 1. Before READY: AbortError in unhandledrejection or error should not mark coordinator FATAL
			const abortRejection = new DOMException(
				"signal is aborted without reason",
				"AbortError",
			);
			abortRejection.stack = `AbortError: signal is aborted without reason\n    at finish (${window.location.origin}/src/utils/analytics/tracking.ts:200:15)`;

			const rejectionEvent = new Event("unhandledrejection");
			Object.assign(rejectionEvent, { reason: abortRejection });
			window.dispatchEvent(rejectionEvent);

			window.dispatchEvent(
				new ErrorEvent("error", {
					error: abortRejection,
					filename: `${window.location.origin}/src/utils/analytics/tracking.ts`,
					message: "AbortError: signal is aborted without reason",
				}),
			);

			expect(coordinator.isFatal()).toBe(false);
			expect(onFatalError).not.toHaveBeenCalled();
			expect(Logger.error).not.toHaveBeenCalled();

			// 2. After READY: AbortError in unhandledrejection or error should not call Logger.error
			coordinator.markReady();

			window.dispatchEvent(rejectionEvent);
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: null,
					filename: `${window.location.origin}/src/utils/analytics/tracking.ts`,
					message: "Uncaught AbortError: signal is aborted without reason",
				}),
			);

			expect(Logger.error).not.toHaveBeenCalled();

			await act(async () => {
				result.unmount();
			});
		});

		it("should ignore browser-translation DOM mutation NotFoundError (removeChild / insertBefore) in global error and unhandledrejection listeners", async () => {
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

			const removeChildError = new DOMException(
				"Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
				"NotFoundError",
			);
			removeChildError.stack = `NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.\n    at commitDeletionEffectsOnFiber (${window.location.origin}/build/assets/vendor-core.js:10283:24)`;

			const insertBeforeError = new DOMException(
				"Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.",
				"NotFoundError",
			);
			insertBeforeError.stack = `NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.\n    at commitPlacement (${window.location.origin}/build/assets/vendor-core.js:10100:24)`;

			// 1. Before READY: should not mark coordinator FATAL
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: removeChildError,
					filename: `${window.location.origin}/build/assets/vendor-core.js`,
					message: removeChildError.message,
				}),
			);

			const rejectionEvent = new Event("unhandledrejection");
			Object.assign(rejectionEvent, { reason: insertBeforeError });
			window.dispatchEvent(rejectionEvent);

			expect(coordinator.isFatal()).toBe(false);
			expect(onFatalError).not.toHaveBeenCalled();
			expect(Logger.error).not.toHaveBeenCalled();

			// 2. After READY: should not call Logger.error
			coordinator.markReady();

			window.dispatchEvent(
				new ErrorEvent("error", {
					error: removeChildError,
					filename: `${window.location.origin}/build/assets/vendor-core.js`,
					message: removeChildError.message,
				}),
			);
			window.dispatchEvent(rejectionEvent);

			expect(Logger.error).not.toHaveBeenCalled();

			await act(async () => {
				result.unmount();
			});
		});

		it("should ignore masked cross-origin or empty ErrorEvents without a first-party stack and normalize string ErrorEvents from first-party files into Error instances", async () => {
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

			// 1. Masked cross-origin "Script error." with empty filename and null error
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: null,
					filename: "",
					message: "Script error.",
				}),
			);

			// 2. Empty ErrorEvent with empty filename, empty message, and null error
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: null,
					filename: "",
					message: "",
				}),
			);

			// 3. ErrorEvent with empty filename and third-party/anonymous stack
			const thirdPartyInlineError = new Error("Injected WKWebView error");
			thirdPartyInlineError.stack = "Error: Injected WKWebView error\n    at @:1:12";
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: thirdPartyInlineError,
					filename: "",
					message: "Injected WKWebView error",
				}),
			);

			expect(Logger.error).not.toHaveBeenCalled();

			// 4. ErrorEvent with empty filename but verifiable first-party stack
			const firstPartyInlineError = new Error("Inline first-party failure");
			firstPartyInlineError.stack = `Error: Inline first-party failure\n    at ${window.location.origin}/src/main.tsx:10:5`;
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: firstPartyInlineError,
					filename: "",
					message: "Inline first-party failure",
				}),
			);

			expect(Logger.error).toHaveBeenCalledTimes(1);
			expect(Logger.error).toHaveBeenCalledWith(
				"Uncaught runtime error:",
				firstPartyInlineError,
			);

			// 5. First-party ErrorEvent with null error (e.g., syntax error) normalizes message to Error instance
			window.dispatchEvent(
				new ErrorEvent("error", {
					error: null,
					filename: "/src/syntaxError.ts",
					message: "Uncaught SyntaxError: Unexpected token",
				}),
			);

			expect(Logger.error).toHaveBeenCalledTimes(2);
			expect(Logger.error).toHaveBeenLastCalledWith(
				"Uncaught runtime error:",
				expect.objectContaining({
					message: "Uncaught SyntaxError: Unexpected token",
				}),
			);
			const lastReportedError = vi.mocked(Logger.error).mock.calls[1]?.[1];
			expect(lastReportedError).toBeInstanceOf(Error);

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

			expect(fetchPlatforms).not.toHaveBeenCalled();
			expect(fetchTechTreeAsync).not.toHaveBeenCalled();
			expect(initializeAnalytics).not.toHaveBeenCalled();
			expect(setupServiceWorkerRegistration).not.toHaveBeenCalled();

			await coordinator.flushDeferredTasks();

			expect(fetchPlatforms).toHaveBeenCalledTimes(1);
			expect(resolveInitialPlatform).toHaveBeenCalledTimes(1);
			expect(fetchTechTreeAsync).toHaveBeenCalledWith("solar");
			expect(initializeAnalytics).toHaveBeenCalledTimes(1);
			expect(setupServiceWorkerRegistration).toHaveBeenCalledTimes(1);
		});

		it("preloadInitialState should no-op when window is undefined", () => {
			vi.stubGlobal("window", undefined);

			preloadInitialState();

			expect(fetchPlatforms).not.toHaveBeenCalled();
			expect(resolveInitialPlatform).not.toHaveBeenCalled();
			expect(fetchTechTreeAsync).not.toHaveBeenCalled();

			vi.unstubAllGlobals();
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

			expect(coordinator2.hasDeferredTask("ga4-analytics")).toBe(false);
			expect(coordinator2.hasDeferredTask("service-worker")).toBe(false);

			await act(async () => {
				res2.unmount();
			});
		});
	});
});
