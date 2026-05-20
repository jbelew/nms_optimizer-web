import type * as splashModuleType from "./splashScreen";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the vite-plugin-splash-screen/runtime
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

describe("splashScreen", () => {
	let splashModule: typeof splashModuleType;

	beforeEach(async () => {
		vi.resetModules();
		splashModule = await import("./splashScreen");

		vi.clearAllMocks();
		document.documentElement.classList.remove("background-visible");
		document.getElementById("vpss")?.remove();
		document.getElementById("vpss-style")?.remove();

		// Mock requestAnimationFrame to execute immediately
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
			cb(0);

			return 0;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should hide splash screen and add background-visible class", async () => {
		const dispatchSpy = vi.spyOn(window, "dispatchEvent");
		const addSpy = vi.spyOn(document.documentElement.classList, "add");

		await splashModule.hideSplashScreenAndShowBackground();

		expect(dispatchSpy).toHaveBeenCalled();
		expect(dispatchSpy.mock.calls.find((call) => call[0].type === "app-ready")).toBeDefined();
		expect(addSpy).toHaveBeenCalledWith("background-visible");
	});

	it("should remove vpss elements from DOM after delay", async () => {
		vi.useFakeTimers();

		// Create mock elements
		const vpss = document.createElement("div");
		vpss.id = "vpss";
		document.body.appendChild(vpss);

		const vpssStyle = document.createElement("style");
		vpssStyle.id = "vpss-style";
		document.body.appendChild(vpssStyle);

		await splashModule.hideSplashScreenAndShowBackground();

		// Elements should still be there immediately
		expect(document.getElementById("vpss")).not.toBeNull();

		// Fast forward time
		vi.advanceTimersByTime(1100); // 1.1s to be safe

		// Elements should be gone
		expect(document.getElementById("vpss")).toBeNull();
		expect(document.getElementById("vpss-style")).toBeNull();

		vi.useRealTimers();
	});

	it("should not execute multiple times if already hiding", async () => {
		const dispatchSpy = vi.spyOn(window, "dispatchEvent");

		// First call
		await splashModule.hideSplashScreenAndShowBackground();
		expect(dispatchSpy).toHaveBeenCalled();
		const firstCallCount = dispatchSpy.mock.calls.filter(
			(c) => c[0].type === "app-ready"
		).length;
		expect(firstCallCount).toBe(1);

		// Second call should be ignored
		await splashModule.hideSplashScreenAndShowBackground();
		const secondCallCount = dispatchSpy.mock.calls.filter(
			(c) => c[0].type === "app-ready"
		).length;
		expect(secondCallCount).toBe(1);
	});
});
