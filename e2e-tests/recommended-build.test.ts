import { expect, test } from '@playwright/test';

test('should correctly apply and reset recommended builds', async ({ page }) => {
  await page.goto('/?platform=colossus');

  // Wait for the recommended build button to be visible
  await page.waitForSelector('button:has-text("Apply Recommended Build")', { state: 'visible' });

  // Initial state: populated cells should be identifiable by having an <img> tag
  const populatedLocator = page.locator('div[role="gridcell"]:has(img)');
  const initialPopulatedCells = await populatedLocator.count();

  // Find the button to apply the recommended build
  const recommendedBuildButton = page.locator('button:has-text("Apply Recommended Build")');

  // Apply Recommended Build
  await recommendedBuildButton.click();
  
  // Verify grid is populated (more cells with <img>)
  await expect(populatedLocator).not.toHaveCount(initialPopulatedCells);
  const countAfterApply = await populatedLocator.count();
  expect(countAfterApply).toBeGreaterThan(initialPopulatedCells);

  // Wait for debounced localStorage to sync (1000ms in GridStore.ts)
  await page.waitForTimeout(1500);

  // Simulate user returning to the app by reloading the page
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  // Verify state persisted after reload
  const countAfterReload = await populatedLocator.count();
  expect(countAfterReload).toBe(countAfterApply);

  // Reset Grid
  const resetGridButton = page.locator('button:has-text("Reset Grid")');
  await resetGridButton.click();
  
  // Verify grid is cleared back to initial state
  const countAfterReset = await populatedLocator.count();
  expect(countAfterReset).toBe(initialPopulatedCells);
});
