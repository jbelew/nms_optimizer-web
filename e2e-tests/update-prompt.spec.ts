import { expect, test } from "@playwright/test";

test.describe("UpdatePrompt Suppression", () => {
	test("should suppress update prompt if server version matches current version", async ({
		page,
	}) => {
		// 1. Navigate to page first to load the app with its build date
		await page.goto("/");

		// 2. Get the app's current build date
		const currentBuildDate = await page.evaluate(() => {
			return (window as unknown as { __BUILD_DATE__: string }).__BUILD_DATE__;
		});

		// 3. Mock /version.json to return the SAME build date
		await page.route("/version.json", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					version: "unknown",
					buildDate: currentBuildDate,
				}),
			});
		});

		// 4. Dispatch the event
		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: async () => {
						console.log("Mock updateSW called");
					},
				})
			);
		});

		// 5. Assert UpdatePrompt is NOT visible (wait a bit to ensure it doesn't appear)
		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).not.toBeVisible({ timeout: 2000 });
	});

	test("should show update prompt if server version differs from current version", async ({
		page,
	}) => {
		// 1. Mock /version.json BEFORE navigating
		await page.route("/version.json", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					version: "unknown",
					buildDate: "2025-11-23T10:00:00.000Z", // Different from current build
				}),
			});
		});

		// 2. Navigate to page
		await page.goto("/");

		// 3. Wait for listeners to be set up
		await page.waitForTimeout(1000);

		// 4. Dispatch the event
		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: async () => {
						// Mock updateSW function
					},
				})
			);
		});

		// 5. Wait for the event to be processed and state updated
		await page.waitForTimeout(2000);

		// 6. Wait for and assert UpdatePrompt IS visible
		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).toBeVisible({ timeout: 5000 });
	});
});
