import type { RegisterSWOptions } from "virtual:pwa-register"; // Import the type

import * as pwaMockModule from "virtual:pwa-register";
import { vi } from "vitest";

import { Logger } from "@/utils/system/monitoring";

import {
	activateLatestServiceWorker,
	applyStagedServiceWorkerUpdate,
	evictStaleServiceWorkers,
	isAppHiddenOrIdle,
	setLastUserActivityForTesting,
	setupServiceWorkerRegistration,
	verifyStagedUpdateFreshness,
} from "./setupServiceWorker";

// Set up spies on the mock module
const mockRegisterSW = vi.spyOn(pwaMockModule, "registerSW");
const mockUpdateSW = vi.fn();

describe("setupServiceWorkerRegistration", () => {
	let originalServiceWorker: ServiceWorkerContainer | undefined;
	let originalUserAgent: string;

	beforeEach(() => {
		vi.useFakeTimers();
		mockRegisterSW.mockClear();
		mockUpdateSW.mockClear();
		vi.spyOn(window, "dispatchEvent").mockClear(); // Clear dispatchEvent spy

		// Store original globals to restore later
		originalServiceWorker = window.navigator.serviceWorker;
		originalUserAgent = window.navigator.userAgent;

		// Mock navigator.serviceWorker to be present by default for most tests
		Object.defineProperty(window.navigator, "serviceWorker", {
			configurable: true,
			value: {
				getRegistration: vi.fn(), // Mock enough of the ServiceWorkerContainer
				// We don't need a full ServiceWorkerContainer mock for these tests, just its presence
			},
			writable: true,
		});

		// Mock user agent to not be a bot
		Object.defineProperty(window.navigator, "userAgent", {
			configurable: true,
			value: "Test User Agent",
			writable: true,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.resetModules();

		// Restore original globals
		Object.defineProperty(window.navigator, "serviceWorker", {
			configurable: true,
			value: originalServiceWorker,
			writable: true,
		});
		Object.defineProperty(window.navigator, "userAgent", {
			configurable: true,
			value: originalUserAgent,
			writable: true,
		});

		// Clean up any potential global event listeners that might have been added
		// This is a safety measure; vi.resetModules() combined with not importing main.tsx
		// should mostly prevent issues.
		window.removeEventListener("load", () => {}); // A no-op removal, but semantically clear
	});

	it("should not attempt to register service worker if navigator.serviceWorker is not present", async () => {
		// Arrange: Remove serviceWorker from navigator
		Object.defineProperty(window.navigator, "serviceWorker", {
			value: undefined,
			writable: true,
		});

		setupServiceWorkerRegistration();
		await Promise.resolve(); // Ensure queueMicrotask (if any) executes

		// Act: Simulate page load and advance only immediately pending timers
		window.dispatchEvent(new Event("load"));
		vi.runOnlyPendingTimers();

		// Assert: registerSW should not have been called
		expect(mockRegisterSW).not.toHaveBeenCalled();
	});

	it("should not attempt to register service worker if the user is a bot", async () => {
		// Arrange: Set user agent to a known bot
		Object.defineProperty(window.navigator, "userAgent", {
			value: "Googlebot",
			writable: true,
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.runOnlyPendingTimers();

		expect(mockRegisterSW).not.toHaveBeenCalled();
	});

	it("should not attempt to register service worker if window.wrsParams is present", async () => {
		(window as Window & { wrsParams?: unknown }).wrsParams = {};

		try {
			setupServiceWorkerRegistration();
			await Promise.resolve();

			window.dispatchEvent(new Event("load"));
			vi.runOnlyPendingTimers();

			expect(mockRegisterSW).not.toHaveBeenCalled();
		} finally {
			delete (window as Window & { wrsParams?: unknown }).wrsParams;
		}
	});

	it("should log a warning via Logger.warn (and not Logger.error) when onRegisterError is triggered", async () => {
		const warnSpy = vi.spyOn(Logger, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(Logger, "error").mockImplementation(() => {});
		let onRegisterErrorCallback: ((error: unknown) => void) | undefined;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onRegisterError) {
				onRegisterErrorCallback = options.onRegisterError;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		const registrationError = new Error("Rejected");
		onRegisterErrorCallback!(registrationError);

		expect(warnSpy).toHaveBeenCalledWith("Service Worker registration failed", {
			error: registrationError,
		});
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it("should log a warning via Logger.warn (and not Logger.error) when registerSW throws synchronously", async () => {
		const warnSpy = vi.spyOn(Logger, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(Logger, "error").mockImplementation(() => {});
		const registrationError = new Error("Failed to register");

		mockRegisterSW.mockImplementationOnce(() => {
			throw registrationError;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		expect(warnSpy).toHaveBeenCalledWith("Failed to register Service Worker", {
			error: registrationError,
		});
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it("should attempt to register the service worker with immediate: true after the window loads", async () => {
		setupServiceWorkerRegistration();
		await Promise.resolve(); // Ensure queueMicrotask (if any) executes

		// Act
		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000); // Advance timers by 2000ms to trigger the setTimeout
		await vi.runAllTimersAsync(); // Ensure dynamic import and its .then() callback runs

		// Assert
		expect(mockRegisterSW).toHaveBeenCalledTimes(1);
		expect(mockRegisterSW).toHaveBeenCalledWith(
			expect.objectContaining({
				immediate: true,
			}),
		);
	});

	it("should dispatch a 'new-version-available' event when onNeedRefresh is called", async () => {
		let onNeedRefreshCallback: () => void;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onNeedRefresh) {
				onNeedRefreshCallback = options.onNeedRefresh;
			}

			return mockUpdateSW; // Ensure it returns mockUpdateSW
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		// Act: Trigger registration
		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000); // Advance timers by 2000ms to trigger the setTimeout
		await vi.runAllTimersAsync(); // Ensure dynamic import's .then() callback runs

		expect(mockRegisterSW).toHaveBeenCalledTimes(1);
		expect(onNeedRefreshCallback!).toBeDefined();

		// Simulate the onNeedRefresh event from the PWA library
		onNeedRefreshCallback!();

		// Advance timers for the setTimeout(() => dispatchEvent, 0)
		vi.advanceTimersByTime(1);
		await vi.runAllTimersAsync();

		// Assert: Check if the custom event was dispatched
		expect(window.dispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "new-version-available",
			}),
		);

		const call = vi
			.mocked(window.dispatchEvent)
			.mock.calls.find((c) => (c[0] as CustomEvent).type === "new-version-available");
		const event = call![0] as CustomEvent;
		expect(typeof event.detail).toBe("function");

		// Calling detail should trigger mockUpdateSW
		await event.detail(true);
		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should silently apply update without dispatching event when onNeedRefresh is called while document is hidden", async () => {
		let onNeedRefreshCallback: () => void;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onNeedRefresh) {
				onNeedRefreshCallback = options.onNeedRefresh;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		expect(onNeedRefreshCallback!).toBeDefined();

		// Set document to hidden before onNeedRefresh is called
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "hidden",
			writable: true,
		});

		onNeedRefreshCallback!();

		vi.advanceTimersByTime(1);
		await vi.runAllTimersAsync();

		// Should NOT dispatch new-version-available event
		expect(window.dispatchEvent).not.toHaveBeenCalledWith(
			expect.objectContaining({
				type: "new-version-available",
			}),
		);

		// Should have silently called mockUpdateSW(true)
		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should silently apply update when onNeedRefresh is called while document is visible but idle", async () => {
		let onNeedRefreshCallback: () => void;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onNeedRefresh) {
				onNeedRefreshCallback = options.onNeedRefresh;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		expect(onNeedRefreshCallback!).toBeDefined();

		// Document is visible, but user has been idle for 40 minutes (> 30 min threshold)
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "visible",
			writable: true,
		});
		setLastUserActivityForTesting(Date.now() - 40 * 60 * 1000);

		expect(isAppHiddenOrIdle()).toBe(true);

		onNeedRefreshCallback!();

		vi.advanceTimersByTime(1);
		await vi.runAllTimersAsync();

		// Should NOT dispatch new-version-available event
		expect(window.dispatchEvent).not.toHaveBeenCalledWith(
			expect.objectContaining({
				type: "new-version-available",
			}),
		);

		// Should have silently called mockUpdateSW(true)
		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should silently apply waiting update when visibilityState transitions to hidden", async () => {
		let onRegisteredCallback:
			((registration: ServiceWorkerRegistration | undefined) => void) | undefined;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onRegistered) {
				onRegisteredCallback = options.onRegistered;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		const mockWaitingWorker = {} as ServiceWorker;
		const mockRegistration = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
			waiting: mockWaitingWorker,
		} as unknown as ServiceWorkerRegistration;

		onRegisteredCallback!(mockRegistration);

		// Document transitions to hidden with a waiting worker
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "hidden",
			writable: true,
		});
		document.dispatchEvent(new Event("visibilitychange"));

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should have an onOfflineReady callback", async () => {
		let onOfflineReadyCallback: () => void;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onOfflineReady) {
				onOfflineReadyCallback = options.onOfflineReady;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		expect(mockRegisterSW).toHaveBeenCalledTimes(1);
		expect(onOfflineReadyCallback!).toBeDefined();

		// Just verify it doesn't throw
		expect(() => onOfflineReadyCallback!()).not.toThrow();
	});

	it("should trigger registration.update on visibilitychange when visible", async () => {
		let onRegisteredCallback:
			((registration: ServiceWorkerRegistration | undefined) => void) | undefined;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onRegistered) {
				onRegisteredCallback = options.onRegistered;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		expect(onRegisteredCallback).toBeDefined();

		const mockRegistration = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
		} as unknown as ServiceWorkerRegistration;

		onRegisteredCallback!(mockRegistration);

		// When document is hidden, visibilitychange should NOT call update
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "hidden",
			writable: true,
		});
		document.dispatchEvent(new Event("visibilitychange"));
		expect(mockRegistration.update).not.toHaveBeenCalled();

		// When document is visible, visibilitychange should call update
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			value: "visible",
			writable: true,
		});
		document.dispatchEvent(new Event("visibilitychange"));
		expect(mockRegistration.update).toHaveBeenCalledTimes(1);
	});

	it("should periodically check for updates once per hour", async () => {
		let onRegisteredCallback:
			((registration: ServiceWorkerRegistration | undefined) => void) | undefined;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onRegistered) {
				onRegisteredCallback = options.onRegistered;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		const mockRegistration = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
		} as unknown as ServiceWorkerRegistration;

		onRegisteredCallback!(mockRegistration);

		// Advance by 30 minutes: should not trigger update
		vi.advanceTimersByTime(30 * 60 * 1000);
		expect(mockRegistration.update).not.toHaveBeenCalled();

		// Advance by another 30 minutes (1 hour total): should trigger update
		vi.advanceTimersByTime(30 * 60 * 1000);
		expect(mockRegistration.update).toHaveBeenCalledTimes(1);
	});

	const runWithForegroundNeedReload = async (
		assertion: (ctx: {
			mockReload: ReturnType<typeof vi.fn>;
			onNeedRefresh: () => void;
			onNeedReload: () => void;
		}) => Promise<void> | void,
	) => {
		const originalLocation = window.location;
		const mockReload = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...originalLocation, reload: mockReload },
			writable: true,
		});

		try {
			let onNeedRefreshCallback: (() => void) | undefined;
			let onNeedReloadCallback: (() => void) | undefined;

			mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
				onNeedRefreshCallback = options?.onNeedRefresh as (() => void) | undefined;
				onNeedReloadCallback = options?.onNeedReload;

				return mockUpdateSW;
			});

			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "visible",
				writable: true,
			});
			setLastUserActivityForTesting(Date.now());

			setupServiceWorkerRegistration();
			window.dispatchEvent(new Event("load"));
			vi.advanceTimersByTime(2000);
			await vi.runAllTimersAsync();

			expect(onNeedRefreshCallback).toBeDefined();
			expect(onNeedReloadCallback).toBeDefined();

			await assertion({
				mockReload,
				onNeedRefresh: onNeedRefreshCallback!,
				onNeedReload: onNeedReloadCallback!,
			});
		} finally {
			Object.defineProperty(window, "location", {
				configurable: true,
				value: originalLocation,
				writable: true,
			});
		}
	};

	it("should NOT reload the page when onNeedReload fires after updateSW(false) is called", async () => {
		await runWithForegroundNeedReload(async ({ mockReload, onNeedRefresh, onNeedReload }) => {
			onNeedRefresh();
			vi.advanceTimersByTime(1);
			await vi.runAllTimersAsync();

			const call = vi
				.mocked(window.dispatchEvent)
				.mock.calls.find((c) => (c[0] as CustomEvent).type === "new-version-available");
			const event = call![0] as CustomEvent<(reload?: boolean) => Promise<void>>;

			await event.detail(false);
			expect(mockUpdateSW).toHaveBeenCalledWith(false);

			onNeedReload();
			expect(mockReload).not.toHaveBeenCalled();
		});
	});

	it("should reload the page when onNeedReload fires after updateSW(true) is called", async () => {
		await runWithForegroundNeedReload(async ({ mockReload, onNeedRefresh, onNeedReload }) => {
			onNeedRefresh();
			vi.advanceTimersByTime(1);
			await vi.runAllTimersAsync();

			const call = vi
				.mocked(window.dispatchEvent)
				.mock.calls.find((c) => (c[0] as CustomEvent).type === "new-version-available");
			const event = call![0] as CustomEvent<(reload?: boolean) => Promise<void>>;

			await event.detail(true);
			expect(mockUpdateSW).toHaveBeenCalledWith(true);

			onNeedReload();
			expect(mockReload).toHaveBeenCalledTimes(1);
		});
	});

	it("should NOT reload an active foreground tab when another tab triggers Silent Background Activation", async () => {
		await runWithForegroundNeedReload(async ({ mockReload, onNeedRefresh, onNeedReload }) => {
			onNeedRefresh();
			vi.advanceTimersByTime(1);
			await vi.runAllTimersAsync();

			onNeedReload();
			expect(mockReload).not.toHaveBeenCalled();
		});
	});
});

