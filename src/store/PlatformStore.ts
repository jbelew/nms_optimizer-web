// src/store/PlatformStore.ts
import { create } from "zustand";

/**
 * @interface PlatformState
 * @property {string} selectedPlatform - The currently selected platform.
 * @property {(platform: string, validShipTypes: string[], updateUrl?: boolean) => void} setSelectedPlatform - Function to set the selected platform.
 * @property {(validShipTypes: string[]) => void} initializePlatform - Function to initialize the platform state.
 */
export interface PlatformState {
	selectedPlatform: string;
	setSelectedPlatform: (
		platform: string,
		validShipTypes: string[],
		updateUrl?: boolean,
		isKnownRoute?: boolean
	) => void;
	initializePlatform: (validShipTypes: string[], isKnownRoute?: boolean) => void;
}

const LOCAL_STORAGE_KEY = "selectedPlatform";

/**
 * Zustand store for managing the state of the selected platform.
 */
export const usePlatformStore = create<PlatformState>((set) => ({
	selectedPlatform: "standard", // Default initial value
	setSelectedPlatform: (platform, validShipTypes, updateUrl = true, isKnownRoute = true) => {
		if (!validShipTypes.includes(platform)) {
			console.warn(
				`Attempted to set invalid platform: ${platform}. Falling back to standard.`
			);
			platform = "standard";
		}
		set({ selectedPlatform: platform });
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(LOCAL_STORAGE_KEY, platform);
		}

		if (updateUrl && isKnownRoute && typeof window !== "undefined") {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", platform);
			window.history.pushState({}, "", url.toString());
		}
	},
	initializePlatform: (validShipTypes: string[], isKnownRoute = true) => {
		if (typeof window === "undefined") {
			set({ selectedPlatform: "standard" });
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const platformFromUrl = urlParams.get("platform");
		const platformFromStorage =
			typeof window !== "undefined" && window.localStorage
				? localStorage.getItem(LOCAL_STORAGE_KEY)
				: null;

		let initialPlatform: string = "standard";
		let updateUrlNeeded = false;
		let updateStorageNeeded = false;

		if (platformFromUrl && validShipTypes.includes(platformFromUrl)) {
			initialPlatform = platformFromUrl;
			if (platformFromStorage !== initialPlatform) {
				localStorage.setItem(LOCAL_STORAGE_KEY, initialPlatform);
			}
		} else if (platformFromStorage && validShipTypes.includes(platformFromStorage)) {
			initialPlatform = platformFromStorage;
			updateUrlNeeded = true;
		} else {
			initialPlatform = "standard";
			updateUrlNeeded = true;
			updateStorageNeeded = true;
		}

		set({ selectedPlatform: initialPlatform });

		if (updateUrlNeeded && isKnownRoute) {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", initialPlatform);
			window.history.replaceState({}, "", url.toString());
		}

		if (updateStorageNeeded && typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(LOCAL_STORAGE_KEY, initialPlatform);
		}
	},
}));
