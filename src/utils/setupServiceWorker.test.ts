import type { RegisterSWOptions } from "virtual:pwa-register"; // Import the type

import * as pwaMockModule from "virtual:pwa-register";
import { vi } from "vitest";

import { setupServiceWorkerRegistration } from "./setupServiceWorker";

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
			writable: true,
			value: {
				getRegistration: vi.fn(), // Mock enough of the ServiceWorkerContainer
				// We don't need a full ServiceWorkerContainer mock for these tests, just its presence
			},
		});

		// Mock user agent to not be a bot
		Object.defineProperty(window.navigator, "userAgent", {
			writable: true,
			value: "Test User Agent",
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.resetModules();

		// Restore original globals
		Object.defineProperty(window.navigator, "serviceWorker", {
			writable: true,
			value: originalServiceWorker,
		});
		Object.defineProperty(window.navigator, "userAgent", {
			writable: true,
			value: originalUserAgent,
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

	it("should attempt to register the service worker after the window loads", async () => {
		setupServiceWorkerRegistration();
		await Promise.resolve(); // Ensure queueMicrotask (if any) executes

		// Act
		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000); // Advance timers by 2000ms to trigger the setTimeout
		await vi.runAllTimersAsync(); // Ensure dynamic import and its .then() callback runs

		// Assert
		expect(mockRegisterSW).toHaveBeenCalledTimes(1);
	});

	it("should dispatch a 'new-version-available' event when onNeedRefresh is called", async () => {
		let onNeedRefreshCallback: (
			updateServiceWorker: (reloadPage?: boolean) => Promise<void>
		) => void;

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
		await onNeedRefreshCallback!(vi.fn());

		// Assert: Check if the custom event was dispatched
		expect(window.dispatchEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "new-version-available",
				detail: mockUpdateSW, // Assert that the detail is the mockUpdateSW function
			})
		);
	});

	it("should log to console when onOfflineReady is called", async () => {
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		let onOfflineReadyCallback: () => void;

		mockRegisterSW.mockImplementationOnce((options?: RegisterSWOptions) => {
			if (options?.onOfflineReady) {
				onOfflineReadyCallback = options.onOfflineReady;
			}

			return mockUpdateSW;
		});

		setupServiceWorkerRegistration();
		await Promise.resolve();

		// Act
		window.dispatchEvent(new Event("load"));
		vi.advanceTimersByTime(2000);
		await vi.runAllTimersAsync();

		expect(mockRegisterSW).toHaveBeenCalledTimes(1);
		expect(onOfflineReadyCallback!).toBeDefined();

		onOfflineReadyCallback!();

		// Assert
		expect(consoleLogSpy).toHaveBeenCalledWith("App is ready to work offline");
		consoleLogSpy.mockRestore();
	});
});