describe("activateLatestServiceWorker", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("should immediately invoke updateSW when no newer worker is installing on server", async () => {
		const mockUpdate = vi.fn().mockResolvedValue(undefined);
		const mockReg = {
			installing: null,
			update: mockUpdate,
		} as unknown as ServiceWorkerRegistration;
		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg);
		await vi.runAllTimersAsync();
		await promise;

		expect(mockUpdate).toHaveBeenCalledTimes(1);
		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should wait for installing worker to reach installed state before calling updateSW", async () => {
		let stateChangeCallback: (() => void) | undefined;
		const mockWorker = {
			addEventListener: vi.fn((event: string, cb: () => void) => {
				if (event === "statechange") {
					stateChangeCallback = cb;
				}
			}),
			state: "installing",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: mockWorker,
			update: vi.fn().mockImplementation(async () => {
				// Simulates network update finding a newer worker
			}),
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		let resolved = false;
		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg).then(() => {
			resolved = true;
		});

		await Promise.resolve(); // Let initial microtasks run
		expect(mockUpdateSW).not.toHaveBeenCalled();
		expect(resolved).toBe(false);

		// Now simulate state transition to "installed"
		Object.defineProperty(mockWorker, "state", { value: "installed", writable: true });
		stateChangeCallback?.();

		await promise;
		expect(resolved).toBe(true);
		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should fall back to calling updateSW if installing worker takes longer than timeout", async () => {
		const mockWorker = {
			addEventListener: vi.fn(),
			state: "installing",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: mockWorker,
			update: vi.fn().mockResolvedValue(undefined),
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg, 2000);

		// Advance past timeout
		vi.advanceTimersByTime(2001);
		await vi.runAllTimersAsync();
		await promise;

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should resolve immediately if installing worker is already in installed state upon inspection", async () => {
		const mockWorker = {
			addEventListener: vi.fn(),
			state: "installed",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: mockWorker,
			update: vi.fn().mockResolvedValue(undefined),
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		await activateLatestServiceWorker(mockUpdateSW, mockReg);

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should fall back to calling updateSW if registration.update hangs past timeout", async () => {
		const mockReg = {
			installing: null,
			update: vi.fn().mockImplementation(() => new Promise(() => {})), // never resolves
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg, 2000);

		vi.advanceTimersByTime(2001);
		await vi.runAllTimersAsync();
		await promise;

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should safely fall back to updateSW if registration.update throws an error", async () => {
		const mockReg = {
			installing: null,
			update: vi.fn().mockRejectedValue(new Error("Network failed")),
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		await activateLatestServiceWorker(mockUpdateSW, mockReg);

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
	});

	it("should fall back to location.reload if updateSW is not provided", async () => {
		const originalLocation = window.location;
		const mockReload = vi.fn();

		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...originalLocation, reload: mockReload },
			writable: true,
		});

		try {
			await activateLatestServiceWorker();
			expect(mockReload).toHaveBeenCalled();
		} finally {
			Object.defineProperty(window, "location", {
				configurable: true,
				value: originalLocation,
				writable: true,
			});
		}
	});

	it("should wait for waiting worker to reach activated state when waiting worker exists", async () => {
		let stateChangeCallback: (() => void) | undefined;
		const mockWaitingWorker = {
			addEventListener: vi.fn((event: string, cb: () => void) => {
				if (event === "statechange") {
					stateChangeCallback = cb;
				}
			}),
			removeEventListener: vi.fn(),
			state: "installed",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
			waiting: mockWaitingWorker,
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		let resolved = false;
		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg).then(() => {
			resolved = true;
		});

		await vi.waitFor(() => {
			expect(mockUpdateSW).toHaveBeenCalledWith(true);
		});
		expect(resolved).toBe(false);

		// Simulate transition to activated
		Object.defineProperty(mockWaitingWorker, "state", { value: "activated", writable: true });
		stateChangeCallback?.();

		await promise;
		expect(resolved).toBe(true);
	});

	it("should resolve immediately if waiting worker is already in activated state", async () => {
		const mockWaitingWorker = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			state: "activated",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
			waiting: mockWaitingWorker,
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		await activateLatestServiceWorker(mockUpdateSW, mockReg);

		expect(mockUpdateSW).toHaveBeenCalledWith(true);
		expect(mockWaitingWorker.addEventListener).not.toHaveBeenCalled();
	});

	it("should resolve when waiting worker transitions to redundant state", async () => {
		let stateChangeCallback: (() => void) | undefined;
		const mockWaitingWorker = {
			addEventListener: vi.fn((event: string, cb: () => void) => {
				if (event === "statechange") {
					stateChangeCallback = cb;
				}
			}),
			removeEventListener: vi.fn(),
			state: "installed",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
			waiting: mockWaitingWorker,
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		let resolved = false;
		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg).then(() => {
			resolved = true;
		});

		await vi.waitFor(() => {
			expect(mockUpdateSW).toHaveBeenCalledWith(true);
		});
		expect(resolved).toBe(false);

		// Simulate transition to redundant
		Object.defineProperty(mockWaitingWorker, "state", { value: "redundant", writable: true });
		stateChangeCallback?.();

		await promise;
		expect(resolved).toBe(true);
		expect(mockWaitingWorker.removeEventListener).toHaveBeenCalledWith(
			"statechange",
			expect.any(Function),
		);
	});

	it("should resolve after timeout and clean up event listener if waiting worker does not activate", async () => {
		const mockWaitingWorker = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			state: "installed",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
			waiting: mockWaitingWorker,
		} as unknown as ServiceWorkerRegistration;

		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);

		const promise = activateLatestServiceWorker(mockUpdateSW, mockReg);

		vi.advanceTimersByTime(1501);
		await vi.runAllTimersAsync();
		await promise;

		expect(mockWaitingWorker.removeEventListener).toHaveBeenCalledWith(
			"statechange",
			expect.any(Function),
		);
	});

	it("should post SKIP_WAITING and reload window when waiting worker exists but updateSW is not provided", async () => {
		const originalLocation = window.location;
		const mockReload = vi.fn();

		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...originalLocation, reload: mockReload },
			writable: true,
		});

		const mockWaitingWorker = {
			addEventListener: vi.fn(),
			postMessage: vi.fn(),
			removeEventListener: vi.fn(),
			state: "activated",
		} as unknown as ServiceWorker;

		const mockReg = {
			installing: null,
			update: vi.fn().mockResolvedValue(undefined),
			waiting: mockWaitingWorker,
		} as unknown as ServiceWorkerRegistration;

		try {
			await activateLatestServiceWorker(undefined, mockReg);
			expect(mockReload).toHaveBeenCalled();
		} finally {
			Object.defineProperty(window, "location", {
				configurable: true,
				value: originalLocation,
				writable: true,
			});
		}
	});
});

