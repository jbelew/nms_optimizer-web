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

export type Resource<T> = {
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

export const clearShipTypesCache = () => {
    cache.clear();
};

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
				const shipTypesState = useShipTypesStore.getState();
				shipTypesState.setShipTypes(data);
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
	setShipTypes: (shipTypes: ShipTypes) => void;
}

export const useShipTypesStore = create<ShipTypesState>((set) => {
	return {
		shipTypes: null, // Initialize as null
		setShipTypes: (shipTypes) => set({ shipTypes }), // Add this line
	};
});
