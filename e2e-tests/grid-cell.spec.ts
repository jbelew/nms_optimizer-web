import { test, expect } from '@playwright/test';

test.describe('GridCell Tap Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?platform=standard');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.gridTable')).toBeVisible();

    const gridCell = page.locator('.grid-cell').first();
    const styles = await gridCell.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return {
        opacity: computedStyle.opacity,
        width: computedStyle.width,
        height: computedStyle.height,
        pointerEvents: computedStyle.pointerEvents,
        transform: computedStyle.transform,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
      };
    });

    console.log('Computed styles of .grid-cell:', styles);

    try {
      await gridCell.click();
      console.log('Clicked on the first grid cell.');
    } catch (error) {
      console.error('Could not click on the first grid cell:', error);
    }
  });

  test('should handle single tap on a grid cell', async ({ page }) => {
    const cell = page.locator('.grid-cell').first();
    await expect(cell).toHaveAttribute('data-active', 'false'); // Assuming initial state is inactive

    await cell.tap(); // Simulate single tap

    // Verify the cell becomes active
    await expect(cell).toHaveAttribute('data-active', 'true');
    // Verify no shake effect (assuming shake adds a class or style)
    await expect(cell).not.toHaveClass(/shake/);
  });

  test('should handle double tap on a grid cell to supercharge', async ({ page }) => {
    const cell = page.locator('.grid-cell').first();
    await expect(cell).toHaveAttribute('data-active', 'false');
    await expect(cell).toHaveAttribute('data-supercharged', 'false');

    // Simulate single tap to activate
    await cell.tap();
    await expect(cell).toHaveAttribute('data-active', 'true');

    // Simulate double tap to supercharge
    await cell.tap(); // First tap of double tap
    await page.waitForTimeout(100); // Small delay between taps
    await cell.tap(); // Second tap of double tap

    await expect(cell).toHaveAttribute('data-supercharged', 'true');
    await expect(cell).toHaveAttribute('data-active', 'true'); // Should remain active
    await expect(cell).not.toHaveClass(/shake/); // No shake on successful supercharge
  });

  test('should trigger shake on single tap if grid is fixed', async ({ page }) => {
    // To test this, we need a way to set gridFixed to true.
    // This might involve interacting with a UI element, or directly manipulating local storage/state if possible.
    // For now, let's assume there's a way to set it, or we'll add a step later.
    // For demonstration, let's assume we can click a button to fix the grid.
    // await page.click('#fixGridButton'); // Placeholder for a button that fixes the grid

    // For a more robust test, you might need to expose a way to set gridFixed in your app for testing purposes,
    // or directly manipulate the Zustand store via `page.evaluate` if the store is globally accessible.
    // Example: await page.evaluate(() => window.useGridStore.setState({ gridFixed: true }));

    // Let's assume for this test that the grid is fixed by default or we can set it.
    // If not, this test will need adjustment.
    // For now, I'll mock the gridFixed state in the test setup if direct manipulation isn't easy.
    // However, Playwright tests are meant to interact with the actual UI.

    // Let's assume we can set gridFixed via a button or direct state manipulation for this test.
    // If not, this test will need to be adapted.
    // For now, I'll write it assuming gridFixed can be set.

    // For a real Playwright test, you'd interact with your UI to set this state.
    // Example: await page.click('button[aria-label="Fix Grid"]');

    // Since I don't have a direct way to set gridFixed from the UI, I'll skip this test for now
    // or make a note that it requires a UI element to control gridFixed.
    // For a true E2E test, you'd interact with the UI to set this state.

    // For the purpose of demonstrating Playwright, I'll write a simplified version
    // that assumes gridFixed is somehow set, and focuses on the shake effect.
    // In a real scenario, you'd add the steps to set gridFixed.

    // To make this test runnable, I'll assume a scenario where a cell is already active
    // and we are testing the single tap behavior when gridFixed is true.

    // This test requires a way to set gridFixed to true.
    // If there's a UI element for this, we'd interact with it here.
    // For now, let's assume we can set it via page.evaluate for testing purposes.
    await page.evaluate(() => {
      window.useGridStore.setState({ gridFixed: true });
    });

    const cell = page.locator('.grid-cell').first();
    await expect(cell).toHaveAttribute('data-active', 'false'); // Start inactive

    await cell.tap(); // Single tap

    // Expect shake effect
    await expect(cell).toHaveClass(/shake/);
    // Verify cell remains inactive
    await expect(cell).toHaveAttribute('data-active', 'false');

    // Wait for shake animation to complete if necessary for subsequent tests
    await page.waitForTimeout(600); // Assuming shake duration is 500ms
    await expect(cell).not.toHaveClass(/shake/);
  });

  test('should trigger shake on double tap if superchargedFixed', async ({ page }) => {
    await page.evaluate(() => {
      window.useGridStore.setState({ superchargedFixed: true });
    });

    const cell = page.locator('.grid-cell').first();
    await expect(cell).toHaveAttribute('data-active', 'false');
    await expect(cell).toHaveAttribute('data-supercharged', 'false');

    await cell.tap(); // Activate first
    await expect(cell).toHaveAttribute('data-active', 'true');

    await cell.tap(); // First tap of double tap
    await page.waitForTimeout(100); // Small delay between taps
    await cell.tap(); // Second tap of double tap

    // Expect shake effect
    await expect(cell).toHaveClass(/shake/);
    // Verify cell remains active and supercharged state is not changed
    await expect(cell).toHaveAttribute('data-active', 'true');
    await expect(cell).toHaveAttribute('data-supercharged', 'false'); // Should not supercharge if fixed

    await page.waitForTimeout(600);
    await expect(cell).not.toHaveClass(/shake/);
  });

  test('should trigger shake on double tap if total supercharged cells >= 4 and cell is not supercharged', async ({ page }) => {
    // This test is more complex as it requires setting up the grid with 4 supercharged cells.
    // For a real E2E test, you'd interact with the UI to achieve this state.
    // For demonstration, I'll use page.evaluate to set the state directly.
    await page.evaluate(() => {
      const { useGridStore, createEmptyCell } = window; // Assuming these are globally accessible for testing
      const grid = useGridStore.getState().grid;
      // Set up 4 supercharged cells
      grid.cells[0][0] = { ...createEmptyCell(true, true), module: 'm1' };
      grid.cells[0][1] = { ...createEmptyCell(true, true), module: 'm2' };
      grid.cells[0][2] = { ...createEmptyCell(true, true), module: 'm3' };
      grid.cells[0][3] = { ...createEmptyCell(true, true), module: 'm4' };
      useGridStore.setState({ grid: { ...grid } });
    });

    const targetCell = page.locator('.grid-cell').nth(4); // A cell that is not supercharged
    await expect(targetCell).toHaveAttribute('data-active', 'false');
    await expect(targetCell).toHaveAttribute('data-supercharged', 'false');

    await targetCell.tap(); // Activate first
    await expect(targetCell).toHaveAttribute('data-active', 'true');

    await targetCell.tap(); // First tap of double tap
    await page.waitForTimeout(100); // Small delay between taps
    await targetCell.tap(); // Second tap of double tap

    // Expect shake effect
    await expect(targetCell).toHaveClass(/shake/);
    // Verify cell remains active and not supercharged
    await expect(targetCell).toHaveAttribute('data-active', 'true');
    await expect(targetCell).toHaveAttribute('data-supercharged', 'false');

    await page.waitForTimeout(600);
    await expect(targetCell).not.toHaveClass(/shake/);
  });
});
