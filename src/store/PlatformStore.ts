// src/store/PlatformStore.ts
import { create } from "zustand";

interface PlatformState {
	selectedPlatform: string;
	setSelectedPlatform: (platform: string, updateUrl?: boolean) => void;
}

const LOCAL_STORAGE_KEY = "selectedPlatform";

export const usePlatformStore = create<PlatformState>((set) => {
	const urlParams = new URLSearchParams(window.location.search);
	const platformFromUrl = urlParams.get("platform");
	const platformFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);

	let initialPlatform: string;
	let updateUrlNeeded = false;
	let updateStorageNeeded = false;

	if (platformFromUrl) {
		// 1. Priority: URL parameter (for shared links)
		initialPlatform = platformFromUrl;
		// Ensure localStorage matches the URL param
		if (platformFromStorage !== initialPlatform) {
			localStorage.setItem(LOCAL_STORAGE_KEY, initialPlatform);
		}
	} else if (platformFromStorage) {
		// 2. Priority: LocalStorage (user's last selection)
		initialPlatform = platformFromStorage;
		updateUrlNeeded = true; // Update URL to reflect the stored value
	} else {
		// 3. Fallback: Default to "standard"
		initialPlatform = "standard";
		updateUrlNeeded = true; // Update URL with the default
		updateStorageNeeded = true; // Store the default
	}

	// Update the URL *after* determining the initial state, only if needed
	if (updateUrlNeeded) {
		const url = new URL(window.location.href);
		url.searchParams.set("platform", initialPlatform);
		// Use replaceState so navigating back doesn't go to the URL without the param
		window.history.replaceState({}, "", url.toString());
	}

	// Update localStorage if needed (only when defaulting)
	if (updateStorageNeeded) {
		localStorage.setItem(LOCAL_STORAGE_KEY, initialPlatform);
	}

	return {
		selectedPlatform: initialPlatform,
		setSelectedPlatform: (platform, updateUrl = true) => {
			set({ selectedPlatform: platform });

			// Update localStorage
			localStorage.setItem(LOCAL_STORAGE_KEY, platform);

			if (updateUrl) {
				const url = new URL(window.location.href);
				url.searchParams.set("platform", platform);
				// Use pushState for user-driven changes to add to history
				// if the change wasn't from a popstate event itself.
				window.history.pushState({}, "", url.toString());
			}
		},
	};
});