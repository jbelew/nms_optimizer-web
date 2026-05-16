// src/store/app/platformStore.ts
import { create } from "zustand";

import { safeGetItem, safeSetItem } from "@/utils/browser/environment";
import {
	getPlatformFromStorage,
	getPlatformFromUrl,
	PLATFORM_STORAGE_KEY,
	resolveInitialPlatform,
} from "@/utils/browser/platformResolver";

/**
 * State and actions for the ship type (platform) selection.
 *
 * @see {@link safeGetItem}
 * @see {@link safeSetItem}
 *
 * @category State
 */
export interface PlatformState {
	/**
	 * Restores the platform selection from URL parameters or `localStorage`.
	 *
	 * This method is typically called during application initialization or route changes.
	 * It prioritizes URL parameters over stored values.
	 *
	 * @param {string[]} validShipTypes - Array of valid ship type identifiers for validation.
	 * @param {boolean} [isKnownRoute=true] - Whether to allow URL synchronization.
	 *
	 * @returns {void} Side-effects only.
	 */
	initializePlatform: (validShipTypes: string[], isKnownRoute?: boolean) => void;
	/** The currently selected ship type identifier (e.g., `'solar'`, `'freighter'`). Defaults to `'standard'`. */
	selectedPlatform: string;
	/**
	 * Sets the active ship type and synchronizes it with storage and the URL.
	 *
	 * This method performs validation against `validShipTypes`, updates the Zustand state,
	 * persists the selection to `localStorage`, and optionally pushes a new state to the
	 * browser's history to update the `?platform=` query parameter.
	 *
	 * @param {string} platform - The new platform identifier to set.
	 * @param {string[]} validShipTypes - Array of valid identifiers for validation.
	 * @param {boolean} [updateUrl=true] - Whether to push a new state to the browser history.
	 * @param {boolean} [isKnownRoute=true] - Whether the current route supports platform synchronization.
	 *
	 * @returns {void} Side-effects only.
	 */
	setSelectedPlatform: (
		platform: string,
		validShipTypes: string[],
		updateUrl?: boolean,
		isKnownRoute?: boolean
	) => void;
}

const LOCAL_STORAGE_KEY = PLATFORM_STORAGE_KEY;

/**
 * Zustand store for managing the active ship type context.
 *
 * This store ensures that the application's technology context (Starship,
 * Multi-tool, etc.) is consistent across page reloads and can be shared via URLs.
 * It acts as a single source of truth for the platform-specific data fetching.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<PlatformState>>} The platform store hook.
 *
 * @see {@link PlatformState}
 * @see {@link ../grid/persistence_regression.test.ts Regression Test}
 *
 * @category State
 *
 * @example
 * ```tsx
 * const selectedPlatform = usePlatformStore((s) => s.selectedPlatform);
 *
 * // returns "solar"
 * ```
 */
export const usePlatformStore = create<PlatformState>((set) => ({
	initializePlatform: (validShipTypes: string[], _isKnownRoute = true) => {
		if (typeof window === "undefined") {
			set({ selectedPlatform: "standard" });

			return;
		}

		const platformFromUrl = getPlatformFromUrl();
		const platformFromStorage = getPlatformFromStorage();

		let updateStorageNeeded = false;
		let initialPlatform: string;

		if (platformFromUrl && validShipTypes.includes(platformFromUrl)) {
			initialPlatform = platformFromUrl;

			if (platformFromStorage !== initialPlatform) {
				safeSetItem(LOCAL_STORAGE_KEY, initialPlatform);
			}
		} else if (platformFromStorage && validShipTypes.includes(platformFromStorage)) {
			initialPlatform = platformFromStorage;
		} else {
			initialPlatform = "standard";
			updateStorageNeeded = true;
		}

		if (usePlatformStore.getState().selectedPlatform !== initialPlatform) {
			set({ selectedPlatform: initialPlatform });
		}

		if (updateStorageNeeded) {
			safeSetItem(LOCAL_STORAGE_KEY, initialPlatform);
		}
	},
	selectedPlatform: resolveInitialPlatform(), // Initialized from URL or storage
	setSelectedPlatform: (platform, validShipTypes, _updateUrl = true, _isKnownRoute = true) => {
		if (!validShipTypes.includes(platform)) {
			console.warn(
				`Attempted to set invalid platform: ${platform}. Falling back to standard.`
			);
			platform = "standard";
		}

		set({ selectedPlatform: platform });

		safeSetItem(LOCAL_STORAGE_KEY, platform);

		// Update GA4 user property if initialized
		if (typeof window !== "undefined" && "gtag" in window) {
			(window.gtag as (command: string, ...args: unknown[]) => void)(
				"set",
				"user_properties",
				{
					platform_type: platform,
				}
			);
		}
	},
}));
