/**
 * Safe wrapper for `localStorage` access to prevent `SecurityError` exceptions.
 *
 * These wrappers catch errors in browsers with strict privacy settings (like Safari
 * with "Block all cookies" enabled) or when storage is full.
 *
 * @category Utilities
 */

/**
 * Safely retrieves an item from `localStorage`.
 *
 * @param {string} key - The key to retrieve. **Must not be empty.**
 * @returns {string | null} The stored string value, or `null` if not found or access is blocked.
 * @see {@link safeSetItem}
 * @see {@link safeRemoveItem}
 * @category Utilities
 *
 * @example
 * const theme = safeGetItem("app_theme");
 */
export const safeGetItem = (key: string): string | null => {
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
 * @returns {boolean} `true` if the item was successfully saved, otherwise `false`.
 * @see {@link safeGetItem}
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
 * @returns {boolean} `true` if the item was successfully removed, otherwise `false`.
 * @see {@link safeGetItem}
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
 * @see {@link safeRemoveItem}
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
