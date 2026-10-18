// src/store/app/platformStore.ts
import { use } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { API_URL } from "@/constants";
import { apiCall } from "@/utils/api/network";
import { safeGetItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

/**
 * The unified local storage key for persisting the active Platform Type.
 *
 * @category Constants
 */
export const PLATFORM_STORAGE_KEY = "selectedPlatform";

/**
 * The default fallback Platform Type when no valid selection is found.
 *
 * @category Constants
 */
const DEFAULT_PLATFORM = "standard";

/**
 * Complete Platform Catalog mapping each Platform Type identifier to its metadata.
 *
 * @see {@link PlatformDetail}
 *
 * @category Interfaces
 */
export interface PlatformCatalog {
	[key: string]: PlatformDetail;
}

/**
 * Metadata for a single Platform Type entry in the Platform Catalog.
 *
 * @see {@link PlatformCatalog}
 *
 * @category Interfaces
 */
export interface PlatformDetail {
	/** The display label for the Platform Type (e.g., `"Exotic"`). */
	label: string;
	/** The grouping classification for the Platform Type (e.g., `"Starship"`, `"Multi-Tool"`). */
	type: string;
}

/**
 * State and actions for managing the Platform Catalog and active Platform Type selection.
 *
 * @see {@link usePlatformStore}
 * @see {@link safeGetItem}
 * @see {@link safeSetItem}
 *
 * @category State
 */
export interface PlatformState {
	/**
	 * Restores the Platform Type selection from URL query parameters or `localStorage`.
	 *
	 * @remarks
	 * Prioritizes the `?platform=` URL parameter over `localStorage`, validating against
	 * the store's loaded {@link PlatformState.platforms} catalog.
	 * Falls back to `"standard"` if neither source provides a valid Platform Type.
	 *
	 * @returns {void} Side-effects only.
	 */
	initializePlatform: () => void;
	/**
	 * Checks whether a candidate Platform Type identifier is non-empty and exists in the loaded catalog.
	 *
	 * @param {string | null | undefined} platform - The Platform Type identifier to validate.
	 *
	 * @returns {platform is string} `true` if `platform` is non-empty and valid against `state.platforms` (or when no catalog is loaded yet).
	 */
	isValidPlatform: (platform: null | string | undefined) => platform is string;
	/** The loaded Platform Catalog dictionary, or `null` before initial fetch completes. */
	platforms: null | PlatformCatalog;
	/** The currently selected Platform Type identifier (e.g., `'solar'`, `'freighter'`). Defaults to `'standard'`. */
	selectedPlatform: string;
	/**
	 * Updates the loaded Platform Catalog in store state.
	 *
	 * @param {PlatformCatalog | null} platforms - The new Platform Catalog dictionary.
	 *
	 * @returns {void} Side-effects only.
	 */
	setPlatforms: (platforms: null | PlatformCatalog) => void;
	/**
	 * Sets the active Platform Type and persists it to `localStorage`.
	 *
	 * @remarks
	 * Validates `platform` against the store's loaded {@link PlatformState.platforms} catalog,
	 * updates Zustand state, persists the selection to `localStorage`, and updates the GA4
	 * `platform_type` user property.
	 *
	 * @param {string} platform - The target Platform Type identifier to select.
	 *
	 * @returns {void} Side-effects only.
	 */
	setSelectedPlatform: (platform: string) => void;
}

const catalogCache = new Map<string, Promise<PlatformCatalog>>();

/**
 * Updates the GA4 `platform_type` user property when Google Analytics is initialized on `window`.
 *
 * @param platform - The active Platform Type identifier.
 *
 * @returns Side-effects only.
 */
const syncAnalyticsPlatformProperty = (platform: string): void => {
	if (typeof window !== "undefined" && "gtag" in window) {
		(window.gtag as (command: string, ...args: unknown[]) => void)("set", "user_properties", {
			platform_type: platform,
		});
	}
};

/**
 * Safely extracts the requested Platform Type identifier from the browser URL.
 *
 * @remarks
 * Parses `window.location.search` for the `platform` query parameter and gracefully
 * handles malformed query strings or non-browser environments.
 *
 * @returns The Platform Type identifier found in query parameters, or `null`.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * // When URL is ?platform=solar
 * const platform = getPlatformFromUrl();
 * // returns "solar"
 * ```
 */
export const getPlatformFromUrl = (): null | string => {
	if (typeof window === "undefined") return null;

	let urlParams: URLSearchParams;

	try {
		urlParams = new URLSearchParams(window.location.search);
	} catch (e) {
		Logger.warn("platformStore: Failed to parse URLSearchParams", { error: e });
		urlParams = new URLSearchParams();
	}

	return urlParams.get("platform");
};

/**
 * Safely extracts the persisted Platform Type identifier from `localStorage`.
 *
 * @returns The Platform Type identifier from `localStorage`, or `null` if absent.
 *
 * @see {@link PLATFORM_STORAGE_KEY}
 * @see {@link safeGetItem}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const platform = getPlatformFromStorage();
 * // returns "solar" or null
 * ```
 */
export const getPlatformFromStorage = (): null | string => {
	return safeGetItem(PLATFORM_STORAGE_KEY);
};

/**
 * Heuristically determines the initial Platform Type from URL query parameters or `localStorage`.
 *
 * @remarks
 * Pure synchronous lookup that does not require the remote Platform Catalog to be loaded first,
 * making it safe for eager preloading and synchronous store initialization.
 * Prioritizes URL parameters over `localStorage`, falling back to `"standard"`.
 *
 * @returns The resolved initial Platform Type identifier.
 *
 * @see {@link getPlatformFromUrl}
 * @see {@link getPlatformFromStorage}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const platform = resolveInitialPlatform();
 * // returns "solar", "freighter", or "standard"
 * ```
 */
export const resolveInitialPlatform = (): string => {
	const fromUrl = getPlatformFromUrl();
	const fromStorage = getPlatformFromStorage();

	return fromUrl || fromStorage || DEFAULT_PLATFORM;
};

/**
 * Zustand store managing the Platform Catalog and active Platform Type selection.
 *
 * @remarks
 * Acts as the single source of truth for the active Platform Type (`selectedPlatform`) and
 * the remote Platform Catalog (`platforms`), keeping URL query parameters, `localStorage`,
 * and technology tree fetching consistent across page reloads and platform switches.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<PlatformState>>} The platform store hook.
 *
 * @see {@link PlatformState}
 * @see {@link fetchPlatforms}
 * @see {@link usePlatformsSuspense}
 * @see {@link ../grid/persistence_regression.test.ts Regression Test}
 *
 * @category State
 *
 * @example
 * ```tsx
 * const selectedPlatform = usePlatformStore((s) => s.selectedPlatform);
 * // returns "solar"
 * ```
 */
export const usePlatformStore = create<PlatformState>()(
	immer((set, get) => ({
		initializePlatform: () => {
			if (typeof window === "undefined") {
				set((state) => {
					state.selectedPlatform = DEFAULT_PLATFORM;
				});

				return;
			}

			const { isValidPlatform } = get();
			const platformFromUrl = getPlatformFromUrl();
			const platformFromStorage = getPlatformFromStorage();

			let updateStorageNeeded = false;
			let initialPlatform: string;

			if (isValidPlatform(platformFromUrl)) {
				initialPlatform = platformFromUrl;

				if (platformFromStorage !== initialPlatform) {
					safeSetItem(PLATFORM_STORAGE_KEY, initialPlatform);
				}
			} else if (isValidPlatform(platformFromStorage)) {
				initialPlatform = platformFromStorage;
			} else {
				initialPlatform = DEFAULT_PLATFORM;
				updateStorageNeeded = true;
			}

			if (get().selectedPlatform !== initialPlatform) {
				set((state) => {
					state.selectedPlatform = initialPlatform;
				});
			}

			if (updateStorageNeeded) {
				safeSetItem(PLATFORM_STORAGE_KEY, initialPlatform);
			}

			syncAnalyticsPlatformProperty(initialPlatform);
		},
		isValidPlatform: (platform): platform is string => {
			if (typeof platform !== "string" || platform.length === 0) {
				return false;
			}

			const { platforms } = get();

			return platforms === null || Object.prototype.hasOwnProperty.call(platforms, platform);
		},
		platforms: null,
		selectedPlatform: resolveInitialPlatform(),
		setPlatforms: (platforms) => {
			set((state) => {
				state.platforms = platforms;
			});
		},
		setSelectedPlatform: (platform) => {
			if (!get().isValidPlatform(platform)) {
				Logger.warn(
					`Attempted to set invalid platform: ${platform}. Falling back to standard.`,
				);
				platform = DEFAULT_PLATFORM;
			}

			set((state) => {
				state.selectedPlatform = platform;
			});

			safeSetItem(PLATFORM_STORAGE_KEY, platform);
			syncAnalyticsPlatformProperty(platform);
		},
	})),
);

/**
 * Fetches the Platform Catalog from `/platforms` and synchronizes `usePlatformStore`.
 *
 * @remarks
 * Caches the in-flight/resolved Promise so concurrent callers share a single network request.
 * Upon resolution, populates `usePlatformStore.getState().platforms` and validates the initial
 * `selectedPlatform` against the loaded catalog.
 *
 * @returns A promise resolving to the Platform Catalog dictionary.
 *
 * @see {@link usePlatformStore}
 * @see {@link usePlatformsSuspense}
 * @see {@link apiCall}
 *
 * @category State
 *
 * @example
 * ```ts
 * const catalog = await fetchPlatforms();
 * // returns { standard: { label: "Standard", type: "Starship" }, ... }
 * ```
 */
export function fetchPlatforms(): Promise<PlatformCatalog> {
	const cacheKey = "platforms";

	if (!catalogCache.has(cacheKey)) {
		const baseUrl =
			API_URL ?
				API_URL.endsWith("/") ?
					API_URL
				:	`${API_URL}/`
			:	"/";
		const promise = apiCall<PlatformCatalog>(`${baseUrl}platforms`, {}, 10000)
			.then((data) => {
				const platformStore = usePlatformStore.getState();
				platformStore.setPlatforms(data);
				platformStore.initializePlatform();

				return data;
			})
			.catch((error) => {
				Logger.error("Error fetching platforms:", error);

				return {} as PlatformCatalog;
			});

		catalogCache.set(cacheKey, promise);
	}

	return catalogCache.get(cacheKey)!;
}

/**
 * Clears the cached {@link fetchPlatforms} Promise for isolated test runs.
 *
 * @returns Side-effects only.
 *
 * @see {@link fetchPlatforms}
 * @see {@link ./platformStore.test.ts Unit Tests}
 *
 * @category State
 *
 * @example
 * ```ts
 * resetPlatformsCache();
 * // clears the in-memory Platform Catalog promise cache
 * ```
 */
export function resetPlatformsCache(): void {
	catalogCache.clear();
}

/**
 * Suspense hook that resolves and returns the loaded Platform Catalog.
 *
 * @remarks
 * Uses React's `use()` hook to unwrap the cached {@link fetchPlatforms} promise,
 * suspending the calling component until the Platform Catalog is ready.
 *
 * @returns The loaded Platform Catalog dictionary.
 *
 * @see {@link fetchPlatforms}
 * @see {@link usePlatformStore}
 *
 * @hook
 *
 * @category State
 *
 * @example
 * ```tsx
 * const platforms = usePlatformsSuspense();
 * // returns { standard: { label: "Standard", type: "Starship" }, ... }
 * ```
 */
export function usePlatformsSuspense(): PlatformCatalog {
	return use(fetchPlatforms());
}
