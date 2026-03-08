/**
 * Checks if the current device is a touch-enabled device.
 *
 * This utility uses the `ontouchstart` event property and `navigator.maxTouchPoints`
 * to determine if the hardware supports touch interaction.
 *
 * @returns {boolean} `true` if the device supports touch, otherwise `false`.
 *
 * @example
 * const supportsTouch = isTouchDevice();
 */
export const isTouchDevice = (): boolean => {
	return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};
