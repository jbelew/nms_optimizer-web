import { create } from "zustand";

import { API_URL } from "../../constants";
import { usePlatformStore } from "../../store/PlatformStore";

/**
 * @interface ShipTypeDetail
 * @property {string} label - The display label for the ship type.
 * @property {string} type - The category of the ship type.
 */
export interface ShipTypeDetail {
	label: string;
	type: string;
}

/**
 * @interface ShipTypes
 * @property {ShipTypeDetail} [key] - A map of ship type keys to their details.
 */
export interface ShipTypes {
	[key: string]: ShipTypeDetail;
}

/**
 * @typedef {object} Resource<T>
 * @property {() => T} read - A function that returns the resource's data or throws a promise if it's not ready.
 * @template T
 */
export type Resource<T> = {
	read: () => T;
};

/**
 * Creates a resource object that can be used with React Suspense.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to wrap in a resource.
 * @returns {Resource<T>} The resource object.
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
 * Clears the ship types cache.
 */
export const clearShipTypesCache = () => {
	cache.clear();
};

/**
 * Fetches the ship types from the API.
 *
 * @returns {Resource<ShipTypes>} A resource object for use with Suspense.
 */
export function fetchShipTypes(): Resource<ShipTypes> {
	const cacheKey = "shipTypes";

	if (!cache.has(cacheKey)) {
		const promise = fetch(`${API_URL}platforms`)
			.then((res) => {
				if (!res.ok) {
					console.error(
						`HTTP error fetching ship types: ${res.status} ${res.statusText}`
					);
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((data: ShipTypes) => {
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
				if (error instanceof TypeError && error.message === "Failed to fetch") {
					console.error("Likely a network issue or server not running.");
				}
				throw error;
			});

		cache.set(cacheKey, createResource(promise));
	}

	return cache.get(cacheKey)!;
}

/**
 * Custom hook to fetch ship types, for use with React Suspense.
 *
 * @returns {ShipTypes} The ship types data.
 */
export function useFetchShipTypesSuspense(): ShipTypes {
	return fetchShipTypes().read();
}

/**
 * @interface ShipTypesState
 * @property {ShipTypes|null} shipTypes - The available ship types.
 * @property {(shipTypes: ShipTypes) => void} setShipTypes - Function to set the ship types.
 */
export interface ShipTypesState {
	shipTypes: ShipTypes | null;
	setShipTypes: (shipTypes: ShipTypes) => void;
}

/**
 * Zustand store for managing the state of ship types.
 */
export const useShipTypesStore = create<ShipTypesState>((set) => {
	return {
		shipTypes: null,
		setShipTypes: (shipTypes) => set({ shipTypes }),
	};
});
