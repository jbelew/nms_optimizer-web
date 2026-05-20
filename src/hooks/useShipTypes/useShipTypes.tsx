import { use } from "react";
import { create } from "zustand";

import { API_URL } from "@/constants";
import { usePlatformStore } from "@/store/app/platformStore";
import { apiCall } from "@/utils/api/network";
import { Logger } from "@/utils/system/monitoring";

/**
 * Details of a specific ship type.
 *
 * @see {@link ShipTypes}
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
 * @see {@link ShipTypeDetail}
 *
 * @category Interfaces
 */
export interface ShipTypes {
	[key: string]: ShipTypeDetail;
}

const cache = new Map<string, Promise<ShipTypes>>();

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
 * This function caches the resulting promise to ensure multiple calls
 * do not trigger redundant network requests. It also updates the
 * `ShipTypesStore` and `PlatformStore` upon success.
 *
 * @returns {Promise<ShipTypes>} A promise resolving to ship type data.
 *
 * @see {@link useShipTypesStore} for the persistent data store.
 * @see {@link usePlatformStore} for ship-type/platform coordination.
 * @see {@link apiCall} for the underlying network implementation.
 *
 * @example
 * ```ts
 * const shipTypesPromise = fetchShipTypes();
 * ```
 */
export function fetchShipTypes(): Promise<ShipTypes> {
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
				Logger.error("Error fetching ship types:", error);
				// Error dialog is already triggered by apiCall
				// Return empty object to prevent Suspense from throwing

				return {} as ShipTypes;
			});

		cache.set(cacheKey, promise);
	}

	return cache.get(cacheKey)!;
}

/**
 * Custom hook for retrieving ship types within a Suspense boundary.
 *
 * @remarks
 * This hook uses React's `use()` hook to resolve the ship types promise,
 * triggering the nearest `<Suspense>` boundary if the data is not yet available.
 *
 * @returns {ShipTypes} The loaded ship types data.
 *
 * @see {@link fetchShipTypes} for the promise creation logic.
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
	return use(fetchShipTypes());
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
