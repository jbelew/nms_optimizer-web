/**
 * Custom hook and utility module for fetching and managing technology trees.
 *
 * @remarks
 * This module provides the `useFetchTechTreeSuspense` hook, which retrieves
 * technology and module data for a specific ship type. It handles caching,
 * data validation, and provides derived maps for efficient access to
 * technology metadata.
 *
 * @category Hooks
 */

import type { Module, RecommendedBuild, TechTree, TechTreeItem } from "@/types/tech";
import { use, useEffect } from "react";

import { API_URL } from "@/constants";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useTechTreeLoadingStore } from "@/store/tech/techTreeLoadingStore";
import { apiCall } from "@/utils/api/network";
import { getTechTreeMaps } from "@/utils/tech/techTreeUtils";
import { isValidRecommendedBuild } from "@/utils/validation/dataValidation";

export type { Module, RecommendedBuild, TechTree, TechTreeItem };

/**
 * Internal promise cache to prevent redundant tech tree fetches.
 *
 * @type {Map<string, Promise<TechTree>>}
 * @private
 */
const cache = new Map<string, Promise<TechTree>>();

/**
 * Clears the internal tech tree promise cache.
 *
 * @returns {void} Side-effects only.
 *
 * @example Cache reset
 * ```typescript
 * clearTechTreeCache();
 * ```
 */
export const clearTechTreeCache = () => {
	cache.clear();
};

/**
 * Synchronous-looking wrapper for `fetchTechTreeAsync`.
 *
 * @remarks
 * Provides a cleaner API for standard fetch requests.
 *
 * @param {string} [shipType="standard"] - The identifier for the ship type.
 *
 * @returns {Promise<TechTree>} A promise resolving to the tech tree data.
 *
 * @see {@link fetchTechTreeAsync}
 *
 * @category Data Fetching
 *
 * @example Basic usage
 * ```typescript
 * fetchTechTree("standard").then(tree => console.log(tree));
 * ```
 */
export function fetchTechTree(shipType: string = "standard"): Promise<TechTree> {
	return fetchTechTreeAsync(shipType);
}

/**
 * Fetches the technology tree for a specific ship type asynchronously.
 *
 * @remarks
 * Uses internal caching to prevent redundant requests. Updates the
 * `TechTreeLoadingStore` to reflect the network status during the request.
 *
 * @param {string} [shipType="standard"] - The identifier for the ship type (e.g., "fighter", "solar").
 *
 * @returns {Promise<TechTree>} A promise resolving to the `TechTree` data.
 *
 * @see {@link useTechTreeLoadingStore} for monitoring fetch status.
 * @see {@link apiCall} for the underlying network implementation.
 * @see {@link isValidRecommendedBuild} for build validation.
 *
 * @example Fetching standard telemetry
 * ```ts
 * const tree = await fetchTechTreeAsync("solar");
 * console.log(tree.grid_definition);
 * ```
 */
export function fetchTechTreeAsync(shipType: string = "standard"): Promise<TechTree> {
	const cacheKey = shipType;

	if (!cache.has(cacheKey)) {
		queueMicrotask(() => {
			useTechTreeLoadingStore.getState().setLoading(true);
		});

		const baseUrl = API_URL ? (API_URL.endsWith("/") ? API_URL : `${API_URL}/`) : "/";
		const promise = apiCall<TechTree>(`${baseUrl}tech_tree/${shipType}`, {}, 10000)
			.then((data) => {
				if (data.recommended_builds && Array.isArray(data.recommended_builds)) {
					data.recommended_builds = data.recommended_builds.filter(
						(build: RecommendedBuild) => {
							if (!isValidRecommendedBuild(build)) {
								console.error(
									"Invalid recommended build found in tech tree:",
									build
								);

								return false;
							}

							return true;
						}
					);
				}

				useTechTreeLoadingStore.getState().setLoading(false);

				return data;
			})
			.catch((error) => {
				console.error("Error fetching tech tree:", error);
				useTechTreeLoadingStore.getState().setLoading(false);

				return {} as TechTree;
			});

		cache.set(cacheKey, promise);
	}

	return cache.get(cacheKey)!;
}

/**
 * Custom hook for retrieving the technology tree within a Suspense boundary.
 *
 * @remarks
 * Automatically initializes the `TechStore` and `GridStore` with metadata
 * from the fetched tree upon successful retrieval. It uses React's `use()` hook
 * to throw the fetch promise and trigger `<Suspense>` loaders.
 *
 * @param {string} [shipType="standard"] - The identifier for the ship type.
 *
 * @returns {TechTree} The loaded technology tree data structure.
 *
 * @see {@link fetchTechTree} for the promise creator.
 * @see {@link useTechStore} for technology grouping and coloring.
 * @see {@link useGridStore} for grid initialization.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Suspense implementation
 * ```tsx
 * const TechTreeLayout = () => {
 *   // Component will suspend while fetching "freighter" tree
 *   const tree = useFetchTechTreeSuspense("freighter");
 *
 *   return <Grid data={tree.grid_definition} />;
 * };
 * ```
 */
export function useFetchTechTreeSuspense(shipType: string = "standard"): TechTree {
	const data = use(fetchTechTree(shipType));

	useEffect(() => {
		if (data && Object.keys(data).length > 0) {
			const initStores = () => {
				const { activeGroups, techColors, techGroups } = getTechTreeMaps(data);
				useTechStore.getState().initializeTechTree(techColors, techGroups, activeGroups);

				const gridStore = useGridStore.getState();

				if (data.grid_definition && !gridStore.selectHasModulesInGrid()) {
					gridStore.setInitialGridDefinition(data.grid_definition);
					gridStore.setGridFromInitialDefinition(data.grid_definition);
				}

				useTechTreeLoadingStore.getState().setLoading(false);
			};

			initStores();
		}
	}, [data, shipType]);

	return data;
}