describe("evictStaleServiceWorkers", () => {
	let originalServiceWorker: ServiceWorkerContainer | undefined;
	let originalCaches: CacheStorage | undefined;

	beforeEach(() => {
		originalServiceWorker = window.navigator.serviceWorker;
		originalCaches = window.caches;
	});

	afterEach(() => {
		vi.restoreAllMocks();
		Object.defineProperty(window.navigator, "serviceWorker", {
			configurable: true,
			value: originalServiceWorker,
			writable: true,
		});
		Object.defineProperty(window, "caches", {
			configurable: true,
			value: originalCaches,
			writable: true,
		});
	});

	it("should unregister all active service worker registrations and purge CacheStorage", async () => {
		const mockUnregister1 = vi.fn().mockResolvedValue(true);
		const mockUnregister2 = vi.fn().mockResolvedValue(true);
		const mockReg1 = { unregister: mockUnregister1 } as unknown as ServiceWorkerRegistration;
		const mockReg2 = { unregister: mockUnregister2 } as unknown as ServiceWorkerRegistration;

		const mockGetRegistrations = vi.fn().mockResolvedValue([mockReg1, mockReg2]);
		Object.defineProperty(window.navigator, "serviceWorker", {
			configurable: true,
			value: { getRegistrations: mockGetRegistrations },
			writable: true,
		});

		const mockCacheDelete = vi.fn().mockResolvedValue(true);
		const mockCacheKeys = vi.fn().mockResolvedValue(["cache-v1", "cache-v2"]);
		Object.defineProperty(window, "caches", {
			configurable: true,
			value: { delete: mockCacheDelete, keys: mockCacheKeys },
			writable: true,
		});

		const result = await evictStaleServiceWorkers();

		expect(result).toBe(true);
		expect(mockGetRegistrations).toHaveBeenCalled();
		expect(mockUnregister1).toHaveBeenCalled();
		expect(mockUnregister2).toHaveBeenCalled();
		expect(mockCacheKeys).toHaveBeenCalled();
		expect(mockCacheDelete).toHaveBeenCalledWith("cache-v1");
		expect(mockCacheDelete).toHaveBeenCalledWith("cache-v2");
	});

	it("should return false when no service worker registrations exist", async () => {
		const mockGetRegistrations = vi.fn().mockResolvedValue([]);
		Object.defineProperty(window.navigator, "serviceWorker", {
			configurable: true,
			value: { getRegistrations: mockGetRegistrations },
			writable: true,
		});

		const mockCacheDelete = vi.fn().mockResolvedValue(true);
		const mockCacheKeys = vi.fn().mockResolvedValue([]);
		Object.defineProperty(window, "caches", {
			configurable: true,
			value: { delete: mockCacheDelete, keys: mockCacheKeys },
			writable: true,
		});

		const result = await evictStaleServiceWorkers();

		expect(result).toBe(false);
	});

	it("should handle unregister and cache errors gracefully without throwing", async () => {
		const warnSpy = vi.spyOn(Logger, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(Logger, "error").mockImplementation(() => {});
		const unregisterError = new Error("SecurityError");
		const cacheError = new Error("Cache access denied");

		const mockGetRegistrations = vi.fn().mockRejectedValue(unregisterError);
		Object.defineProperty(window.navigator, "serviceWorker", {
			configurable: true,
			value: { getRegistrations: mockGetRegistrations },
			writable: true,
		});

		const mockCacheKeys = vi.fn().mockRejectedValue(cacheError);
		Object.defineProperty(window, "caches", {
			configurable: true,
			value: { keys: mockCacheKeys },
			writable: true,
		});

		const result = await evictStaleServiceWorkers();

		expect(result).toBe(false);
		expect(warnSpy).toHaveBeenCalledWith(
			"Failed to unregister service workers during eviction",
			{ error: unregisterError },
		);
		expect(warnSpy).toHaveBeenCalledWith("Failed to delete cache storage during eviction", {
			error: cacheError,
		});
		expect(errorSpy).not.toHaveBeenCalled();
	});
});

describe("verifyStagedUpdateFreshness", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
		vi.spyOn(Logger, "info").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("returns true and does not call updateSW when version.json indicates a newer release", async () => {
		const mockUpdateSW = vi.fn();
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					buildDate: "newer-date",
					version: "newer-version",
				}),
				{ status: 200 },
			),
		);

		const shouldPrompt = await verifyStagedUpdateFreshness(mockUpdateSW);

		expect(shouldPrompt).toBe(true);
		expect(mockUpdateSW).not.toHaveBeenCalled();
	});

	it("returns false and triggers Silent Background Activation updateSW(false) when version.json matches current build", async () => {
		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					buildDate: "test-date",
					version: "test-version",
				}),
				{ status: 200 },
			),
		);

		const shouldPrompt = await verifyStagedUpdateFreshness(mockUpdateSW);

		expect(shouldPrompt).toBe(false);
		expect(mockUpdateSW).toHaveBeenCalledWith(false);
	});

	it("returns true on network error or missing version fields as a fail-safe and logs via Logger.warn", async () => {
		const warnSpy = vi.spyOn(Logger, "warn").mockImplementation(() => {});
		const errorSpy = vi.spyOn(Logger, "error").mockImplementation(() => {});
		const mockUpdateSW = vi.fn();
		const offlineError = new Error("Offline");
		vi.mocked(globalThis.fetch).mockRejectedValueOnce(offlineError);

		await expect(verifyStagedUpdateFreshness(mockUpdateSW)).resolves.toBe(true);
		expect(warnSpy).toHaveBeenCalledWith(
			"Failed to verify version freshness; falling back to prompt",
			{ error: offlineError },
		);

		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({}), { status: 200 }),
		);

		await expect(verifyStagedUpdateFreshness(mockUpdateSW)).resolves.toBe(true);
		expect(warnSpy).toHaveBeenCalledTimes(2);
		expect(errorSpy).not.toHaveBeenCalled();
	});
});

