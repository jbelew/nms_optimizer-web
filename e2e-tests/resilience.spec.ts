import { expect, test } from "@playwright/test";

/**
 * Application Resilience & Recovery Tests
 *
 * Tests the vite:preloadError recovery flow implemented in index.html:
 * 1. First chunk failure → auto-reload via window.name marker ("__preload_recovery__")
 * 2. Second chunk failure → redirect to static /500.html
 */
test.describe("Application Resilience & Recovery", () => {
	const MARKER = "__preload_recovery__";

	test.beforeEach(async ({ page }) => {
		// Suppress welcome dialog via localStorage
		await page.addInitScript(() => {
			localStorage.setItem("user-visited", "true");
		});
	});

	test.describe("Preload error recovery cycle", () => {
		test("should auto-reload once on first chunk failure", async ({ page }) => {
			// 1. Initial successful load
			await page.goto("/");
			await page.waitForFunction(() => (window as any).__APP_READY__, { timeout: 30000 });

			// 2. Setup marker detection trap
			await page.addInitScript((m) => {
				if (sessionStorage.getItem(m)) {
					(window as any).__MARKER_DETECTED__ = true;
				}
			}, MARKER);

			// 3. Manually dispatch vite:preloadError to simulate a dynamic import failure
			// This is build-agnostic and robust in CI.
			await Promise.all([
				page.waitForNavigation({ waitUntil: "commit" }),
				page.evaluate(() => {
					const event = new Event("vite:preloadError");
					window.dispatchEvent(event);
				}),
			]);

			// 4. Wait for our trap to trigger on the reloaded page
			await page.waitForFunction(() => (window as any).__MARKER_DETECTED__ === true, {
				timeout: 15000,
			});

			expect(await page.evaluate(() => (window as any).__MARKER_DETECTED__)).toBe(true);
		});

		test("should redirect to 500.html on second chunk failure", async ({ page }) => {
			// 1. Initial load
			await page.goto("/");
			await page.waitForFunction(() => (window as any).__APP_READY__, { timeout: 30000 });

			// 2. Set marker manually to simulate a previous recovery reload
			await page.evaluate((m) => {
				sessionStorage.setItem(m, "1");
			}, MARKER);

			// 3. Dispatch vite:preloadError - should redirect to 500.html because marker is present
			await Promise.all([
				page.waitForURL("**/500.html*", { timeout: 15000 }),
				page.evaluate(() => {
					const event = new Event("vite:preloadError");
					window.dispatchEvent(event);
				}),
			]);

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();

			// 4. Verify that the marker was cleared by index.html before redirect
			const markerValue = await page.evaluate((m) => sessionStorage.getItem(m), MARKER);
			expect(markerValue).toBeNull();
		});

		test("reset button should clear caches and reload to root", async ({ page }) => {
			await page.goto("/500.html");
			const refreshButton = page.locator("button", { hasText: "Hard Reset & Refresh" });
			await expect(refreshButton).toBeVisible();

			await refreshButton.click();

			// 500.html redirects to /?reload=<timestamp>
			await page.waitForURL(/\/\?reload=\d+/, { timeout: 15000 });
		});
	});

	test.describe("False positive prevention", () => {
		test("should NOT trigger recovery when a third-party script fails", async ({ page }) => {
			await page.route("**/www.googletagmanager.com/**", async (route) => {
				await route.abort("blockedbyclient");
			});

			await page.goto("/");

			// Verify app loaded normally - no redirect to 500.html
			expect(page.url()).not.toContain("500.html");

			// Verify marker is still empty
			const markerValue = await page.evaluate((m) => sessionStorage.getItem(m), MARKER);
			expect(markerValue).toBeNull();
		});
	});

	test.describe("Network Throttling", () => {
		test("should load successfully on a slow 3G connection", async ({ page, browserName }) => {
			test.skip(browserName !== "chromium", "CDP session is only available in Chromium");

			const client = await page.context().newCDPSession(page);
			await client.send("Network.emulateNetworkConditions", {
				offline: false,
				downloadThroughput: (800 * 1024) / 8,
				uploadThroughput: (400 * 1024) / 8,
				latency: 200,
			});

			await page.goto("/", { timeout: 60000 });

			await page.waitForFunction(
				() => (window as typeof window & { __APP_READY__?: boolean }).__APP_READY__,
				{ timeout: 30000 }
			);

			const grid = page.locator(".gridTable");
			await expect(grid).toBeVisible();
		});
	});

	test.describe("Successful boot cleanup", () => {
		test("should clear MARKER from sessionStorage after successful boot", async ({ page }) => {
			await page.addInitScript((marker) => {
				sessionStorage.setItem(marker, "1");
			}, MARKER);

			await page.goto("/");

			await page.waitForFunction(
				() => (window as typeof window & { __APP_READY__?: boolean }).__APP_READY__,
				{ timeout: 30000 }
			);

			const markerValue = await page.evaluate((m) => sessionStorage.getItem(m), MARKER);
			expect(markerValue).toBeNull();
		});
	});
});
