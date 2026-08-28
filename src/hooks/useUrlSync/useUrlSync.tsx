// src/hooks/useUrlSync.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useRouteContext } from "@/context/RouteContext";
import { useGridDeserializer } from "@/hooks/useGridDeserializer/useGridDeserializer";
import { useFetchShipTypesSuspense } from "@/hooks/useShipTypes/useShipTypes";
import { usePlatformStore } from "@/store/app/platformStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { Logger } from "@/utils/system/monitoring";

/**
 * Custom hook for synchronizing application state with the browser's URL.
 *
 * @remarks
 * This hook manages the bi-directional mapping between the global state
 * (selected ship type, grid layout) and URL query parameters (`platform`, `grid`).
 *
 * It handles:
 * 1. Initial state restoration from URL on mount.
 * 2. Response to `popstate` events (Back/Forward navigation) to ensure store consistency.
 * 3. Generation of shareable URLs with serialized grid data.
 * 4. Cleaning up URL state during resets.
 *
 * It utilizes a singleton-like syncing ref to prevent infinite loops between
 * store persistence and URL updates.
 *
 * @returns {{ updateUrlForShare: () => string, updateUrlForReset: () => void }} Functions to generate share links and reset URL state.
 *
 * @see {@link usePlatformStore} for ship type state.
 * @see useGridStore for the underlying grid data.
 * @see {@link useGridDeserializer} for serialization logic.
 * @see {@link ./useUrlSync.test.tsx Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const ShareButton = () => {
 *   const { updateUrlForShare } = useUrlSync();
 *
 *   const onShare = () => {
 *     const link = updateUrlForShare();
 *     navigator.clipboard.writeText(link);
 *   };
 *
 *   return <button onClick={onShare}>Copy Link</button>;
 * };
 * ```
 */
export const useUrlSync = () => {
	const navigate = useNavigate();
	const { isKnownRoute } = useRouteContext();
	const selectedShipTypeFromStore = usePlatformStore((state) => state.selectedPlatform);
	const { deserializeGrid, serializeGrid } = useGridDeserializer();
	const shipTypes = useFetchShipTypesSuspense();

	// Use a ref to prevent multiple simultaneous sync operations
	// and to store the latest values without triggering re-effects
	const isSyncingRef = useRef(false);
	const shipTypesRef = useRef(shipTypes);
	const isKnownRouteRef = useRef(isKnownRoute);
	const deserializeGridRef = useRef(deserializeGrid);

	// Keep refs up to date
	useEffect(() => {
		shipTypesRef.current = shipTypes;
		isKnownRouteRef.current = isKnownRoute;
		deserializeGridRef.current = deserializeGrid;
	}, [shipTypes, isKnownRoute, deserializeGrid]);

	// Effect to handle initial URL state and popstate events
	useEffect(() => {
		if (!isKnownRoute) return;

		const handlePopState = async () => {
			if (isSyncingRef.current) return;

			let urlParams: URLSearchParams;

			try {
				urlParams = new URLSearchParams(window.location.search);
			} catch (e) {
				Logger.warn("useUrlSync: Failed to parse URL search params", { error: e });

				return;
			}

			const platformFromUrl = urlParams.get("platform");
			const gridFromUrl = urlParams.get("grid");

			const currentShipTypes = shipTypesRef.current;
			const validShipTypes = Object.keys(currentShipTypes);

			if (validShipTypes.length === 0) {
				Logger.warn("useUrlSync: Ship types not loaded yet, deferring URL sync");

				return;
			}

			isSyncingRef.current = true;

			try {
				sessionCoordinator.syncStateFromUrl({
					deserializeGrid: deserializeGridRef.current,
					gridFromUrl,
					isKnownRoute: isKnownRouteRef.current,
					platformFromUrl,
					validShipTypes,
				});
			} finally {
				isSyncingRef.current = false;
			}
		};

		// Initial check on mount - wrap in isSyncingRef to prevent collision with popstate
		if (!isSyncingRef.current) {
			void handlePopState();
		}

		window.addEventListener("popstate", handlePopState, { passive: true });

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [isKnownRoute]);

	/**
	 * Generates a full URL including the current ship type and serialized grid state.
	 *
	 * @returns {string} The shareable URL.
	 *
	 * @example Share URL generation
	 * ```ts
	 * const url = updateUrlForShare();
	 * ```
	 */
	const updateUrlForShare = () => {
		const serializedGrid = serializeGrid();

		try {
			const url = new URL(window.location.href);
			url.searchParams.set("grid", serializedGrid);
			url.searchParams.set("platform", selectedShipTypeFromStore);

			return url.toString();
		} catch (error) {
			Logger.warn("useUrlSync: Failed to create share URL", { error });

			return `/?platform=${selectedShipTypeFromStore}&grid=${serializedGrid}`;
		}
	};

	/**
	 * Removes grid-related parameters from the URL.
	 * @example URL state reset
	 * ```ts
	 * updateUrlForReset();
	 * ```
	 */
	const updateUrlForReset = () => {
		try {
			const url = new URL(window.location.href);
			url.searchParams.delete("grid");
			// Use navigate to ensure React Router is aware of the URL change
			navigate(url.pathname + url.search, { replace: true });
		} catch (error) {
			Logger.warn("useUrlSync: Failed to update URL for reset", { error });
		}
	};

	return { updateUrlForReset, updateUrlForShare };
};
