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

	test.afterEach(async ({ page }) => {
		try {
			await page.evaluate(() => sessionStorage.clear());
		} catch (e) {
			// Context might be gone
		}
	});

	test.describe("Preload error recovery cycle", () => {
		test("should auto-reload once on first chunk failure", async ({ page }) => {
			// Seed the trigger flag on the very first navigation BEFORE any inline
			// script runs. Using page.evaluate + page.reload() is racy in WebKit:
			// sessionStorage writes are sometimes not yet visible to the next page's
			// synchronous head script.
			await page.addInitScript(() => {
				if (sessionStorage.getItem("__SEED_AUTO_RELOAD__")) return;
				sessionStorage.setItem("__SEED_AUTO_RELOAD__", "1");
				sessionStorage.setItem("__TEST_TRIGGER_ERROR__", "1");
			});

			// Trigger navigation. The inline script will:
			//   1. See __TEST_TRIGGER_ERROR__ and call handleStaleChunkError.
			//   2. MARKER is unset → set MARKER, bump __recovery_attempts__, and
			//      cache-bust reload to /?_cb=...
			//   3. On the cache-busted page, no trigger fires; the app boots and
			//      main.tsx clears MARKER on `app-ready`.
			void page.goto("/").catch(() => {});

			// Wait for the recovery to fire AND the app to fully boot.
			// The counter persists across the cache-busting reload so we don't have
			// to race a transient `?_cb=` URL (which react-router strips).
			await page.waitForFunction(
				() =>
					sessionStorage.getItem("__recovery_attempts__") === "1" &&
					(window as Window & { __APP_READY__?: boolean }).__APP_READY__ === true,
				{ timeout: 30000 }
			);

			// Verify that the marker was cleared by main.tsx.
			const markerValue = await page.evaluate((m) => sessionStorage.getItem(m), MARKER);
			expect(markerValue).toBeNull();
		});

		test("should redirect to 500.html on second chunk failure", async ({ page }) => {
			// Pre-seed sessionStorage on the very next navigation BEFORE any inline
			// script runs. Setting these via page.evaluate + page.reload() is racy in
			// WebKit (the inline-script trigger occasionally observes a missing
			// marker and falls back into the auto-reload branch).
			await page.addInitScript((m) => {
				if (sessionStorage.getItem("__SEED_500_TEST__")) return;
				sessionStorage.setItem("__SEED_500_TEST__", "1");
				sessionStorage.setItem(m, "1");
				sessionStorage.setItem("__TEST_TRIGGER_ERROR__", "1");
			}, MARKER);

			// Trigger navigation. The inline script will:
			//   1. See __TEST_TRIGGER_ERROR__ and call handleStaleChunkError.
			//   2. See MARKER already present → take the second-failure branch.
			//   3. Clear MARKER and redirect to /500.html.
			void page.goto("/").catch(() => {});

			await page.waitForURL(/\/500\.html/, { timeout: 30000 });

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();

			// Verify that the marker was cleared by index.html before redirect.
			const markerValue = await page.evaluate((m) => sessionStorage.getItem(m), MARKER);
			expect(markerValue).toBeNull();
		});

		test("reset button should clear caches and reload to root", async ({ page }) => {
			await page.goto("/500.html");
			const refreshButton = page.locator("button", { hasText: "Hard Reset & Refresh" });
			await expect(refreshButton).toBeVisible();

			await refreshButton.click();

			// 500.html redirects to /?reload=<timestamp>
			await page.waitForFunction(() => window.location.pathname === "/" && window.location.search.includes("reload="), { timeout: 15000 });
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
