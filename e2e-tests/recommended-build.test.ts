import { expect, test } from "@playwright/test";

import { waitForStore, waitForTechTree } from "./helpers/store-helpers";

test.describe("Recommended Builds Presets Card", () => {
	test.beforeEach(async ({ page }) => {
		// Suppress welcome dialog
		await page.addInitScript(() => {
			localStorage.setItem("user-visited", "true");
		});
	});

	test("should correctly display presets card, apply and reset recommended builds on desktop", async ({
		page,
	}) => {
		await page.goto("/?platform=colossus");
		await waitForStore(page);
		await waitForTechTree(page);

		// Verify presets card heading is visible
		const cardHeading = page.getByRole("heading", { name: /Recommended Builds/i });
		await expect(cardHeading).toBeVisible();

		// Initial state: populated cells should be identifiable by having an <img> tag
		const populatedLocator = page.locator('div[role="gridcell"]:has(img)');
		const initialPopulatedCells = await populatedLocator.count();

		// Find and click the "Apply Build" button
		const applyBuildButton = page.getByRole("button", { name: /Apply Build/i }).first();
		await expect(applyBuildButton).toBeVisible();
		await applyBuildButton.click();

		// Verify grid is populated (more cells with <img>)
		await expect(populatedLocator).not.toHaveCount(initialPopulatedCells);
		const countAfterApply = await populatedLocator.count();
		expect(countAfterApply).toBeGreaterThan(initialPopulatedCells);

		// Wait for debounced localStorage to sync (1000ms in GridStore.ts)
		await page.waitForTimeout(1500);

		// Simulate user returning to the app by reloading the page
		await page.reload();
		await page.waitForLoadState("networkidle");
		await waitForStore(page);
		await waitForTechTree(page);

		// Verify state persisted after reload
		const countAfterReload = await populatedLocator.count();
		expect(countAfterReload).toBe(countAfterApply);

		// Reset Grid
		const resetGridButton = page.getByRole("button", { name: /Reset Grid/i });
		await resetGridButton.click();

		// Verify grid is cleared back to initial state
		const countAfterReset = await populatedLocator.count();
		expect(countAfterReset).toBe(initialPopulatedCells);
	});

	test("should display and interact with presets card on mobile viewport", async ({ page }) => {
		await page.setViewportSize({ height: 667, width: 375 });
		await page.goto("/?platform=colossus");
		await waitForStore(page);
		await waitForTechTree(page);

		// Verify presets card heading and apply button on mobile
		const cardHeading = page.getByRole("heading", { name: /Recommended Builds/i });
		await expect(cardHeading).toBeVisible();

		const applyBuildButton = page.getByRole("button", { name: /Apply Build/i }).first();
		await expect(applyBuildButton).toBeVisible();
	});
});
