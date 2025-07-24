// src/store/PlatformStore.ts
import { create } from "zustand";

interface PlatformState {
	selectedPlatform: string;
	setSelectedPlatform: (platform: string, validShipTypes: string[], updateUrl?: boolean) => void;
	initializePlatform: (validShipTypes: string[]) => void;
}

const LOCAL_STORAGE_KEY = "selectedPlatform";

export const usePlatformStore = create<PlatformState>((set) => ({
	selectedPlatform: "standard", // Default initial value
	setSelectedPlatform: (platform, validShipTypes, updateUrl = true) => {
		if (!validShipTypes.includes(platform)) {
			console.warn(`Attempted to set invalid platform: ${platform}. Falling back to standard.`);
			platform = "standard";
		}
		set({ selectedPlatform: platform });
		localStorage.setItem(LOCAL_STORAGE_KEY, platform);

		if (updateUrl) {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", platform);
			window.history.pushState({}, "", url.toString());
		}
	},
	initializePlatform: (validShipTypes: string[]) => {
		const urlParams = new URLSearchParams(window.location.search);
		const platformFromUrl = urlParams.get("platform");
		const platformFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);

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

		if (updateUrlNeeded) {
			const url = new URL(window.location.href);
			url.searchParams.set("platform", initialPlatform);
			window.history.replaceState({}, "", url.toString());
		}

		if (updateStorageNeeded) {
			localStorage.setItem(LOCAL_STORAGE_KEY, initialPlatform);
		}
	},
}));
