import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { lifecycleCoordinator } from "./lifecycleCoordinator";
import { hideSplashScreenAndShowBackground } from "./splashScreen";

// Mock the vite-plugin-splash-screen/runtime
vi.mock("vite-plugin-splash-screen/runtime", () => ({
	hideSplashScreen: vi.fn(),
}));

describe("splashScreen", () => {
	beforeEach(() => {
		lifecycleCoordinator.reset();
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

	it("should delegate to lifecycleCoordinator.markReady, hide splash screen, and add background-visible class without app-ready event", async () => {
		const dispatchSpy = vi.spyOn(window, "dispatchEvent");
		const addSpy = vi.spyOn(document.documentElement.classList, "add");
		const markReadySpy = vi.spyOn(lifecycleCoordinator, "markReady");

		await hideSplashScreenAndShowBackground();

		expect(markReadySpy).toHaveBeenCalled();
		expect(addSpy).toHaveBeenCalledWith("background-visible");
		expect(lifecycleCoordinator.isReady()).toBe(true);

		const appReadyEvents = dispatchSpy.mock.calls.filter(
			(call) => call[0].type === "app-ready"
		);
		expect(appReadyEvents).toHaveLength(0);

		markReadySpy.mockRestore();
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

		await hideSplashScreenAndShowBackground();

		// Elements should still be there immediately
		expect(document.getElementById("vpss")).not.toBeNull();

		// Fast forward time
		vi.advanceTimersByTime(1100); // 1.1s to be safe

		// Elements should be gone
		expect(document.getElementById("vpss")).toBeNull();
		expect(document.getElementById("vpss-style")).toBeNull();

		vi.useRealTimers();
	});
});
