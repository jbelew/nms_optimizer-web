// src/utils/platformResolver.ts
import { safeGetItem } from "./storage";

/**
 * The unified local storage key for persisting the active platform.
 */
export const PLATFORM_STORAGE_KEY = "selectedPlatform";

/**
 * The default fallback platform if no valid platform is found.
 */
export const DEFAULT_PLATFORM = "standard";

/**
 * Safely extracts the requested platform identifier from the browser URL.
 *
 * @returns {string | null} The platform identifier found in the query parameters, or null.
 * @example
 * // If URL is ?platform=solar
 * const platform = getPlatformFromUrl(); // returns "solar"
 */
export const getPlatformFromUrl = (): string | null => {
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
 * @returns {string | null} The platform identifier from local storage, or null if not present.
 * @example
 * const platform = getPlatformFromStorage(); // returns "solar" or null
 */
export const getPlatformFromStorage = (): string | null => {
	return safeGetItem(PLATFORM_STORAGE_KEY);
};

/**
 * Heuristically determines the initial platform based on URL query parameters
 * or local storage. This is a pure utility that does NOT validate against
 * the active API schema, making it safe for eager preloading.
 *
 * @returns {string} The heuristically determined platform string.
 * @example
 * const platform = resolveInitialPlatform(); // "solar", "freighter", or "standard"
 */
export const resolveInitialPlatform = (): string => {
	const fromUrl = getPlatformFromUrl();
	const fromStorage = getPlatformFromStorage();

	return fromUrl || fromStorage || DEFAULT_PLATFORM;
};
