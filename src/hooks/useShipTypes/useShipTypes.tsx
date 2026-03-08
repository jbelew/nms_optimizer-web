import { create } from "zustand";

import { API_URL } from "../../constants";
import { usePlatformStore } from "../../store/PlatformStore";
import { apiCall } from "../../utils/apiCall";

/**
 * Details of a specific ship type.
 */
export interface ShipTypeDetail {
	/** The display label for the ship type. */
	label: string;
	/** The category identifier for the ship type. */
	type: string;
}

/**
 * A dictionary of ship types, where each key is a ship type identifier.
 */
export interface ShipTypes {
	[key: string]: ShipTypeDetail;
}

/**
 * A generic resource object compatible with React Suspense.
 */
export type Resource<T> = {
	/** Returns the data if ready, or throws a promise/error for Suspense to handle. */
	read: () => T;
};

/**
 * Creates a Suspense-compatible resource object from a promise.
 *
 * @template T - The type of data being loaded.
 * @param {Promise<T>} promise - The asynchronous operation to wrap. **Must eventually resolve.**
 * @returns {Resource<T>} A resource object with a `read` method.
 *
 * @example
 * const userResource = createResource(fetchUser(id));
 */
const createResource = <T,>(promise: Promise<T>): Resource<T> => {
	let status: "pending" | "success" | "error" = "pending";
	let result: T;
	let error: Error;

	const suspender = promise
		.then((res: T) => {
			status = "success";
			result = res;
		})
		.catch((err: Error) => {
			status = "error";
			error = err;
		});

	return {
		read(): T {
			if (status === "pending") throw suspender;
			if (status === "error") throw error;

			if (result === undefined || result === null) {
				throw new Error("Result is undefined or null");
			}

			return result;
		},
	};
};

const cache = new Map<string, Resource<ShipTypes>>();

/**
 * Clears the internal ship types resource cache.
 *
 * @returns {void}
 */
export const clearShipTypesCache = () => {
	cache.clear();
};

/**
 * Initiates a fetch for all available ship types from the API.
 *
 * This function caches the resulting resource to ensure multiple calls
 * do not trigger redundant network requests. It also updates the
 * `ShipTypesStore` and `PlatformStore` upon success.
 *
 * @returns {Resource<ShipTypes>} A Suspense resource containing ship type data.
 *
 * @example
 * const resource = fetchShipTypes();
 */
export function fetchShipTypes(): Resource<ShipTypes> {
	const cacheKey = "shipTypes";

	if (!cache.has(cacheKey)) {
		const baseUrl = API_URL ? (API_URL.endsWith("/") ? API_URL : `${API_URL}/`) : "/";
		const promise = apiCall<ShipTypes>(`${baseUrl}platforms`, {}, 10000)
			.then((data) => {
				console.log("Fetched ship types:", data);
				const shipTypesState = useShipTypesStore.getState();
				shipTypesState.setShipTypes(data);

				usePlatformStore.getState().initializePlatform(Object.keys(data));
				usePlatformStore
					.getState()
					.setSelectedPlatform(
						usePlatformStore.getState().selectedPlatform,
						Object.keys(data),
						false
					);

				return data;
			})
			.catch((error) => {
				console.error("Error fetching ship types:", error);

				// Error dialog is already triggered by apiCall
				// Return empty object to prevent Suspense from throwing
				return {} as ShipTypes;
			});

		cache.set(cacheKey, createResource(promise));
	}

	return cache.get(cacheKey)!;
}

/**
 * Custom hook for retrieving ship types within a Suspense boundary.
 *
 * @returns {ShipTypes} The loaded ship types data.
 *
 * @example
 * const shipTypes = useFetchShipTypesSuspense();
 */
export function useFetchShipTypesSuspense(): ShipTypes {
	return fetchShipTypes().read();
}

/**
 * State and actions for the ship types store.
 */
export interface ShipTypesState {
	/** The dictionary of available ship types. */
	shipTypes: ShipTypes | null;
	/** Updates the ship types in the store. */
	setShipTypes: (shipTypes: ShipTypes) => void;
}

/**
 * Zustand store for managing the global state of available ship types.
 */
export const useShipTypesStore = create<ShipTypesState>((set) => {
	return {
		shipTypes: null,
		setShipTypes: (shipTypes) => set({ shipTypes }),
	};
});
