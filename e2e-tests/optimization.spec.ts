import { expect, test } from '@playwright/test';
import { resetGrid, waitForStore, waitForTechTree, waitForOptimization } from './helpers/store-helpers';

test.describe('End-to-End Optimization Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress welcome dialog
    await page.addInitScript(() => {
      localStorage.setItem("user-visited", "true");
    });

    await page.goto('/?platform=standard');
    
    // Wait for the app and store to be initialized
    await waitForStore(page);
    // Wait for technology data to be fetched and processed
    await waitForTechTree(page);

    await resetGrid(page);
  });

  test('should run a full optimization flow for Infraknife Accelerator', async ({ page }) => {
    const techName = "Infraknife Accelerator";
    
    // 1. Open the Module Selection Dialog
    // We use a more flexible locator to handle potential translation/casing variations
    const moduleSelectionButton = page.locator(`button[aria-label*="${techName}"][aria-label*="Selection"]`);
    await expect(moduleSelectionButton).toBeVisible();
    await moduleSelectionButton.click();

    // 2. Verify dialog is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(techName);

    // 3. Select modules
    // "Q-Resonator" is a standard upgrade for Infraknife
    const upgradeLabel = "Q-Resonator";
    const upgradeCheckbox = dialog.getByLabel(upgradeLabel);
    await expect(upgradeCheckbox).toBeVisible();
    
    // Only click if it's not already checked (to ensure the "Optimize" button becomes enabled if it wasn't)
    const isChecked = await upgradeCheckbox.getAttribute('aria-checked') === 'true';

    if (!isChecked) {
      // If it's disabled (e.g. prerequisite not met), this will fail, which is correct for the test
      await upgradeCheckbox.click();
    }

    // 4. Click Optimize inside the dialog
    const optimizeDialogButton = page.getByLabel('optimizeButton');
    await expect(optimizeDialogButton).toBeEnabled();
    await optimizeDialogButton.click();

    // 5. Verify the solving state appears
    await waitForOptimization(page, 'solving');
    const spinner = page.getByRole('status');
    await expect(spinner).toBeVisible();

    // 6. Wait for the optimization to complete
    // We wait for the 'idle' status in the store, which is more reliable than just watching the spinner
    await waitForOptimization(page, 'idle');
    await expect(spinner).toBeHidden();

    // 7. Verify grid content
    const moduleCount = await page.evaluate(() => {
      const { grid } = window.useGridStore.getState();

      return grid.cells.flat().filter(cell => cell.module !== null).length;
    });
    expect(moduleCount).toBeGreaterThan(0);

    // 8. Verify the "Valid optimization achieved" icon appears in the technology row
    // Using a regex to be resilient to minor translation changes
    const validSolveIcon = page.getByLabel(/Valid optimization achieved|Valid solve/);
    await expect(validSolveIcon).toBeVisible();
    
    // 9. Verify that we can reset the optimization results for this tech
    const resetTechButton = page.getByLabel(new RegExp(`Reset (optimization results for )?${techName}`));
    await expect(resetTechButton).toBeVisible();
    await resetTechButton.click();
    
    // After reset, the icon should be gone
    await expect(validSolveIcon).toBeHidden();
  });
});
