/**
 * Splash screen visibility management legacy compatibility module.
 *
 * @remarks
 * This module provides legacy compatibility helpers for dismissing the application splash screen
 * by delegating to the {@link lifecycleCoordinator}.
 *
 * @see {@link hideSplashScreenAndShowBackground}
 * @see {@link lifecycleCoordinator}
 * @see {@link ./splashScreen.test.ts Unit Tests}
 *
 * @category Utilities
 */

import { lifecycleCoordinator } from "@/utils/system/lifecycleCoordinator";

/**
 * Hides the splash screen and reveals the application background.
 *
 * @remarks
 * Delegates view readiness and splash dismissal to the {@link lifecycleCoordinator}.
 *
 * @returns {Promise<void>} A promise that resolves once readiness is signaled.
 *
 * @deprecated Use {@link lifecycleCoordinator.markReady} instead.
 *
 * @see {@link lifecycleCoordinator}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * await hideSplashScreenAndShowBackground();
 * // returns Promise<void>
 * ```
 */
export async function hideSplashScreenAndShowBackground(): Promise<void> {
	lifecycleCoordinator.markReady();
}
