import { create } from "zustand";

import { API_URL } from "@/constants";
import { usePlatformStore } from "@/store/app/platformStore";
import { apiCall } from "@/utils/api/network";

/**
 * A generic resource object compatible with React Suspense.
 *
 * @template T - The type of data being loaded.
 *
 * @category Types
 */
export type Resource<T> = {
	/** Returns the data if ready, or throws a promise/error for Suspense to handle. */
	read: () => T;
};

/**
 * Details of a specific ship type.
 *
 * @category Interfaces
 */
export interface ShipTypeDetail {
	/** The display label for the ship type (e.g., "Exotic"). */
	label: string;
	/** The category identifier for the ship type (e.g., "S"). */
	type: string;
}

/**
 * A dictionary of ship types, where each key is a ship type identifier.
 *
 * @category Interfaces
 */
export interface ShipTypes {
	[key: string]: ShipTypeDetail;
}

/**
 * Creates a Suspense-compatible resource object from a promise.
 *
 * @remarks
 * This utility wraps a promise to manage its state (pending, success, error)
 * and provide a `read()` method that integrates with React Suspense.
 *
 * @template T - The type of data being loaded.
 *
 * @param {Promise<T>} promise - The asynchronous operation to wrap.
 *
 * @returns {Resource<T>} A resource object with a `read` method.
 *
 * @example
 * ```ts
 * const userResource = createResource(fetchUser(id));
 *
 * // Inside a component wrapped in <Suspense>:
 * const user = userResource.read();
 * ```
 */
const createResource = <T,>(promise: Promise<T>): Resource<T> => {
	let status: "error" | "pending" | "success" = "pending";
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
 * @returns {void} Side-effects only.
 *
 * @example
 * ```typescript
 * clearShipTypesCache();
 * // returns void, side-effect: clears cache map
 * ```
 */

/**
 * State and actions for the ship types store.
 *
 * @category Interfaces
 */
interface ShipTypesState {
	/**
	 * Updates the ship types in the store.
	 *
	 * @param {ShipTypes} shipTypes - The new dictionary of ship types.
	 */
	setShipTypes: (shipTypes: ShipTypes) => void;
	/** The dictionary of available ship types. */
	shipTypes: null | ShipTypes;
}

/**
 * Initiates a fetch for all available ship types from the API.
 *
 * @remarks
 * This function caches the resulting resource to ensure multiple calls
 * do not trigger redundant network requests. It also updates the
 * `ShipTypesStore` and `PlatformStore` upon success.
 *
 * It returns a Suspense-compatible resource object.
 *
 * @returns {Resource<ShipTypes>} A Suspense resource containing ship type data.
 *
 * @see {@link useShipTypesStore} for the persistent data store.
 * @see {@link usePlatformStore} for ship-type/platform coordination.
 * @see {@link apiCall} for the underlying network implementation.
 *
 * @example
 * ```ts
 * const shipTypesResource = fetchShipTypes();
 * ```
 */
export function fetchShipTypes(): Resource<ShipTypes> {
	const cacheKey = "shipTypes";

	if (!cache.has(cacheKey)) {
		const baseUrl = API_URL ? (API_URL.endsWith("/") ? API_URL : `${API_URL}/`) : "/";
		const promise = apiCall<ShipTypes>(`${baseUrl}platforms`, {}, 10000)
			.then((data) => {
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
 * @remarks
 * This hook calls `read()` on the ship types resource, which will throw a
 * Promise if the data is not yet available, triggering the nearest
 * `<Suspense>` boundary.
 *
 * @returns {ShipTypes} The loaded ship types data.
 *
 * @see {@link fetchShipTypes} for the resource creation logic.
 * @see {@link ./useShipTypes.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const ShipTypeSelector = () => {
 *   const shipTypes = useFetchShipTypesSuspense();
 *   return <Select options={Object.values(shipTypes)} />;
 * };
 * ```
 */
export function useFetchShipTypesSuspense(): ShipTypes {
	return fetchShipTypes().read();
}

/**
 * Zustand store for managing the global state of available ship types.
 *
 * @remarks
 * Stores the full dictionary of ship types retrieved from the API, enabling
 * components to access labels and IDs across the application.
 *
 * @category Stores
 */
const useShipTypesStore = create<ShipTypesState>((set) => {
	return {
		setShipTypes: (shipTypes) => set({ shipTypes }),
		shipTypes: null,
	};
});
