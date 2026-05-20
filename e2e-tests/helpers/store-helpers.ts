import type { Page } from '@playwright/test';

/**
 * Simulate a double tap on a cell.
 * This directly calls the store methods used by the touch logic.
 */
export async function doubleTapCell(page: Page, row: number, col: number) {
  await page.evaluate(({ col, row }) => {
    // In useGridCellInteraction.ts, double tap calls handleCellDoubleTap
    window.useGridStore.getState().handleCellDoubleTap(row, col);
  }, { col, row });
}

/**
 * Directly set a cell as supercharged in the store.
 */
export async function forceSupercharge(page: Page, row: number, col: number) {
  await page.evaluate(({ col, row }) => {
    window.useGridStore.getState().toggleCellSupercharged(row, col);
  }, { col, row });
}

/**
 * Get the current shake count from the shake store.
 */
export async function getShakeCount(page: Page): Promise<number> {
  return await page.evaluate(() => window.useShakeStore?.getState().shakeCount || 0);
}

/**
 * Reset the grid to its initial state.
 */
export async function resetGrid(page: Page) {
  await page.evaluate(() => {
    window.useGridStore.getState().resetGrid();
  });
}

/**
 * Set a specific cell as supercharged.
 */
export async function setCellSupercharged(page: Page, row: number, col: number, supercharged: boolean) {
  await page.evaluate(({ col, row, supercharged }) => {
    window.useGridStore.getState().setCellSupercharged(row, col, supercharged);
  }, { col, row, supercharged });
}

/**
 * Wait for optimization to reach a specific status.
 */
export async function waitForOptimization(page: Page, status: 'error' | 'idle' | 'solving' | 'warning') {
  await page.waitForFunction((expected) => {
    return window.useOptimizeStore?.getState().status.type === expected;
  }, status, { timeout: 60000 });
}

/**
 * Wait for the grid store to be initialized on the window object.
 */
export async function waitForStore(page: Page) {
  await page.waitForFunction(() => !!window.useGridStore && !!window.useUiStore);
}

/**
 * Wait for the technology tree to finish loading.
 */
export async function waitForTechTree(page: Page) {
  await page.waitForFunction(() => {
    return window.useUiStore?.getState().isTechTreeLoading === false;
  }, { timeout: 30000 });
}
