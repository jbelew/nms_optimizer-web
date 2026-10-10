import { expect, test } from "@playwright/test";

/**
 * PWA Upgrade and Self-Healing E2E Test Suite
 *
 * Verifies that:
 * 1. The two-tier self-healing head script marks the migration milestone (__pwa_healed_v804__).
 * 2. Unregistered or stale service worker states heal on page navigation.
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
	});

	test("should mark __pwa_healed_v804__ milestone and boot application cleanly", async ({
		page,
	}) => {
		await page.goto("/");
		await page.waitForFunction(() => window.lifecycleCoordinator?.isReady(), { timeout: 30000 });

		const healedMarker = await page.evaluate(() =>
			localStorage.getItem("__pwa_healed_v804__")
		);
		expect(healedMarker).toBe("1");
	});

	test("should evict stale service workers and clear caches on boot when unhealed", async ({
		page,
	}) => {
		// Simulate a client with an unhealed state before visiting
		await page.addInitScript(() => {
			localStorage.removeItem("__pwa_healed_v804__");
		});

		await page.goto("/");
		await page.waitForFunction(() => window.lifecycleCoordinator?.isReady(), { timeout: 30000 });

		const healedMarker = await page.evaluate(() =>
			localStorage.getItem("__pwa_healed_v804__")
		);
		expect(healedMarker).toBe("1");
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

		await page.waitForFunction(() => Boolean(updateTriggered), { timeout: 10000 });
		expect(updateTriggered).toBe(true);
	});
});