describe("applyStagedServiceWorkerUpdate", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("invokes activateLatestServiceWorker and schedules 2.5s fallback reload", async () => {
		const originalLocation = window.location;
		const mockReload = vi.fn();

		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...originalLocation, reload: mockReload },
			writable: true,
		});

		try {
			const mockUpdateSW = vi.fn().mockResolvedValue(undefined);
			await applyStagedServiceWorkerUpdate(mockUpdateSW);

			expect(mockUpdateSW).toHaveBeenCalledWith(true);
			expect(mockReload).not.toHaveBeenCalled();

			vi.advanceTimersByTime(2500);
			expect(mockReload).toHaveBeenCalledTimes(1);
		} finally {
			Object.defineProperty(window, "location", {
				configurable: true,
				value: originalLocation,
				writable: true,
			});
		}
	});

	it("evicts stale service workers and caches and reloads when activation rejects", async () => {
		const originalLocation = window.location;
		const originalServiceWorker = navigator.serviceWorker;
		const originalCaches = window.caches;
		const mockReload = vi.fn();
		const mockUnregister = vi.fn().mockResolvedValue(true);
		const mockCacheDelete = vi.fn().mockResolvedValue(true);

		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...originalLocation, reload: mockReload },
			writable: true,
		});
		Object.defineProperty(navigator, "serviceWorker", {
			configurable: true,
			value: {
				getRegistration: vi.fn().mockResolvedValue(undefined),
				getRegistrations: vi.fn().mockResolvedValue([{ unregister: mockUnregister }]),
			},
			writable: true,
		});
		Object.defineProperty(window, "caches", {
			configurable: true,
			value: {
				delete: mockCacheDelete,
				keys: vi.fn().mockResolvedValue(["workbox-precache-v2"]),
			},
			writable: true,
		});

		try {
			const mockUpdateSW = vi.fn().mockRejectedValue(new Error("Activation failed"));
			await applyStagedServiceWorkerUpdate(mockUpdateSW);

			expect(mockUnregister).toHaveBeenCalledTimes(1);
			expect(mockCacheDelete).toHaveBeenCalledWith("workbox-precache-v2");
			expect(mockReload).toHaveBeenCalledTimes(1);
		} finally {
			Object.defineProperty(window, "location", {
				configurable: true,
				value: originalLocation,
				writable: true,
			});
			Object.defineProperty(navigator, "serviceWorker", {
				configurable: true,
				value: originalServiceWorker,
				writable: true,
			});
			Object.defineProperty(window, "caches", {
				configurable: true,
				value: originalCaches,
				writable: true,
			});
		}
	});
});
