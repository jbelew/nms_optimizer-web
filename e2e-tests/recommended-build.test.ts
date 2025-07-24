import { test, expect } from '@playwright/test';

test('should not crash when applying a recommended build', async ({ page }) => {
  await page.goto('/?platform=colossus');

  // Wait for the recommended build button to be visible
  await page.waitForSelector('button:has-text("Apply Recommended Build")', { state: 'visible' });

  for (let i = 0; i < 3; i++) {
    // Find the button to apply the recommended build inside the loop
    const recommendedBuildButton = page.locator('button:has-text("Apply Recommended Build")');

    // Apply Recommended Build
    await recommendedBuildButton.click();
    await page.waitForLoadState('networkidle'); // Wait for network to be idle after applying build

    // Simulate user returning to the app by reloading the page
    await page.reload();
    await page.waitForLoadState('networkidle'); // Wait for network to be idle after reload
    await page.waitForSelector('button:has-text("Reset Grid")', { state: 'visible' }); // Ensure reset button is visible after reload

    // Check if the page is still alive after applying the build
    let isLive = await page.evaluate(() => 1);
    expect(isLive).toBe(1);

    // Reset Grid
    const resetGridButton = page.locator('button:has-text("Reset Grid")');
    await resetGridButton.click();
    await page.waitForLoadState('networkidle'); // Wait for network to be idle after resetting grid

    // Check if the page is still alive after resetting the grid
    isLive = await page.evaluate(() => 1);
    expect(isLive).toBe(1);

    // Wait for the button to be visible again before the next iteration
    await page.waitForSelector('button:has-text("Apply Recommended Build")', { state: 'visible' });
  }
});
