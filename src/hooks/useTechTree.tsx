// src/hooks/useTechTree.tsx
import { useEffect } from "react";

import { API_URL } from "../constants";
import { useGridStore } from "../store/GridStore";
import { useTechStore } from "../store/TechStore";

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
}

// Define the structure of the tech tree data (replace with your actual type)
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
	| "sky"; // Add color property
	module_count: number;
}

export interface RecommendedBuild {
	title: string;
	layout: ({
		tech: string;
		module: string;
		supercharged?: boolean;
		active?: boolean;
		adjacency_bonus?: number;
	} | null)[][];
}

export interface TechTree {
	grid_definition?: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	recommended_builds?: RecommendedBuild[];
	[key: string]: TechTreeItem[] | { grid: Module[][] } | RecommendedBuild[] | undefined;
}

type Resource<T> = {
	read: () => T;
};

/**
 * Creates a resource from a promise, which can be used with React Suspense.
 *
 * @template T - The type of the resource.
 * @param {Promise<T>} promise - The promise to create the resource from.
 * @returns {Resource<T>} An object with a read method that will throw the promise
 * if the resource is pending, or the error if it failed, or return the result if successful.
 */
const createResource = <T,>(promise: Promise<T>): Resource<T> => {
	let status: "pending" | "success" | "error" = "pending";
	let result: T;
	let error: Error;

	// Create a suspender by handling the promise
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
		/**
		 * Reads the resource, throwing if it's still pending or errored, or returning the result.
		 *
		 * @throws Will throw the promise if pending, or the error if there was an error.
		 * @returns {T} The result of the promise if successful.
		 */
		read() {
			if (status === "pending") throw suspender; // Throw the promise for suspense
			if (status === "error") throw error; // Throw the error if there was one
			return result!; // Return the result if successful
		},
	};
};

const cache = new Map<string, Resource<TechTree>>(); // Store successful fetches

export const clearTechTreeCache = () => {
	cache.clear();
};

/**
 * Fetches a tech tree by ship type and stores it in the cache.
 * If the resource is already in the cache, it will return the cached version.
 * @param {string} shipType - The type of ship to fetch the tech tree for. Defaults to "standard".
 * @returns {Resource<T>} An object with a read method that can be used with React Suspense.
 */
function fetchTechTree(shipType: string = "standard"): Resource<TechTree> {
	const cacheKey = shipType;
	// Check if the resource is already in the cache
	if (!cache.has(cacheKey)) {
		// Create a promise to fetch the tech tree
		const promise = fetch(`${API_URL}tech_tree/${shipType}`).then(async (res) => {
			// Check for HTTP errors
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			// Return the JSON response
			const data = await res.json();
			console.log("Fetched tech tree:", data);
			return data;
		});

		// Store the promise in the cache
		cache.set(cacheKey, createResource<TechTree>(promise));
	}

	// Return the cached resource
	return cache.get(cacheKey)!;
}

/**
 * Custom React hook to fetch a tech tree for a given ship type using Suspense.
 *
 * @param {string} shipType - The type of ship to fetch the tech tree for. Defaults to "standard".
 * @returns {TechTree} The fetched tech tree data for the specified ship type.
 */
export function useFetchTechTreeSuspense(shipType: string = "standard"): TechTree {
	const techTree = fetchTechTree(shipType).read();
	const setTechColors = useTechStore((state) => state.setTechColors);
	const setInitialGridDefinition = useGridStore((state) => state.setInitialGridDefinition);
	const setGridFromInitialDefinition = useGridStore((state) => state.setGridFromInitialDefinition);

	// Extract and set tech colors when the tech tree is available
	useEffect(() => {
		const colors: { [key: string]: string } = {};
		for (const category in techTree) {
			const categoryItems = techTree[category];
			if (Array.isArray(categoryItems)) {
				categoryItems.forEach((tech) => {
					if ("key" in tech && "color" in tech) {
						colors[tech.key] = tech.color;
					}
				});
			}
		}
		setTechColors(colors);

		// Apply the grid definition if available AND the grid is currently empty
		if (techTree.grid_definition && !useGridStore.getState().selectHasModulesInGrid()) {
			// 1. Set the initial definition so reset works correctly.
			setInitialGridDefinition(techTree.grid_definition);
			// 2. Apply this definition to the current grid state using the unified store logic.
			setGridFromInitialDefinition(techTree.grid_definition);
		}
	}, [techTree, setTechColors, setInitialGridDefinition, setGridFromInitialDefinition]);

	return techTree;
}
