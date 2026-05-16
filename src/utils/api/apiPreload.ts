/**
 * API preloading utilities for performance optimization.
 *
 * @remarks
 * This module provides functions to initiate critical API requests early in
 * the application bootstrap process, before the React component tree is fully
 * mounted. This helps reduce render waterfalls and improves perceived performance.
 *
 * @see {@link preloadInitialState}
 *
 * @category Utilities
 */

import { fetchShipTypes } from "@/hooks/useShipTypes/useShipTypes";
import { fetchTechTreeAsync } from "@/hooks/useTechTree/useTechTree";
import { resolveInitialPlatform } from "@/utils/browser/platformResolver";

/**
 * Initiates critical API calls early in the bootstrap process.
 *
 * @remarks
 * By eagerly calling these fetch functions, we populate the internal
 * Promises used by their respective React Suspense caches. This prevents
 * render waterfalls when the component tree finally mounts.
 *
 * It preloads:
 * 1. Ship types (platforms).
 * 2. The tech tree for the heuristically determined initial platform.
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link fetchShipTypes}
 * @see {@link fetchTechTreeAsync}
 * @see {@link resolveInitialPlatform}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * // Call as early as possible in main.tsx
 * preloadInitialState();
 * // returns void
 * ```
 */
export const preloadInitialState = () => {
	if (typeof window === "undefined") return;

	// 1. Kick off the ship types (platforms) request immediately.
	fetchShipTypes();

	// 2. Heuristically determine the user's intended ship type so we
	// can kick off the tech tree request in parallel, before the
	// PlatformStore has a chance to officially parse the URL/storage.
	const guessedPlatform = resolveInitialPlatform();

	// 3. Kick off the tech tree request for the guessed platform.
	// If the user's guessed platform is invalid, fetchTechTreeAsync handles it
	// or gracefully errors, and PlatformStore will correct it later.
	fetchTechTreeAsync(guessedPlatform);
};
