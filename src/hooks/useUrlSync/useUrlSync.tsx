// src/hooks/useUrlSync.tsx
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useRouteContext } from "../../context/RouteContext";
import { createGrid, useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useGridDeserializer } from "../useGridDeserializer/useGridDeserializer";
import { useFetchShipTypesSuspense } from "../useShipTypes/useShipTypes";

/**
 * Custom hook to synchronize the application's state (selected platform, grid)
 * with the browser's URL query parameters. It handles both reading from the URL
 * on initial load and updating the URL when state changes.
 *
 * @returns {{updateUrlForShare: () => string, updateUrlForReset: () => void}}
 *          An object containing functions to update the URL for sharing and resetting the grid.
 */
export const useUrlSync = () => {
	const navigate = useNavigate();
	const { isKnownRoute } = useRouteContext();
	const selectedShipTypeFromStore = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipTypeInStore = usePlatformStore((state) => state.setSelectedPlatform);
	const { serializeGrid, deserializeGrid } = useGridDeserializer();
	const shipTypes = useFetchShipTypesSuspense();

	// Use a ref to prevent multiple simultaneous sync operations
	// and to store the latest values without triggering re-effects
	const isSyncingRef = useRef(false);
	const shipTypesRef = useRef(shipTypes);
	const isKnownRouteRef = useRef(isKnownRoute);

	// Keep refs up to date
	useEffect(() => {
		shipTypesRef.current = shipTypes;
		isKnownRouteRef.current = isKnownRoute;
	}, [shipTypes, isKnownRoute]);

	// Effect to handle initial URL state and popstate events
	useEffect(() => {
		if (!isKnownRoute) return;

		const handlePopState = async () => {
			if (isSyncingRef.current) return;

			let urlParams: URLSearchParams;

			try {
				urlParams = new URLSearchParams(window.location.search);
			} catch (e) {
				console.warn("useUrlSync: Failed to parse URL search params", e);

				return;
			}

			const platformFromUrl = urlParams.get("platform");
			const gridFromUrl = urlParams.get("grid");

			const currentShipTypes = shipTypesRef.current;
			const validShipTypes = Object.keys(currentShipTypes);

			if (validShipTypes.length === 0) {
				console.warn("useUrlSync: Ship types not loaded yet, deferring URL sync");

				return;
			}

			isSyncingRef.current = true;

			try {
				const currentPlatform = usePlatformStore.getState().selectedPlatform;

				// IMPORTANT: Sync platform BEFORE grid to avoid race conditions
				// If we have both platform and grid from URL, ensure platform is set first
				// so deserialization uses the correct platform
				if (platformFromUrl && platformFromUrl !== currentPlatform) {
					if (validShipTypes.includes(platformFromUrl)) {
						setSelectedShipTypeInStore(
							platformFromUrl,
							validShipTypes,
							false, // updateUrl = false (we are ALREADY responding to a URL change)
							isKnownRouteRef.current
						);

						// --- Bug Fix: Back Navigation Desync ---
						// If the platform changed via a popstate event (Back/Forward),
						// and we DON'T have a grid in the URL (it's not a shared link),
						// we should reset the grid to an empty state for the new platform.
						if (!gridFromUrl) {
							useGridStore
								.getState()
								.setGridAndResetAuxiliaryState(createGrid(10, 6));
						}
					} else {
						console.warn(
							`useUrlSync: Invalid platform from URL: ${platformFromUrl}. Expected one of: ${validShipTypes.join(", ")}`
						);
					}
				}

				// Sync grid from URL to store
				// Grid deserialization will use the platform that was just synced above
				if (gridFromUrl) {
					deserializeGrid(gridFromUrl);
				} else {
					const {
						isSharedGrid: currentIsSharedGrid,
						setIsSharedGrid: storeSetIsSharedGrid,
					} = useGridStore.getState();

					if (currentIsSharedGrid) {
						storeSetIsSharedGrid(false);
					}
				}
			} finally {
				isSyncingRef.current = false;
			}
		};

		// Initial check on mount
		void handlePopState();

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [
		isKnownRoute,
		setSelectedShipTypeInStore,
		deserializeGrid,
		// Removing selectedShipTypeFromStore and isSharedGrid from dependencies
		// to break the infinite loop triggered by store persistence
	]);

	const updateUrlForShare = useCallback(() => {
		const serializedGrid = serializeGrid();

		try {
			const url = new URL(window.location.href);
			url.searchParams.set("grid", serializedGrid);
			url.searchParams.set("platform", selectedShipTypeFromStore);

			return url.toString();
		} catch (error) {
			console.warn("useUrlSync: Failed to create share URL", error);

			return `/?platform=${selectedShipTypeFromStore}&grid=${serializedGrid}`;
		}
	}, [serializeGrid, selectedShipTypeFromStore]);

	const updateUrlForReset = useCallback(() => {
		try {
			const url = new URL(window.location.href);
			url.searchParams.delete("grid");
			// Use navigate to ensure React Router is aware of the URL change
			navigate(url.pathname + url.search, { replace: true });
		} catch (error) {
			console.warn("useUrlSync: Failed to update URL for reset", error);
		}
	}, [navigate]);

	return { updateUrlForShare, updateUrlForReset };
};
