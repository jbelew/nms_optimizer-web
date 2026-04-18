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
	// NotFound chunk for manual trigger of dynamic import failure
	const NOT_FOUND_CHUNK = "**/build/chunk-BwoAAUUD2.js";

	test.beforeEach(async ({ page }) => {
		// Suppress welcome dialog via localStorage
		await page.addInitScript(() => {
			localStorage.setItem("user-visited", "true");
		});
	});

	test.describe("Preload error recovery cycle", () => {
		test("should auto-reload once on first chunk failure", async ({ page }) => {
			// 1. Initial successful load to ensure app is alive
			await page.goto("/");
			await page.waitForFunction(() => (window as any).__APP_READY__, { timeout: 30000 });

			// 2. Trap the marker setting via init script for the NEXT navigation
			// This catches the marker before main.tsx clears it
			await page.addInitScript((m) => {
				if (window.name.includes(m)) {
					(window as any).__MARKER_DETECTED__ = true;
				}
			}, MARKER);

			// 3. Block a lazy-loaded chunk (NotFound)
			await page.route(NOT_FOUND_CHUNK, async (route) => {
				await route.fulfill({ status: 404 });
			});

			// 4. Trigger the dynamic import failure by navigating to a non-existent path
			// We don't await because we expect a reload triggered by index.html
			page.evaluate(() => {
				// @ts-ignore - navigation API
				window.navigation.navigate("/trigger-failure");
			}).catch(() => {});
			
			// 5. Wait for our trap to trigger on the reloaded page
			await page.waitForFunction(() => (window as any).__MARKER_DETECTED__ === true, { timeout: 15000 });

			expect(await page.evaluate(() => (window as any).__MARKER_DETECTED__)).toBe(true);
		});

		test("should redirect to 500.html on second chunk failure", async ({ page }) => {
			// 1. Initial load
			await page.goto("/");
			await page.waitForFunction(() => (window as any).__APP_READY__, { timeout: 30000 });

			// 2. Block the chunk
			await page.route(NOT_FOUND_CHUNK, async (route) => {
				await route.fulfill({ status: 404 });
			});

			// 3. Set marker manually to simulate a previous recovery reload
			await page.evaluate((m) => { window.name = m; }, MARKER);

			// 4. Trigger failure - should redirect to 500.html because marker is present
			page.evaluate(() => {
				// @ts-ignore - navigation API
				window.navigation.navigate("/trigger-failure-2");
			}).catch(() => {});

			// 5. Wait for redirect to 500.html
			await page.waitForURL("**/500.html*", { timeout: 15000 });

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();

			// 6. Verify that the marker was cleared by index.html before redirect
			const windowName = await page.evaluate(() => window.name);
			expect(windowName).not.toContain(MARKER);
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
			// Block a third-party analytics script (common with ad-blockers)
			await page.route("**/www.googletagmanager.com/**", async (route) => {
				await route.abort("blockedbyclient");
			});

			await page.goto("/");

			// Verify app loaded normally - no redirect to 500.html
			expect(page.url()).not.toContain("500.html");
			
			// Verify window.name is still empty
			const windowName = await page.evaluate(() => window.name);
			expect(windowName).not.toContain(MARKER);
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

	test.describe("Successful boot cleanup", () => {
		test("should clear MARKER from window.name after successful boot", async ({
			page,
		}) => {
			// Pre-set the marker as if a recovery reload just occurred
			await page.addInitScript((marker) => {
				window.name = marker;
			}, MARKER);

			await page.goto("/");

			// Wait for the app-ready event (which clears the marker in main.tsx)
			await page.waitForFunction(
				() => (window as typeof window & { __APP_READY__?: boolean }).__APP_READY__,
				{ timeout: 30000 }
			);

			const windowName = await page.evaluate(() => window.name);
			expect(windowName).not.toContain(MARKER);
		});
	});
});
