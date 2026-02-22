// src/hooks/useUrlSync.tsx
import { useCallback, useEffect } from "react";
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
	const { setIsSharedGrid, isSharedGrid } = useGridStore();
	const selectedShipTypeFromStore = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipTypeInStore = usePlatformStore((state) => state.setSelectedPlatform);
	const { serializeGrid, deserializeGrid } = useGridDeserializer();
	const shipTypes = useFetchShipTypesSuspense();

	// Effect to handle initial URL state and popstate events
	useEffect(() => {
		if (!isKnownRoute) return;

		const handlePopState = async () => {
			let urlParams: URLSearchParams;

			try {
				urlParams = new URLSearchParams(window.location.search);
			} catch (e) {
				console.warn("useUrlSync: Failed to parse URL search params", e);

				return;
			}

			const platformFromUrl = urlParams.get("platform");
			const gridFromUrl = urlParams.get("grid");

			const validShipTypes = Object.keys(shipTypes);

			if (validShipTypes.length === 0) {
				console.warn("useUrlSync: Ship types not loaded yet, deferring URL sync");

				return;
			}

			// IMPORTANT: Sync platform BEFORE grid to avoid race conditions
			// If we have both platform and grid from URL, ensure platform is set first
			// so deserialization uses the correct platform
			if (platformFromUrl && platformFromUrl !== selectedShipTypeFromStore) {
				if (validShipTypes.includes(platformFromUrl)) {
					setSelectedShipTypeInStore(
						platformFromUrl,
						validShipTypes,
						false,
						isKnownRoute
					);

					// --- Bug Fix: Back Navigation Desync ---
					// If the platform changed via a popstate event (Back/Forward),
					// and we DON'T have a grid in the URL (it's not a shared link),
					// we should reset the grid to an empty state for the new platform.
					if (!gridFromUrl) {
						useGridStore.getState().setGridAndResetAuxiliaryState(createGrid(10, 6));
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
				if (isSharedGrid) {
					setIsSharedGrid(false);
				}
			}
		};

		// Initial check on mount, delayed slightly to allow router to initialize
		handlePopState();

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [
		isKnownRoute,
		selectedShipTypeFromStore,
		setSelectedShipTypeInStore,
		deserializeGrid,
		setIsSharedGrid,
		isSharedGrid,
		shipTypes,
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
