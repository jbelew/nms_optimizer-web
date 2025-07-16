// src/store/PlatformStore.ts
import { create } from "zustand";

interface PlatformState {
	selectedPlatform: string;
	setSelectedPlatform: (platform: string, updateUrl?: boolean) => void;
}

const LOCAL_STORAGE_KEY = "selectedPlatform";

export const usePlatformStore = create<PlatformState>((set) => {
	console.log("PlatformStore: Initializing...");
	// --- Logic to read initial state and update URL/localStorage if needed ---
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
			console.log(
				`PlatformStore: Initialized from URL param '${initialPlatform}', updated localStorage.`
			);
		} else {
			console.log(`PlatformStore: Initialized from URL param '${initialPlatform}'.`);
		}
	} else if (platformFromStorage) {
		// 2. Priority: LocalStorage (user's last selection)
		initialPlatform = platformFromStorage;
		updateUrlNeeded = true; // Update URL to reflect the stored value
		console.log(
			`PlatformStore: Initialized from localStorage '${initialPlatform}', will update URL.`
		);
	} else {
		// 3. Fallback: Default to "standard"
		initialPlatform = "standard";
		updateUrlNeeded = true; // Update URL with the default
		updateStorageNeeded = true; // Store the default
		console.log(`PlatformStore: No URL param or localStorage found. Defaulting to '${initialPlatform}', will update URL and localStorage.`);
	}

	console.log(`PlatformStore: Determined initialPlatform: ${initialPlatform}`);

	// Update the URL *after* determining the initial state, only if needed
	if (updateUrlNeeded) {
		const url = new URL(window.location.href);
		url.searchParams.set("platform", initialPlatform);
		// Use replaceState so navigating back doesn't go to the URL without the param
		window.history.replaceState({}, "", url.toString());
		console.log("PlatformStore: Updated URL.");
	}

	// Update localStorage if needed (only when defaulting)
	if (updateStorageNeeded) {
		localStorage.setItem(LOCAL_STORAGE_KEY, initialPlatform);
		console.log("PlatformStore: Updated localStorage with default.");
	}
	// --- End of initial state logic ---

	return {
		selectedPlatform: initialPlatform,
		setSelectedPlatform: (platform, updateUrl = true) => {
			set({ selectedPlatform: platform });
			console.log(`PlatformStore: setSelectedPlatform called with: ${platform}`);

			// Update localStorage
			localStorage.setItem(LOCAL_STORAGE_KEY, platform);
			console.log(
				`PlatformStore: Set selectedPlatform to '${platform}' and updated localStorage.`
			);

			if (updateUrl) {
				const url = new URL(window.location.href);
				url.searchParams.set("platform", platform);
				// Use pushState for user-driven changes to add to history
				// if the change wasn't from a popstate event itself.
				window.history.pushState({}, "", url.toString());
				console.log(`PlatformStore: Updated URL for '${platform}'.`);
			}
		},
	};
});
