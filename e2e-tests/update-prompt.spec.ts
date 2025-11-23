import { expect, test } from "@playwright/test";

test.describe("UpdatePrompt Suppression", () => {
	test("should suppress update prompt if server version matches current version", async ({
		page,
	}) => {
		// Get the actual build date from the server
		const actualVersion = await (await fetch("http://localhost:4173/version.json")).json();
		const currentBuildDate = actualVersion.buildDate;

		// 1. Mock /version.json to return the SAME build date as the current app
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

		await page.goto("/");

		// 2. Dispatch the event
		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: async () => {
						console.log("Mock updateSW called");
					},
				})
			);
		});

		// 3. Assert UpdatePrompt is NOT visible
		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).not.toBeVisible();
	});

	test("should show update prompt if server version differs from current version", async ({
		page,
	}) => {
		// 1. Mock /version.json to return a DIFFERENT build date
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

		await page.goto("/");

		// 2. Dispatch the event and wait for it to be handled
		await page.evaluate(async () => {
			window.dispatchEvent(
				new CustomEvent("new-version-available", {
					detail: async () => {
						console.log("Mock updateSW called");
					},
				})
			);
			// Wait for the async fetch to complete
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		// 3. Wait for and assert UpdatePrompt IS visible
		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).toBeVisible({ timeout: 5000 });
	});
});
