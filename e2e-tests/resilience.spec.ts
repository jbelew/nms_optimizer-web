import { expect, test } from "@playwright/test";

test.describe("Application Resilience & Recovery", () => {
	test("should show recovery UI when a critical chunk fails to load after multiple attempts", async ({
		page,
	}) => {
		// 1. Setup route interception to simulate a chunk load failure (404)
		await page.route("**/assets/*.js", async (route) => {
			await route.fulfill({
				status: 404,
				contentType: "application/javascript",
				body: "/* Mock 404 */",
			});
		});

		// 2. Pre-set reload count to 2 so the error UI appears on the FIRST load
		// We use an init script to ensure it's set before the head scripts run
		await page.addInitScript(() => {
			sessionStorage.setItem("init_reload_count", "2");
		});

		// 3. Navigate to the app
		await page.goto("/");

		// 4. Verify that the splash screen is hidden
		const splashScreen = page.locator("#vpss");
		await expect(splashScreen).toBeHidden({ timeout: 15000 });

		// 5. Verify that the recovery UI is visible
		const errorUI = page.locator("#app-load-error");
		await expect(errorUI).toBeVisible();
		await expect(errorUI).toContainText("Application Load Error");

		// 6. Verify that the refresh button is present
		const refreshButton = page.locator("button", { hasText: "Refresh Now" }); // Corrected text
		await expect(refreshButton).toBeVisible();
	});

	test("should increment reload count in sessionStorage on initial failure", async ({ page }) => {
		await page.route("**/assets/*.js", async (route) => {
			await route.fulfill({ status: 404 });
		});

		// We navigate and wait for the reload to start
		await page.goto("/");

		// Verify sessionStorage was incremented
		const reloadCount = await page.evaluate(() => {
			return parseInt(sessionStorage.getItem("init_reload_count") || "0");
		});

		expect(reloadCount).toBeGreaterThan(0);
	});
});
