import { Page } from '@playwright/test';

/**
 * Wait for the grid store to be initialized on the window object.
 */
export async function waitForStore(page: Page) {
  await page.waitForFunction(() => !!(window as any).useGridStore);
}

/**
 * Reset the grid to its initial state.
 */
export async function resetGrid(page: Page) {
  await page.evaluate(() => {
    (window as any).useGridStore.getState().resetGrid();
  });
}

/**
 * Set a specific cell as supercharged.
 */
export async function setCellSupercharged(page: Page, row: number, col: number, supercharged: boolean) {
  await page.evaluate(({ row, col, supercharged }) => {
    (window as any).useGridStore.getState().setCellSupercharged(row, col, supercharged);
  }, { row, col, supercharged });
}

/**
 * Simulate a double tap on a cell.
 * This directly calls the store methods used by the touch logic.
 */
export async function doubleTapCell(page: Page, row: number, col: number) {
  await page.evaluate(({ row, col }) => {
    // In useGridCellInteraction.ts, double tap calls handleCellDoubleTap
    (window as any).useGridStore.getState().handleCellDoubleTap(row, col);
  }, { row, col });
}

/**
 * Directly set a cell as supercharged in the store.
 */
export async function forceSupercharge(page: Page, row: number, col: number) {
  await page.evaluate(({ row, col }) => {
    (window as any).useGridStore.getState().toggleCellSupercharged(row, col);
  }, { row, col });
}

/**
 * Get the current shake count from the shake store.
 */
export async function getShakeCount(page: Page): Promise<number> {
  return await page.evaluate(() => (window as any).useShakeStore?.getState().shakeCount || 0);
}
