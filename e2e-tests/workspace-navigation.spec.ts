import { expect, test } from "@playwright/test";

import { resetGrid, waitForStore, waitForTechTree } from "./helpers/store-helpers";

/**
 * Workspace Navigation, URL Sync, Shared Grid & Build File Round-Trip E2E Suite
 *
 * Verifies:
 * 1. Platform Type switching via ShipSelection updates URL and store state.
 * 2. Routed Dialogs open/close and synchronize with canonical URL paths.
 * 3. Shared Grid (?grid=) hydration locks ModuleSelectionDialog into read-only mode.
 * 4. Build File (.nms) export -> Session Reset -> Build File import restores layout state.
 */
test.describe("Workspace Navigation, URL Sync & Build File Flows", () => {
	test.beforeEach(async ({ page }) => {
		await page.route(
			/(googletagmanager|google-analytics|cloudflareinsights)/,
			async (route) => {
				await route.abort("blockedbyclient");
			},
		);

		await page.addInitScript(() => {
			localStorage.setItem("user-visited", "true");
		});
	});

	test("should switch Platform Type via ShipSelection and synchronize ?platform= URL", async ({
		page,
	}) => {
		await page.goto("/?platform=standard");
		await waitForStore(page);
		await waitForTechTree(page);

		const trigger = page.getByRole("button", { name: /Select ship type/i });
		await expect(trigger).toBeVisible();
		await trigger.click();

		const menu = page.getByRole("menu");
		await expect(menu).toBeVisible();

		const solarOption = menu.getByRole("menuitemradio", { name: /Solar/i });
		await expect(solarOption).toBeVisible();
		await solarOption.click();

		await expect(page).toHaveURL(/platform=solar/);
		await waitForTechTree(page);

		const storedPlatform = await page.evaluate(() => localStorage.getItem("selectedPlatform"));
		expect(storedPlatform).toBe("solar");

		await trigger.click();
		await expect(
			page.getByRole("menu").getByRole("menuitemradio", { name: /Solar/i }),
		).toBeChecked();
	});

	test("should synchronize URL when opening and closing a Routed Dialog", async ({ page }) => {
		await page.goto("/?platform=standard");
		await waitForStore(page);
		await waitForTechTree(page);

		const aboutButton = page.locator(".gridTable__button--about");
		await expect(aboutButton).toBeVisible();
		await aboutButton.click();

		await expect(page).toHaveURL(/\/about\/?/);
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		const closeButton = dialog.getByRole("button", { name: /close/i }).first();
		await closeButton.click();

		await expect(dialog).toBeHidden();
		await expect(page).not.toHaveURL(/\/about/);
	});

	test("should generate a Share Link URL and hydrate the Shared Grid in read-only mode", async ({
		page,
	}) => {
		await page.goto("/?platform=colossus");
		await waitForStore(page);
		await waitForTechTree(page);
		await resetGrid(page);

		const populatedLocator = page.locator('div[role="gridcell"]:has(img)');
		const initialPopulatedCount = await populatedLocator.count();

		const applyBuildButton = page.getByRole("button", { name: /Apply Build/i }).first();
		await expect(applyBuildButton).toBeVisible();
		await applyBuildButton.click();
		await expect(populatedLocator).not.toHaveCount(initialPopulatedCount);
		const populatedAfterApply = await populatedLocator.count();

		const shareButton = page.locator(".gridTable__button--share");
		await expect(shareButton).toBeEnabled();
		await shareButton.click();

		const shareDialog = page.getByRole("dialog");
		await expect(shareDialog).toBeVisible();

		const shareInput = shareDialog.getByRole("textbox");
		const shareUrl = await shareInput.inputValue();
		expect(shareUrl).toContain("grid=");

		const parsedUrl = new URL(shareUrl);
		await page.goto(`${parsedUrl.pathname}${parsedUrl.search}`);
		await waitForStore(page);
		await waitForTechTree(page);

		const isSharedGrid = await page.evaluate(
			() => window.useGridStore?.getState().isSharedGrid,
		);
		expect(isSharedGrid).toBe(true);
		await expect(populatedLocator).toHaveCount(populatedAfterApply);

		// In Shared Grid mode, ShipSelection is disabled and edit/share actions are hidden
		const shipSelectionTrigger = page.getByRole("button", { name: /Select ship type/i });
		await expect(shipSelectionTrigger).toBeDisabled();
		await expect(page.locator(".gridTable__button--share")).toBeHidden();
	});

	test("should export a .nms Build File, reset the session, and restore the build from disk", async ({
		page,
	}, testInfo) => {
		await page.goto("/?platform=colossus");
		await waitForStore(page);
		await waitForTechTree(page);
		await resetGrid(page);

		const populatedLocator = page.locator('div[role="gridcell"]:has(img)');
		const initialPopulatedCount = await populatedLocator.count();

		const applyBuildButton = page.getByRole("button", { name: /Apply Build/i }).first();
		await expect(applyBuildButton).toBeVisible();
		await applyBuildButton.click();

		await expect(populatedLocator).not.toHaveCount(initialPopulatedCount);
		const populatedAfterApply = await populatedLocator.count();
		expect(populatedAfterApply).toBeGreaterThan(initialPopulatedCount);

		const saveButton = page.locator(".gridTable__button--save");
		await expect(saveButton).toBeEnabled();
		await saveButton.click();

		const buildNameDialog = page.getByRole("dialog");
		await expect(buildNameDialog).toBeVisible();

		const buildNameInput = buildNameDialog.getByRole("textbox");
		await buildNameInput.fill("colossus-e2e-build");

		const downloadPromise = page.waitForEvent("download");
		const confirmSaveButton = buildNameDialog.getByRole("button", { name: /Save/i });
		await confirmSaveButton.click();

		const download = await downloadPromise;
		const suggestedFilename = download.suggestedFilename();
		expect(suggestedFilename).toMatch(/\.nms$/);
		const savedFilePath = testInfo.outputPath(suggestedFilename);
		await download.saveAs(savedFilePath);

		const resetGridButton = page.getByRole("button", { name: /Reset Build/i });
		await resetGridButton.click();
		await expect(populatedLocator).toHaveCount(initialPopulatedCount);

		const fileInput = page.locator('input[type="file"][accept=".nms"]').first();
		await fileInput.setInputFiles(savedFilePath);

		await expect(populatedLocator).toHaveCount(populatedAfterApply);
	});
});
