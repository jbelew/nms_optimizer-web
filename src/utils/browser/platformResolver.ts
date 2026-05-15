/**
 * Utility module for resolving the active equipment platform.
 *
 * @remarks
 * This module handles the heuristic determination of the user's active platform
 * (e.g., 'starship', 'freighter', 'exosuit') based on URL query parameters
 * and local storage. It facilitates early preloading and session persistence.
 *
 * @see {@link getPlatformFromUrl}
 * @see {@link getPlatformFromStorage}
 * @see {@link resolveInitialPlatform}
 *
 * @category Utilities
 */

import { safeGetItem } from "./environment";

/**
 * The unified local storage key for persisting the active platform.
 *
 * @category Utilities
 */
export const PLATFORM_STORAGE_KEY = "selectedPlatform";

/**
 * The default fallback platform if no valid platform is found.
 *
 * @category Utilities
 */
const DEFAULT_PLATFORM = "standard";

/**
 * Safely extracts the requested platform identifier from the browser URL.
 *
 * @remarks
 * Parses the `window.location.search` for the `platform` parameter.
 * Gracefully handles parsing errors and non-browser environments.
 *
 * @returns {string | null} The platform identifier found in the query parameters, or null.
 *
 * @category Utilities
 *
 * @example
 * // If URL is ?platform=solar
 * const platform = getPlatformFromUrl();
 * // returns "solar"
 */
export const getPlatformFromUrl = (): null | string => {
	if (typeof window === "undefined") return null;

	let urlParams: URLSearchParams;

	try {
		urlParams = new URLSearchParams(window.location.search);
	} catch (e) {
		console.warn("platformResolver: Failed to parse URLSearchParams", e);
		urlParams = new URLSearchParams();
	}

	return urlParams.get("platform");
};

/**
 * Safely extracts the requested platform identifier from local storage.
 *
 * @remarks
 * Uses {@link safeGetItem} to retrieve the persisted platform key.
 *
 * @returns {string | null} The platform identifier from local storage, or null if not present.
 *
 * @see {@link safeGetItem}
 *
 * @category Utilities
 *
 * @example
 * const platform = getPlatformFromStorage();
 * // returns "solar" or null
 */
export const getPlatformFromStorage = (): null | string => {
	return safeGetItem(PLATFORM_STORAGE_KEY);
};

/**
 * Heuristically determines the initial platform based on URL query parameters
 * or local storage.
 *
 * @remarks
 * This is a pure utility that does NOT validate against the active API schema,
 * making it safe for eager preloading in the application bootstrap process.
 * Prioritizes URL parameters over local storage.
 *
 * @returns {string} The heuristically determined platform string.
 *
 * @see {@link getPlatformFromUrl}
 * @see {@link getPlatformFromStorage}
 * @see {@link DEFAULT_PLATFORM}
 *
 * @category Utilities
 *
 * @example
 * const platform = resolveInitialPlatform();
 * // returns "solar", "freighter", or "standard"
 */
export const resolveInitialPlatform = (): string => {
	const fromUrl = getPlatformFromUrl();
	const fromStorage = getPlatformFromStorage();

	return fromUrl || fromStorage || DEFAULT_PLATFORM;
};
