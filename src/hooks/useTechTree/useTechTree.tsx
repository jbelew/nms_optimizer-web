import { useEffect, useMemo } from "react";

import { API_URL } from "../../constants";
import { useGridStore } from "../../store/GridStore";
import { useModuleSelectionStore } from "../../store/ModuleSelectionStore";
import { useTechStore } from "../../store/TechStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { apiCall } from "../../utils/apiCall";
import { isValidRecommendedBuild } from "../../utils/recommendedBuildValidation";

/**
 * @interface Module
 * @property {boolean} active - Whether the module is active.
 * @property {string} adjacency - The adjacency bonus type.
 * @property {number} adjacency_bonus - The adjacency bonus value.
 * @property {number} bonus - The base bonus of the module.
 * @property {string} id - The unique identifier for the module.
 * @property {string} image - The image file for the module.
 * @property {string} label - The display label for the module.
 * @property {boolean} sc_eligible - Whether the module is eligible for supercharging.
 * @property {boolean} supercharged - Whether the module is supercharged.
 * @property {string} tech - The technology type of the module.
 * @property {string} type - The general type of the module.
 * @property {number} value - The value of the module.
 */
export interface Module {
	active: boolean;
	adjacency: string;
	adjacency_bonus: number;
	bonus: number;
	id: string;
	image: string;
	label: string;
	sc_eligible: boolean;
	supercharged: boolean;
	tech: string;
	type: string;
	value: number;
	checked?: boolean;
}

/**
 * @interface TechTreeItem
 * @property {string} label - The display label for the technology.
 * @property {string} key - The unique key for the technology.
 * @property {Module[]} modules - The modules available for this technology.
 * @property {string|null} image - The image file for the technology.
 * @property {string} color - The color associated with the technology.
 * @property {number} module_count - The number of modules for this technology.
 * @property {string} [type] - The type of the technology, e.g., 'normal' or 'max'.
 */
export interface TechTreeItem {
	label: string;
	key: string;
	modules: Module[];
	image: string | null;
	color:
		| "gray"
		| "gold"
		| "bronze"
		| "brown"
		| "yellow"
		| "amber"
		| "orange"
		| "tomato"
		| "red"
		| "ruby"
		| "crimson"
		| "pink"
		| "plum"
		| "purple"
		| "violet"
		| "iris"
		| "indigo"
		| "blue"
		| "cyan"
		| "teal"
		| "jade"
		| "green"
		| "grass"
		| "lime"
		| "mint"
		| "sky";
	module_count: number;
	type?: string;
}

/**
 * @interface RecommendedBuild
 * @property {string} title - The title of the recommended build.
 * @property {({tech?: string|null, module?: string|null, supercharged?: boolean, active?: boolean, adjacency_bonus?: number}|null)[][]} layout - The layout of the recommended build.
 */
export interface RecommendedBuild {
	title: string;
	layout: ({
		tech?: string | null;
		module?: string | null;
		supercharged?: boolean;
		active?: boolean;
		adjacency_bonus?: number;
	} | null)[][];
}

/**
 * @interface TechTree
 * @property {{grid: Module[][], gridFixed: boolean, superchargedFixed: boolean}} [grid_definition] - The a list of recommended builds.
 * @property {RecommendedBuild[]} [recommended_builds] - A list of recommended builds.
 * @property {TechTreeItem[]} [key: string] - A list of tech tree items for a given category.
 */
export interface TechTree {
	grid_definition?: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	recommended_builds?: RecommendedBuild[];
	[key: string]: TechTreeItem[] | { grid: Module[][] } | RecommendedBuild[] | undefined;
}

type Resource<T> = {
	read: () => T;
};

/**
 * Creates a resource that can be used with Suspense.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to wrap.
 * @returns {Resource<T>} A resource object with a read method.
 */
const createResource = <T,>(promise: Promise<T>): Resource<T> => {
	let status: "pending" | "success" | "error" = "pending";
	let result: T;
	let error: Error;

	const suspender = promise
		.then((res) => {
			status = "success";
			result = res;
		})
		.catch((err) => {
			status = "error";
			error = err;
		});

	return {
		read() {
			if (status === "pending") throw suspender;
			if (status === "error") throw error;
			return result!;
		},
	};
};

type CacheEntry = {
	resource: Resource<TechTree>;
	promise: Promise<TechTree>;
};

const cache = new Map<string, CacheEntry>();

/**
 * Clears the tech tree cache.
 */
export const clearTechTreeCache = () => {
	cache.clear();
};

/**
 * Fetches the tech tree for a given ship type as a Promise.
 * Useful for async contexts like deserialization.
 *
 * @param {string} [shipType="standard"] - The type of ship to fetch the tech tree for.
 * @returns {Promise<TechTree>} A promise that resolves to the tech tree data.
 */
