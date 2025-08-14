import { test, expect } from '@playwright/test';

test.describe('GridCell Supercharge Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?platform=standard');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      window.useGridStore.getState().resetGrid();
    });

    // Add a short delay to allow React to re-render
    await page.waitForTimeout(100);

    await expect(page.locator('.gridTable')).toBeVisible();
  });

  test('should supercharge a cell on click', async ({ page }) => {
    const cell = page.getByRole('gridcell').first();
    await expect(cell).toHaveClass(/gridCell--active/); // Should be active by default
    await expect(cell).not.toHaveClass(/gridCell--supercharged/); // Should not be supercharged by default

    await cell.click(); // Simulate click to supercharge

    await expect(cell).toHaveClass(/gridCell--supercharged/); // Verify it becomes supercharged
  });

  test('should handle Ctrl+click on a grid cell to toggle active state', async ({ page }) => {
    const cell = page.getByRole('gridcell').first();
    await expect(cell).toHaveClass(/gridCell--active/); // Assuming initial state is active

    await page.keyboard.down('Control');
    await cell.click(); // Simulate Ctrl+click to toggle active
    await page.keyboard.up('Control');

    // Verify the cell becomes inactive
    await expect(cell).toHaveClass(/gridCell--inactive/);
    // Verify no shake effect (assuming shake adds a class or style)
    await expect(cell).not.toHaveClass(/shake/);
  });

  test('should single-tap a cell to disable it', async ({ page }) => {
    const cell = page.getByRole('gridcell').first();
    await expect(cell).toHaveClass(/gridCell--active/); // Should be active by default

    // Simulate a single tap
    await cell.tap();

    await expect(cell).toHaveClass(/gridCell--inactive/); // Verify it becomes inactive
  });

  test('should double-tap a cell to supercharge it', async ({ page }) => {
    const cell = page.getByRole('gridcell').first();
    await expect(cell).toHaveClass(/gridCell--active/); // Should be active by default
    await expect(cell).not.toHaveClass(/gridCell--supercharged/); // Should not be supercharged by default

    // Simulate the first tap to set _initialCellStateForTap
    await page.evaluate(() => {
      window.useGridStore.getState().handleCellTap(0, 0);
    });

    // Directly call handleCellDoubleTap for the second tap
    await page.evaluate(() => {
      window.handleCellDoubleTap(0, 0);
    });

    await expect(cell).toHaveClass(/gridCell--supercharged/); // Verify it becomes supercharged
  });

  test('should trigger shake when attempting to supercharge beyond 4 cells', async ({ page }) => {
    // Set up 4 supercharged cells directly in the store
    await page.evaluate(() => {
      const { useGridStore } = window;
      const setCellSupercharged = useGridStore.getState().setCellSupercharged;
      // Assuming a 10x6 grid, set the first 4 cells in the first row as supercharged
      setCellSupercharged(0, 0, true);
      setCellSupercharged(0, 1, true);
      setCellSupercharged(0, 2, true);
      setCellSupercharged(0, 3, true);
    });

    // Wait for React to re-render after state update
    await page.waitForTimeout(500);

    // Select a 5th cell that is not supercharged (e.g., the 5th cell in the first row)
    const targetCell = page.getByRole('gridcell').nth(4); // 0-indexed, so this is the 5th cell

    // Verify initial state of the target cell
    await expect(targetCell).toHaveClass(/gridCell--active/);
    await expect(targetCell).not.toHaveClass(/gridCell--supercharged/);

    // Attempt to supercharge the 5th cell
    await targetCell.click();

    // Assert that shaking state becomes true
    await expect(page.evaluate(() => window.useShakeStore.getState().shaking)).resolves.toBe(true);

    // Wait for shake animation to complete (500ms in triggerShake)
    await page.waitForTimeout(600);

    // Assert that shaking state becomes false
    await expect(page.evaluate(() => window.useShakeStore.getState().shaking)).resolves.toBe(false);

    // Verify cell remains active and not supercharged
    await expect(targetCell).toHaveClass(/gridCell--active/);
    await expect(targetCell).not.toHaveClass(/gridCell--supercharged/);
  });
});
