/**
 * Utility module for touch device detection.
 *
 * @remarks
 * Provides functions to determine if the hardware and browser support touch interaction.
 *
 * @category Utilities
 * @see {@link isTouchDevice}
 */

/**
 * Checks if the current device is a touch-enabled device.
 *
 * @remarks
 * This utility uses the `ontouchstart` event property and `navigator.maxTouchPoints`
 * to determine if the hardware supports touch interaction.
 *
 * @returns {boolean} `true` if the device supports touch, otherwise `false`.
 * @category Utilities
 *
 * @example
 * ```ts
 * const supportsTouch = isTouchDevice();
 * // returns boolean
 * ```
 */
export const isTouchDevice = (): boolean => {
	return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};
