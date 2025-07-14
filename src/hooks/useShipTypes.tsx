// src/hooks/useShipTypes.tsx
import { create } from "zustand";

import { API_URL } from "../constants";

// Define the structure for the details of a single ship type
export interface ShipTypeDetail {
	label: string;
	type: string; // You could potentially use a union type like 'Starship' | 'Multi-Tool' if the types are fixed
}

// Define the structure of the ship types data using the detailed interface
export interface ShipTypes {
	[key: string]: ShipTypeDetail;
}

type Resource<T> = {
	read: () => T;
};

/**
 * Creates a resource from a promise, which can be used with React Suspense.
 * (Implementation remains the same)
 */
const createResource = <T,>(promise: Promise<T>): Resource<T> => {
	// ... (createResource implementation as before)
	let status: "pending" | "success" | "error" = "pending";
	let result: T;
	let error: Error;

	const suspender = promise
		.then((res: T) => {
			// Explicitly type 'res' as T, the resolved type of the promise
			status = "success";
			result = res;
		})
		.catch((err: Error) => {
			// Explicitly type 'err' as Error
			status = "error";
			error = err;
		});

	return {
		/**
		 * Reads the resource, throwing if it's still pending or errored, or returning the result.
		 *
		 * @throws Will throw the promise if pending, or the error if there was an error.
		 * @returns {T} The result of the promise if successful.
		 */
		read(): T {
			 
			if (status === "pending") throw suspender; // Throw promise for suspense
			if (status === "error") throw error; // Throw the error if it occurred
			if (result === undefined || result === null) {
				throw new Error("Result is undefined or null");
			}
			return result; // Return the result if successful
		},
	};
};

// Store successful fetches - Note: The type parameter for Resource is now the updated ShipTypes
const cache = new Map<string, Resource<ShipTypes>>();

/**
 * Fetches ship types and stores them in the cache.
 *
 * The function returns a resource that can be used with React Suspense.
 * If the resource is already in the cache, it will return the cached version.
 * If not, it will create a promise to fetch the ship types, store the promise in the cache,
 * and return a resource that will trigger the Suspense boundary when the promise resolves.
 */
export function fetchShipTypes(): Resource<ShipTypes> {
	// Cache key for the ship types
	const cacheKey = "shipTypes";

	if (!cache.has(cacheKey)) {
		// Create a promise to fetch the ship types
		const promise = fetch(`${API_URL}platforms`)
			.then((res) => {
				// Check for HTTP errors
				if (!res.ok) {
					console.error(`HTTP error fetching ship types: ${res.status} ${res.statusText}`);
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				// Return the JSON response
				return res.json();
			})
			.then((data: ShipTypes) => {
				// Log the data to the console
				console.log("Fetched ship types:", data);
				const state = useShipTypesStore.getState();
				state.setShipTypes(data);

				// After fetching, validate that the current selection is a valid type.
				// The initial selection is set by the store's create function from the URL or localStorage.
				const currentSelected = state.selectedShipType;
				const availableTypes = Object.keys(data);

				// If the current selection is not in the fetched list, reset to "standard".
				if (availableTypes.length > 0 && !availableTypes.includes(currentSelected)) {
					console.warn(
						`Selected ship type "${currentSelected}" is not valid. Resetting to "standard".`
					);
					// This will update the state and localStorage, but not the URL, to prevent a loop.
					state.setSelectedShipType("standard", false);
				}
				return data;
			})
			.catch((error) => {
				// Log any errors to the console
				console.error("Error fetching ship types:", error);
				if (error instanceof TypeError && error.message === "Failed to fetch") {
					console.error("Likely a network issue or server not running.");
				}
				// Rethrow the error so it can be handled by the caller
				throw error;
			});

		// Store the promise in the cache
		cache.set(cacheKey, createResource(promise));
	}

	// Return the cached resource
	return cache.get(cacheKey)!;
}

/**
 * Custom React hook to fetch ship types using Suspense.
 * (Implementation remains the same)
 */
export function useFetchShipTypesSuspense(): ShipTypes {
	return fetchShipTypes().read();
}

// --- Zustand Store ---
export interface ShipTypesState {
	shipTypes: ShipTypes | null;
	selectedShipType: string;
	setSelectedShipType: (shipType: string, updateUrl?: boolean) => void; // Add optional flag
	setShipTypes: (shipTypes: ShipTypes) => void;
}

const LOCAL_STORAGE_KEY = "selectedPlatform";

export const useShipTypesStore = create<ShipTypesState>((set) => {
	// --- Logic to read initial state and update URL/localStorage if needed ---
	const urlParams = new URLSearchParams(window.location.search);
	const platformFromUrl = urlParams.get("platform");
	const platformFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);

	let initialShipType: string;
	let updateUrlNeeded = false;
	let updateStorageNeeded = false;

	if (platformFromUrl) {
		// 1. Priority: URL parameter (for shared links)
		initialShipType = platformFromUrl;
		// Ensure localStorage matches the URL param
		if (platformFromStorage !== initialShipType) {
			localStorage.setItem(LOCAL_STORAGE_KEY, initialShipType);
			console.log(
				`useShipTypesStore: Initialized from URL param '${initialShipType}', updated localStorage.`
			);
		} else {
			console.log(`useShipTypesStore: Initialized from URL param '${initialShipType}'.`);
		}
	} else if (platformFromStorage) {
		// 2. Priority: LocalStorage (user's last selection)
		initialShipType = platformFromStorage;
		updateUrlNeeded = true; // Update URL to reflect the stored value
		console.log(
			`useShipTypesStore: Initialized from localStorage '${initialShipType}', will update URL.`
		);
	} else {
		// 3. Fallback: Default to "standard"
		initialShipType = "standard";
		updateUrlNeeded = true; // Update URL with the default
		updateStorageNeeded = true; // Store the default
		// console.log(`useShipTypesStore: No URL param or localStorage found. Defaulting to '${initialShipType}', will update URL and localStorage.`);
	}

	// Update the URL *after* determining the initial state, only if needed
	if (updateUrlNeeded) {
		const url = new URL(window.location.href);
		url.searchParams.set("platform", initialShipType);
		// Use replaceState so navigating back doesn't go to the URL without the param
		window.history.replaceState({}, "", url.toString());
		// console.log("useShipTypesStore: Updated URL.");
	}

	// Update localStorage if needed (only when defaulting)
	if (updateStorageNeeded) {
		localStorage.setItem(LOCAL_STORAGE_KEY, initialShipType);
		// console.log("useShipTypesStore: Updated localStorage with default.");
	}
	// --- End of initial state logic ---

	return {
		shipTypes: null, // Initialize as null
		selectedShipType: initialShipType, // Use the determined initial type
		setShipTypes: (shipTypes) => set({ shipTypes }), // Add this line
		setSelectedShipType: (shipType, updateUrl = true) => {
			// Default updateUrl to true
			set({ selectedShipType: shipType });

			// Update localStorage
			localStorage.setItem(LOCAL_STORAGE_KEY, shipType);
			console.log(
				`useShipTypesStore: Set selectedShipType to '${shipType}' and updated localStorage.`
			);

			if (updateUrl) {
				const url = new URL(window.location.href);
				url.searchParams.set("platform", shipType);
				// Use pushState for user-driven changes to add to history
				// if the change wasn't from a popstate event itself.
				window.history.pushState({}, "", url.toString());
				console.log(`useShipTypesStore: Updated URL for '${shipType}'.`);
			}
		},
	};
});
