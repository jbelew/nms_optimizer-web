import { use, useEffect } from "react";

import { API_URL } from "../../constants";
import { useGridStore } from "../../store/grid/gridStore";
import { useTechStore } from "../../store/tech/techStore";
import { useTechTreeLoadingStore } from "../../store/tech/techTreeLoadingStore";
import { apiCall } from "../../utils/api/network";
import { getTechTreeMaps } from "../../utils/tech/techTreeUtils";
import { isValidRecommendedBuild } from "../../utils/validation/dataValidation";

/**
 * Represents a specific technology module in No Man's Sky.
 *
 * @remarks
 * Each module contains its base stats, adjacency identifiers, and UI state flags.
 * Modules are the atomic units placed within the technology grid.
 *
 * @category Interfaces
 */
export interface Module {
	/** Whether the module is currently active. */
	active: boolean;
	/** Adjacency type identifier (e.g., `'pulse'`, `'photonix'`). Used for bonus calculations. */
	adjacency: string;
	/** Multiplier for adjacency bonuses (e.g., `0.05` for 5%). */
	adjacency_bonus: number;
	/** The base bonus value provided by this module. */
	bonus: number;
	/** Optional flag indicating if the module is selected in the UI. */
	checked?: boolean;
	/** Unique identifier for the module (e.g., `'PULSE_MODULE_1'`). */
	id: string;
	/** Filename or URL for the module's icon. */
	image: string;
	/** Display name of the module. */
	label: string;
	/** Whether this module can be placed in a supercharged slot. */
	sc_eligible: boolean;
	/** Whether the module is currently in a supercharged slot. */
	supercharged: boolean;
	/** The key of the technology category this module belongs to. */
	tech: string;
	/** The specific type classification of the module (e.g., `'normal'`, `'proc'`). */
	type: string;
	/** Numerical value associated with the module's primary stat. */
	value: number;
}

/**
 * Defines a pre-configured layout of technologies and modules.
 *
 * @see [useRecommendedBuild](../useRecommendedBuild/useRecommendedBuild.tsx) for the hook that applies these layouts.
 *
 * @category Interfaces
 */
export interface RecommendedBuild {
	/** 2D array representing the grid layout of modules. */
	layout: (null | {
		active?: boolean;
		adjacency_bonus?: number;
		module?: null | string;
		supercharged?: boolean;
		tech?: null | string;
	})[][];
	/** Display title for the build. */
	title: string;
}

/**
 * Root structure for technology tree data fetched from the API.
 *
 * @see {@link TechTreeItem}
 * @see {@link RecommendedBuild}
 *
 * @category Interfaces
 */
export interface TechTree {
	/** Dynamic categories containing lists of technologies. */
	[key: string]: RecommendedBuild[] | TechTreeItem[] | undefined | { grid: Module[][] };
	/** Optional grid layout and constraints defined for the ship type. */
	grid_definition?: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	/** List of recommended builds for this ship type. */
	recommended_builds?: RecommendedBuild[];
}

/**
 * Represents a technology category within the tech tree.
 *
 * @remarks
 * Groupings of modules that share a common purpose (e.g., Hyperdrive, Launch Thruster).
 * Includes UI theme colors and metadata for categorization.
 *
 * @see {@link Module}
 *
 * @category Interfaces
 */
export interface TechTreeItem {
	/** Theme color assigned to the technology in the UI. */
	color:
		| "amber"
		| "blue"
		| "bronze"
		| "brown"
		| "crimson"
		| "cyan"
		| "gold"
		| "grass"
		| "gray"
		| "green"
		| "indigo"
		| "iris"
		| "jade"
		| "lime"
		| "mint"
		| "orange"
		| "pink"
		| "plum"
		| "purple"
		| "red"
		| "ruby"
		| "sky"
		| "teal"
		| "tomato"
		| "violet"
		| "yellow";
	/** Optional icon for the technology. */
	image: null | string;
	/** Unique key for the technology (e.g., `'pulse'`). */
	key: string;
	/** Display label for the technology. */
	label: string;
	/** Total number of modules in this category. */
	module_count: number;
	/** List of modules available for this technology. */
	modules: Module[];
	/** Optional type classification (e.g., `'normal'`, `'weapon'`). */
	type?: string;
}

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
 * @see {@link ./useTechTree.test.ts Unit Tests}
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
			.then(async (data) => {
				console.log("Fetched tech tree:", data);

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
 * @see [useBreakpoint](../useBreakpoint/useBreakpoint.tsx) for media query support.
 * @see [useAppLayout](../useAppLayout/useAppLayout.tsx) for layout-specific responsive logic.
 * @see {@link useTechStore} for technology grouping and coloring.
 * @see {@link useGridStore} for grid initialization.
 * @see {@link ./useFetchTechTreeSuspense.test.ts Unit Tests}
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
			const { activeGroups, techColors, techGroups } = getTechTreeMaps(data);
			useTechStore.getState().initializeTechTree(techColors, techGroups, activeGroups);

			const gridStore = useGridStore.getState();

			if (data.grid_definition && !gridStore.selectHasModulesInGrid()) {
				gridStore.setInitialGridDefinition(data.grid_definition);
				gridStore.setGridFromInitialDefinition(data.grid_definition);
			}
		}
	}, [data, shipType]);

	return data;
}
