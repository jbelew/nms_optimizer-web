// src/store/PlatformStore.ts
import { create } from "zustand";

interface PlatformState {
	selectedPlatform: string;
	setSelectedPlatform: (platform: string, updateUrl?: boolean) => void;
}

export const usePlatformStore = create<PlatformState>((set) => {
	console.log("PlatformStore: Initializing...");
	// --- Logic to read initial state and update URL if needed ---
	const urlParams = new URLSearchParams(window.location.search);
	const platformFromUrl = urlParams.get("platform");

	let initialPlatform: string;
	let updateUrlNeeded = false;

	if (platformFromUrl) {
		// 1. Priority: URL parameter (for shared links)
		initialPlatform = platformFromUrl;
		console.log(`PlatformStore: Initialized from URL param '${initialPlatform}'.`);
	} else {
		// 2. Fallback: Default to "standard"
		initialPlatform = "standard";
		updateUrlNeeded = true; // Update URL with the default
		console.log(`PlatformStore: No URL param found. Defaulting to '${initialPlatform}', will update URL.`);
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
	// --- End of initial state logic ---

	return {
		selectedPlatform: initialPlatform,
		setSelectedPlatform: (platform, updateUrl = true) => {
			set({ selectedPlatform: platform });
			console.log(`PlatformStore: setSelectedPlatform called with: ${platform}`);

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
