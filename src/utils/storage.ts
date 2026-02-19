/**
 * Safe wrapper for localStorage access to prevent SecurityError exceptions in browsers
 * with strict privacy settings (like Safari with "Block all cookies" or ITP).
 */

/**
 * Safely gets an item from localStorage.
 *
 * @param key - The key to retrieve.
 * @returns The stored string value, or null if not found or access is blocked.
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
 * Safely sets an item in localStorage.
 *
 * @param key - The key to set.
 * @param value - The string value to store.
 * @returns True if successful, false if blocked or storage is full.
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
 * Safely removes an item from localStorage.
 *
 * @param key - The key to remove.
 * @returns True if successful, false if blocked.
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
 * Safely clears all items from localStorage.
 *
 * @returns True if successful, false if blocked.
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
