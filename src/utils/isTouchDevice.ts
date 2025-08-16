/**
 * Checks if the current device is a touch-enabled device.
 *
 * @returns {boolean} True if the device supports touch, false otherwise.
 */
export const isTouchDevice = (): boolean => {
	return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};
