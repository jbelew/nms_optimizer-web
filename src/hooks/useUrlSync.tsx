// src/hooks/useUrlSync.tsx
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useGridStore } from "../store/GridStore";
import { usePlatformStore } from "../store/PlatformStore";
import { useGridDeserializer } from "./useGridDeserializer";
import { useFetchShipTypesSuspense } from "./useShipTypes";

/**
 * Hook to synchronize application state (selected platform, grid)
 * with the browser URL query parameters.
 */
export const useUrlSync = () => {
	const navigate = useNavigate();
	const { setIsSharedGrid, isSharedGrid } = useGridStore();
	const selectedShipTypeFromStore = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipTypeInStore = usePlatformStore((state) => state.setSelectedPlatform);
	const { serializeGrid, deserializeGrid } = useGridDeserializer();
	const shipTypes = useFetchShipTypesSuspense();

	// Effect to handle initial URL state and popstate events
	useEffect(() => {
		const handlePopState = () => {
			const urlParams = new URLSearchParams(window.location.search);
			const platformFromUrl = urlParams.get("platform");
			const gridFromUrl = urlParams.get("grid");

			// Sync platform from URL to store
			if (platformFromUrl && platformFromUrl !== selectedShipTypeFromStore) {
				setSelectedShipTypeInStore(platformFromUrl, Object.keys(shipTypes), false);
			}

			// Sync grid from URL to store
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