export function fetchTechTreeAsync(shipType: string = "standard"): Promise<TechTree> {
	const cacheKey = shipType;
	if (!cache.has(cacheKey)) {
		const promise = apiCall<TechTree>(`${API_URL}tech_tree/${shipType}`, {}, 10000)
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
				return data;
			})
			.catch((error) => {
				console.error("Error fetching tech tree:", error);
				// Error dialog is already triggered by apiCall
				// Return empty object to prevent Suspense from throwing
				return {} as TechTree;
			});

		cache.set(cacheKey, {
			resource: createResource<TechTree>(promise),
			promise,
		});
	}

	return cache.get(cacheKey)!.promise;
}

/**
 * Fetches the tech tree for a given ship type.
 *
 * @param {string} [shipType="standard"] - The type of ship to fetch the tech tree for.
 * @returns {Resource<TechTree>} A resource object that can be used with Suspense.
 */
export function fetchTechTree(shipType: string = "standard"): Resource<TechTree> {
	const cacheKey = shipType;
	if (!cache.has(cacheKey)) {
		// Populate cache using the async version
		fetchTechTreeAsync(cacheKey);
	}

	return cache.get(cacheKey)!.resource;
}

/**
 * Custom hook to fetch the tech tree for a given ship type, using Suspense for loading.
 *
 * @param {string} [shipType="standard"] - The type of ship to fetch the tech tree for.
 * @returns {TechTree} The tech tree data.
 */
export function useFetchTechTreeSuspense(shipType: string = "standard"): TechTree {
	const techTree = fetchTechTree(shipType).read();
	const setTechColors = useTechStore((state) => state.setTechColors);
	const setTechGroups = useTechStore((state) => state.setTechGroups);
	const setActiveGroup = useTechStore((state) => state.setActiveGroup);

	const setInitialGridDefinition = useGridStore((state) => state.setInitialGridDefinition);
	const setGridFromInitialDefinition = useGridStore(
		(state) => state.setGridFromInitialDefinition
	);

	useEffect(() => {
		const colors: { [key: string]: string } = {};
		const techGroups: { [key: string]: TechTreeItem[] } = {};
		const activeGroups: { [key: string]: string } = {};

		for (const category in techTree) {
			const categoryItems = techTree[category];
			if (Array.isArray(categoryItems)) {
				categoryItems.forEach((tech) => {
					if ("key" in tech && "color" in tech) {
						colors[tech.key] = tech.color;

						if (!techGroups[tech.key]) {
							techGroups[tech.key] = [];
						}
						techGroups[tech.key].push(tech as TechTreeItem);

						if (!activeGroups[tech.key]) {
							activeGroups[tech.key] = tech.type || "normal";
						}
					}
				});
			}
		}

		setTechColors(colors);
		// Clear module selections before loading new tech tree to prevent old selections from persisting
		useModuleSelectionStore.getState().clearAllModuleSelections();
		setTechGroups(techGroups);

		Object.entries(activeGroups).forEach(([tech, groupType]) => {
			setActiveGroup(tech, groupType);
		});

		if (techTree.grid_definition && !useGridStore.getState().selectHasModulesInGrid()) {
			setInitialGridDefinition(techTree.grid_definition);
			setGridFromInitialDefinition(techTree.grid_definition);
		}
	}, [
		techTree,
		setTechColors,
		setTechGroups,
		setActiveGroup,
		setInitialGridDefinition,
		setGridFromInitialDefinition,
	]);

	useEffect(() => {
		// Set loading to false after the techTree data has been processed and rendered
		useTechTreeLoadingStore.getState().setLoading(false);
	}, [techTree]); // Dependency on techTree ensures it runs after data is available

	/**
	 * Memoize tech tree processing to avoid recalculating on every render
	 * Only recalculates when the techTree object reference changes
	 */
	const processedTechTree = useMemo(
		() =>
			Object.entries(techTree).reduce((acc, [category, items]) => {
				if (category === "recommended_builds") {
					acc[category] = items as RecommendedBuild[]; // Explicitly cast to RecommendedBuild[]
				} else if (category === "grid_definition") {
					acc[category] = items as {
						grid: Module[][];
						gridFixed: boolean;
						superchargedFixed: boolean;
					}; // Explicitly cast to grid_definition type
				} else if (Array.isArray(items)) {
					const uniqueKeys = new Set<string>();
					acc[category] = items.filter((item): item is TechTreeItem => {
						if (typeof item === "object" && item !== null && "key" in item) {
							if (uniqueKeys.has(item.key)) {
								return false;
							}
							uniqueKeys.add(item.key);
							return true;
						}
						return false;
					});
				} else {
					acc[category] = items;
				}
				return acc;
			}, {} as TechTree),
		[techTree]
	);

	return processedTechTree;
}
