// src/utils/apiPreload.ts
import { fetchShipTypes } from "../hooks/useShipTypes/useShipTypes";
import { fetchTechTreeAsync } from "../hooks/useTechTree/useTechTree";
import { resolveInitialPlatform } from "./platformResolver";

/**
 * Initiates critical API calls early in the bootstrap process.
 *
 * By eagerly calling these fetch functions, we populate the internal
 * Promises used by their respective React Suspense caches. This prevents
 * render waterfalls when the component tree finally mounts.
 *
 * @example
 * // Call as early as possible in main.tsx
 * preloadInitialState();
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
