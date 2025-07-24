import { create } from "zustand";

import { API_URL } from "../constants";
import { usePlatformStore } from "../store/PlatformStore";


export interface ShipTypeDetail {
	label: string;
	type: string;
}

export interface ShipTypes {
	[key: string]: ShipTypeDetail;
}

export type Resource<T> = {
	read: () => T;
};

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

export const clearShipTypesCache = () => {
    cache.clear();
};

export function fetchShipTypes(): Resource<ShipTypes> {
	const cacheKey = "shipTypes";

	if (!cache.has(cacheKey)) {
		const promise = fetch(`${API_URL}platforms`)
			.then((res) => {
				if (!res.ok) {
					console.error(`HTTP error fetching ship types: ${res.status} ${res.statusText}`);
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((data: ShipTypes) => {
				console.log("Fetched ship types:", data);
				const shipTypesState = useShipTypesStore.getState();
				shipTypesState.setShipTypes(data);

				usePlatformStore.getState().initializePlatform(Object.keys(data));
				usePlatformStore.getState().setSelectedPlatform(usePlatformStore.getState().selectedPlatform, Object.keys(data), false);

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

export function useFetchShipTypesSuspense(): ShipTypes {
	return fetchShipTypes().read();
}

export interface ShipTypesState {
	shipTypes: ShipTypes | null;
	setShipTypes: (shipTypes: ShipTypes) => void;
}

export const useShipTypesStore = create<ShipTypesState>((set) => {
	return {
		shipTypes: null,
		setShipTypes: (shipTypes) => set({ shipTypes }),
	};
});
