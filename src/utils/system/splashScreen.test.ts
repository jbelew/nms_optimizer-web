import fs from "node:fs";
import path from "node:path";
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

	it("should not pre-populate background-visible on html or body in index.html to prevent background flash before splash screen", () => {
		const indexHtml = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
		const htmlTagMatch = indexHtml.match(/<html[^>]*>/i);
		const bodyTagMatch = indexHtml.match(/<body[^>]*>/i);

		expect(htmlTagMatch?.[0]).toBeDefined();
		expect(htmlTagMatch?.[0]).not.toContain("background-visible");
		expect(bodyTagMatch?.[0]).toBeDefined();
		expect(bodyTagMatch?.[0]).not.toContain("background-visible");
	});

	it("should include responsive background image styles on standalone static error pages", () => {
		for (const file of ["public/404.html", "public/500.html", "public/maintenance.html"]) {
			const html = fs.readFileSync(path.resolve(process.cwd(), file), "utf-8");

			expect(html).toContain("/assets/img/background.webp");
			expect(html).toContain("/assets/img/background@2x.webp");
			expect(html).toContain("/assets/img/background@mobile-blurred.webp");
		}
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
