import { expect, test } from "@playwright/test";

/**
 * Application Resilience & Recovery Tests
 *
 * Tests the vite:preloadError recovery flow:
 * 1. First chunk failure → auto-reload via window.name marker
 * 2. Second chunk failure → redirect to static /500.html
 * 3. /500.html "Hard Reset" button → clears SW + caches, reloads
 *
 * The mechanism uses window.name ("__preload_recovery__") as a reload marker
 * because it survives page reloads and works in incognito/restricted browsers.
 */
test.describe("Application Resilience & Recovery", () => {
	test.beforeEach(async ({ page }) => {
		// Suppress welcome dialog via localStorage to avoid race conditions with mocks
		await page.addInitScript(() => {
			localStorage.setItem("user-visited", "true");
		});
	});

	test.describe("Preload error recovery cycle", () => {
		test("should auto-reload once on first chunk failure, then redirect to 500.html on second", async ({
			page,
		}) => {
			// Block all Vite-generated JS chunks under /assets/
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({
					status: 404,
					contentType: "application/javascript",
					body: "/* Mock 404 */",
				});
			});

			await page.goto("/");

			// The flow is: load → chunk fails → set marker + reload → chunk fails again → redirect to 500.html
			await page.waitForURL("**/500.html*", { timeout: 30000 });

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible({ timeout: 15000 });

			const refreshButton = page.locator("button", { hasText: "Hard Reset & Refresh" });
			await expect(refreshButton).toBeVisible();
		});

		test("should clear window.name marker after redirect to 500.html", async ({ page }) => {
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");
			await page.waitForURL("**/500.html*", { timeout: 30000 });

			// After redirect, the marker should have been cleared by the index.html handler
			const windowName = await page.evaluate(() => window.name);
			expect(windowName).not.toContain("__preload_recovery__");
		});

		test("reset button should clear caches and reload to root", async ({ page }) => {
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");
			await page.waitForURL("**/500.html*", { timeout: 30000 });

			const refreshButton = page.locator("button", { hasText: "Hard Reset & Refresh" });
			await expect(refreshButton).toBeVisible({ timeout: 15000 });

			// Unblock assets before clicking reset so the app can actually load
			await page.unroute("**/assets/*.js");

			await refreshButton.click();

			// 500.html redirects to /?reload=<timestamp>
			await page.waitForURL(/\/\?reload=\d+/, { timeout: 15000 });
		});
	});

	test.describe("False positive prevention", () => {
		test("should NOT trigger recovery when a third-party script fails", async ({ page }) => {
			// Block a third-party analytics script (common with ad-blockers)
			await page.route("**/www.googletagmanager.com/**", async (route) => {
				await route.abort("blockedbyclient");
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });

			// Verify app loaded normally — no redirect to 500.html
			expect(page.url()).not.toContain("500.html");
		});

		test("should NOT trigger recovery when a non-asset same-origin resource fails", async ({
			page,
		}) => {
			// Inject a failing non-asset script (not under /assets/)
			await page.addInitScript(() => {
				const script = document.createElement("script");
				script.src = "/some-random-path/widget.js";
				document.head.appendChild(script);
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });
			expect(page.url()).not.toContain("500.html");
		});

		test("should NOT trigger recovery when a preload fetch link fails", async ({ page }) => {
			// Block the translation preload (rel=preload, as=fetch)
			await page.route("**/assets/locales/**", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });
			expect(page.url()).not.toContain("500.html");
		});

		test("should NOT trigger recovery when favicon or manifest fails", async ({ page }) => {
			await page.route("**/favicon*", async (route) => {
				await route.fulfill({ status: 404 });
			});
			await page.route("**/manifest*", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });
			expect(page.url()).not.toContain("500.html");
		});
	});

	test.describe("Successful boot cleanup", () => {
		test("should clear __preload_recovery__ marker from window.name after successful boot", async ({
			page,
		}) => {
			// Pre-set the marker as if a previous recovery reload occurred
			await page.addInitScript(() => {
				window.name = "__preload_recovery__";
			});

			await page.goto("/");

			// Wait for the app-ready event to fire (which clears the marker)
			await page.waitForFunction(
				() => (window as typeof window & { __APP_READY__?: boolean }).__APP_READY__,
				{ timeout: 30000 }
			);

			const windowName = await page.evaluate(() => window.name);
			expect(windowName).not.toContain("__preload_recovery__");
		});
	});

	test.describe("Network Throttling", () => {
		test("should load successfully on a slow 3G connection", async ({ page }) => {
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
});
