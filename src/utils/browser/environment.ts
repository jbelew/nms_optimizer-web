/**
 * Browser and environment utility module.
 *
 * @remarks
 * This module provides utilities for detecting browser features, environment properties,
 * and safe interaction with browser APIs like `localStorage`.
 *
 * @category Utilities
 */

/**
 * A regex pattern matching the User-Agent strings of common web crawlers and bots.
 *
 * @remarks
 * This list covers major search engine crawlers (Googlebot, Bingbot, etc.) as well as
 * generic headless browser and bot indicators.
 *
 * @category Utilities
 */
const BOT_USER_AGENT_PATTERN =
	/bot|crawl|spider|slurp|mediapartners|facebookexternalhit|ia_archiver|google|lighthouse|chrome-lighthouse|pingdom|uptime|speedcurve|headless|phantom|webdriver|pinterest|whatsapp|twitterbot|linkedinbot|embedly|quora|outbrain|rogerbot|bufferbot|duckduckbot|semrushbot|ahrefsbot|mj12bot|dotbot|archive\.org|baidu/i;

/**
 * Detects whether the current visitor is likely a bot or web crawler.
 *
 * @remarks
 * Uses heuristics including `navigator.webdriver`, the `.is-bot` CSS class on
 * the document root, and User-Agent string matching against known bot signatures.
 *
 * This check is used to suppress non-essential UI (like Welcome dialogs) for
 * automated visitors to improve SEO and prevent unwanted interactions.
 * **Note: This is not a security-critical check.**
 *
 * @returns {boolean} `true` if the visitor is likely a bot, false otherwise.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * if (isBot()) {
 *   console.log("Welcome dialog suppressed for crawler.");
 * }
 * // returns true if bot
 * ```
 */
export function isBot(): boolean {
	// 1. Explicit webdriver flag
	if (typeof navigator !== "undefined" && navigator.webdriver) {
		return true;
	}

	// 2. Class added by index.html early bot detection script
	if (typeof document !== "undefined" && document.documentElement?.classList.contains("is-bot")) {
		return true;
	}

	// 3. User-Agent pattern matching
	if (typeof navigator !== "undefined") {
		return BOT_USER_AGENT_PATTERN.test(navigator.userAgent);
	}

	return false;
}

/**
 * Checks if the current device is a touch-enabled device.
 *
 * @remarks
 * This utility uses the `ontouchstart` event property and `navigator.maxTouchPoints`
 * to determine if the hardware supports touch interaction.
 *
 * @returns {boolean} `true` if the device supports touch, otherwise `false`.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const supportsTouch = isTouchDevice();
 * // returns boolean
 * ```
 */
export const isTouchDevice = (): boolean => {
	if (typeof window === "undefined") return false;

	return (
		"ontouchstart" in window ||
		(typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
	);
};

/**
 * Safely retrieves an item from `localStorage`.
 *
 * @param {string} key - The key to retrieve. **Must not be empty.**
 *
 * @returns {string | null} The stored string value, or `null` if not found or access is blocked.
 *
 * @see {@link safeSetItem}
 * @see {@link safeRemoveItem}
 *
 * @category Utilities
 *
 * @example
 * const theme = safeGetItem("app_theme");
 */
export const safeGetItem = (key: string): null | string => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			return localStorage.getItem(key);
		}
	} catch (e) {
		console.warn(`Storage: Failed to get item "${key}" from localStorage.`, e);
	}

	return null;
};

/**
 * Safely stores an item in `localStorage`.
 *
 * @param {string} key - The key to set. **Must not be empty.**
 * @param {string} value - The string value to store.
 *
 * @returns {boolean} `true` if the item was successfully saved, otherwise `false`.
 *
 * @see {@link safeGetItem}
 *
 * @category Utilities
 *
 * @example
 * const success = safeSetItem("user_id", "12345");
 */
export const safeSetItem = (key: string, value: string): boolean => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(key, value);

			return true;
		}
	} catch (e) {
		console.warn(`Storage: Failed to set item "${key}" in localStorage.`, e);
	}

	return false;
};

/**
 * Safely removes an item from `localStorage`.
 *
 * @param {string} key - The key to remove. **Must not be empty.**
 *
 * @returns {boolean} `true` if the item was successfully removed, otherwise `false`.
 *
 * @see {@link safeGetItem}
 *
 * @category Utilities
 *
 * @example
 * safeRemoveItem("temp_session");
 */
export const safeRemoveItem = (key: string): boolean => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.removeItem(key);

			return true;
		}
	} catch (e) {
		console.warn(`Storage: Failed to remove item "${key}" from localStorage.`, e);
	}

	return false;
};

/**
 * Safely clears all items from `localStorage`.
 *
 * @returns {boolean} `true` if the storage was successfully cleared, otherwise `false`.
 *
 * @see {@link safeRemoveItem}
 *
 * @category Utilities
 *
 * @example
 * safeClear();
 */
export const safeClear = (): boolean => {
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.clear();

			return true;
		}
	} catch (e) {
		console.warn("Storage: Failed to clear localStorage.", e);
	}

	return false;
};
