// src/hooks/useUrlSync.tsx
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useRouteContext } from "../../context/RouteContext";
import { useGridStore } from "../../store/GridStore";
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
			const urlParams = new URLSearchParams(window.location.search);
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

	// Function to update URL when sharing
	const updateUrlForShare = useCallback(() => {
		const serializedGrid = serializeGrid();
		const url = new URL(window.location.href);
		url.searchParams.set("grid", serializedGrid);
		url.searchParams.set("platform", selectedShipTypeFromStore);

		return url.toString();
	}, [serializeGrid, selectedShipTypeFromStore]);

	// Function to update URL on reset (removes grid param)
	const updateUrlForReset = useCallback(() => {
		const url = new URL(window.location.href);
		url.searchParams.delete("grid");
		// Use navigate to ensure React Router is aware of the URL change
		navigate(url.pathname + url.search, { replace: true });
	}, [navigate]);

	return { updateUrlForShare, updateUrlForReset };
};
