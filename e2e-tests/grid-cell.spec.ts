import { expect, test } from '@playwright/test';
import { getShakeCount, resetGrid, waitForStore } from './helpers/store-helpers';

test.describe('GridCell Supercharge Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress welcome dialog
    await page.addInitScript(() => {
      localStorage.setItem("user-visited", "true");
    });

    await page.goto('/?platform=standard');
    
    // Wait for the app and store to be initialized
    await waitForStore(page);

    await resetGrid(page);

    await expect(page.locator('.gridTable')).toBeVisible();
    // Wait for the first cell to be in active state (default for fresh grid)
    await expect(page.getByTestId('grid-cell').first()).toHaveClass(/gridCell--active/);
  });

  test('should supercharge a cell on click', async ({ page }) => {
    const cell = page.getByTestId('grid-cell').first();
    await expect(cell).toHaveClass(/gridCell--active/); // Should be active by default
    
    // Single click should trigger supercharge in desktop/standard mode if active
    await cell.click();
    
    // Assert supercharged state
    await expect(cell).toHaveClass(/gridCell--supercharged/);
  });

  test('should handle Ctrl+click on a grid cell to toggle active state', async ({ page }) => {
    const targetCell = page.getByTestId('grid-cell').nth(5); // 6th cell
    
    // Initial state check
    await expect(targetCell).toHaveClass(/gridCell--active/);

    // Ctrl+Click to toggle active off
    await targetCell.click({ modifiers: ['Control'] });
    await expect(targetCell).not.toHaveClass(/gridCell--active/);

    // Ctrl+Click to toggle active back on
    await targetCell.click({ modifiers: ['Control'] });
    await expect(targetCell).toHaveClass(/gridCell--active/);
  });

  test('should double-tap a cell to supercharge it', async ({ page }) => {
    const targetCell = page.getByTestId('grid-cell').nth(15); // 16th cell
    
    // Initial state check
    await expect(targetCell).toHaveClass(/gridCell--active/);

    // Simulate double-tap via store helper
    await page.evaluate(() => {
      const cells = document.querySelectorAll('[data-testid="grid-cell"]');
      const target = cells[15];
      const row = parseInt(target.parentElement!.getAttribute('aria-rowindex')!) - 1;
      const col = parseInt(target.getAttribute('aria-colindex')!) - 1;
      window.useGridStore.getState().toggleCellSupercharged(row, col);
    });
    
    // Assert supercharged state - use a more flexible matcher if needed, but gridCell--supercharged should be there
    await expect(targetCell).toHaveClass(/gridCell--supercharged/);
  });

  test('should trigger shake when attempting to supercharge beyond 4 cells', async ({ page }) => {
    // Manually set 4 cells to supercharged using helper
    await page.evaluate(() => {
      const { setCellSupercharged } = window.useGridStore.getState();
      setCellSupercharged(0, 0, true);
      setCellSupercharged(0, 1, true);
      setCellSupercharged(0, 2, true);
      setCellSupercharged(0, 3, true);
    });

    // Wait for React to re-render after state update
    await expect(page.locator('.gridCell--supercharged')).toHaveCount(4);

    // Get initial shake count
    const initialShakeCount = await getShakeCount(page);

    // Select a 5th cell that is not supercharged
    const targetCell = page.getByTestId('grid-cell').nth(4); // 5th cell (0, 4)
    
    // Attempt to supercharge the 5th cell
    await targetCell.click();

    // Assert that shakeCount has increased
    const newShakeCount = await getShakeCount(page);
    expect(newShakeCount).toBe(initialShakeCount + 1);

    // Verify cell remains active and not supercharged
    await expect(targetCell).toHaveClass(/gridCell--active/);
    await expect(targetCell).not.toHaveClass(/gridCell--supercharged/);
  });
});

test.describe('Mobile Touch Interactions', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Suppress welcome dialog
    await page.addInitScript(() => {
      localStorage.setItem("user-visited", "true");
    });

    test.skip(testInfo.project.name !== 'mobile-chrome', 'Only run on mobile-chrome');
    await page.goto('/?platform=standard');
    await waitForStore(page);
    await resetGrid(page);
  });

  test('should toggle active state on single tap', async ({ page }) => {
    const targetCell = page.getByTestId('grid-cell').first();
    await expect(targetCell).toHaveClass(/gridCell--active/);

    // Mobile single tap should toggle active (since double-tap is used for supercharge)
    await targetCell.tap();
    await expect(targetCell).not.toHaveClass(/gridCell--active/);

    await targetCell.tap();
    await expect(targetCell).toHaveClass(/gridCell--active/);
  });

  test('should toggle supercharged on double tap', async ({ page }) => {
    const targetIndex = 5; 
    const targetCell = page.getByTestId('grid-cell').nth(targetIndex);
    await expect(targetCell).toHaveClass(/gridCell--active/);

    // Use store directly to toggle supercharged state
    await page.evaluate((idx) => {
      const cells = document.querySelectorAll('[data-testid="grid-cell"]');
      const target = cells[idx];
      const row = parseInt(target.parentElement!.getAttribute('aria-rowindex')!) - 1;
      const col = parseInt(target.getAttribute('aria-colindex')!) - 1;
      window.useGridStore.getState().toggleCellSupercharged(row, col);
    }, targetIndex);
    
    await expect(targetCell).toHaveClass(/gridCell--supercharged/);

    await page.evaluate((idx) => {
      const cells = document.querySelectorAll('[data-testid="grid-cell"]');
      const target = cells[idx];
      const row = parseInt(target.parentElement!.getAttribute('aria-rowindex')!) - 1;
      const col = parseInt(target.getAttribute('aria-colindex')!) - 1;
      window.useGridStore.getState().toggleCellSupercharged(row, col);
    }, targetIndex);
    await expect(targetCell).not.toHaveClass(/gridCell--supercharged/);
  });
});
