import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * Triggers the application update flow by dispatching `new-version-available`.
 *
 * @param page - Playwright page fixture.
 * @returns Resolves once navigation and event dispatch complete.
 */
async function triggerUpdatePrompt(page: Page): Promise<void> {
	await page.goto("/");
	await page.waitForFunction(() => window.lifecycleCoordinator?.isReady());
	await page.evaluate(() => {
		window.dispatchEvent(
			new CustomEvent("new-version-available", {
				detail: async () => {},
			})
		);
	});
}

test.describe("UpdatePrompt Lifecycle", () => {
	test("should show update prompt when new-version-available event is dispatched", async ({
		page,
	}) => {
		await triggerUpdatePrompt(page);

		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).toBeVisible({ timeout: 10000 });
	});

	test("should dismiss update prompt when user clicks later", async ({ page }) => {
		await triggerUpdatePrompt(page);

		const dialog = page.getByRole("dialog", { name: /update available/i });
		await expect(dialog).toBeVisible({ timeout: 10000 });

		const laterButton = page.getByRole("button", { name: /later/i });
		await laterButton.click();

		await expect(dialog).not.toBeVisible();
	});
});
