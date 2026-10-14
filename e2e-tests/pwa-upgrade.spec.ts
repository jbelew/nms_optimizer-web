import { expect, test } from "@playwright/test";

/**
 * PWA Upgrade and Self-Healing E2E Test Suite
 *
 * Verifies that:
 * 1. The application boots cleanly without legacy milestone reload loops.
 * 2. Runtime preload errors (vite:preloadError) trigger PWA Self-Healing and cache-busted reload.
 * 3. In-app update notifications present non-disruptive actions to users.
 */
test.describe("PWA Upgrade & Self-Healing Lifecycle", () => {
	test.beforeEach(async ({ page }) => {
		await page.route(
			/(googletagmanager|google-analytics|cloudflareinsights)/,
			async (route) => {
				await route.abort("blockedbyclient");
			}
		);
		await page.route("**/version.json", async (route) => {
			await route.fulfill({
				body: JSON.stringify({
					buildDate: "2099-01-01T00:00:00.000Z",
					version: "99.0.0",
				}),
				contentType: "application/json",
				status: 200,
			});
		});
	});

	test("should boot application cleanly without setting legacy __pwa_healed_v804__ marker", async ({
		page,
	}) => {
		await page.goto("/");
		await page.waitForFunction(() => window.lifecycleCoordinator?.isReady(), { timeout: 30000 });

		const healedMarker = await page.evaluate(() =>
			localStorage.getItem("__pwa_healed_v804__")
		);
		expect(healedMarker).toBeNull();
	});

	test("should trigger PWA Self-Healing and cache-busted reload on vite:preloadError", async ({
		page,
	}) => {
		await page.goto("/");
		await page.waitForFunction(() => window.lifecycleCoordinator?.isReady(), { timeout: 30000 });

		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent("vite:preloadError", {
					cancelable: true,
					detail: { message: "Failed to fetch dynamically imported module" },
				})
			);
		});

		await page.waitForURL(/\?_cb=\d+/, { timeout: 10000 });
		const attempts = await page.evaluate(() =>
			sessionStorage.getItem("__recovery_attempts__")
		);
		expect(attempts).toBe("1");
	});

	test("should trigger update handler when user clicks Refresh Now", async ({ page }) => {
		await page.goto("/");
		await page.waitForFunction(() => window.lifecycleCoordinator?.isReady(), { timeout: 30000 });

		let updateTriggered = false;
		await page.exposeFunction("__onUpdateTriggered", () => {
			updateTriggered = true;
		});

		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: async () => {
						await (
							window as unknown as { __onUpdateTriggered?: () => Promise<void> }
						).__onUpdateTriggered?.();
					},
				})
			);
		});

		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).toBeVisible({ timeout: 10000 });

		const refreshButton = page.getByRole("button", { name: /refresh now/i });
		await expect(refreshButton).toBeVisible();
		await refreshButton.click();

		await expect.poll(() => updateTriggered, { timeout: 10000 }).toBe(true);
		expect(updateTriggered).toBe(true);
	});
});
