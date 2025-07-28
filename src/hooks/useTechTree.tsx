import { useEffect } from "react";

import { API_URL } from "../constants";
import { useGridStore } from "../store/GridStore";
import { useTechStore } from "../store/TechStore";
import { isValidRecommendedBuild } from "../utils/typeValidation";

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
}

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

export interface TechTree {
	grid_definition?: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	recommended_builds?: RecommendedBuild[];
	[key: string]: TechTreeItem[] | { grid: Module[][] } | RecommendedBuild[] | undefined;
}

type Resource<T> = {
	read: () => T;
};

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

const cache = new Map<string, Resource<TechTree>>();

export const clearTechTreeCache = () => {
	cache.clear();
};

function fetchTechTree(shipType: string = "standard"): Resource<TechTree> {
	const cacheKey = shipType;
	if (!cache.has(cacheKey)) {
		const promise = fetch(`${API_URL}tech_tree/${shipType}`).then(async (res) => {
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			const data = await res.json();
			console.log("Fetched tech tree:", data);

			if (data.recommended_builds && Array.isArray(data.recommended_builds)) {
				data.recommended_builds = data.recommended_builds.filter((build: RecommendedBuild) => {
					if (!isValidRecommendedBuild(build)) {
						console.error("Invalid recommended build found in tech tree:", build);
						return false;
					}
					return true;
				});
			}
			return data;
		});

		cache.set(cacheKey, createResource<TechTree>(promise));
	}

	return cache.get(cacheKey)!;
}

export function useFetchTechTreeSuspense(shipType: string = "standard"): TechTree {
	const techTree = fetchTechTree(shipType).read();
	const setTechColors = useTechStore((state) => state.setTechColors);
	const setInitialGridDefinition = useGridStore((state) => state.setInitialGridDefinition);
	const setGridFromInitialDefinition = useGridStore((state) => state.setGridFromInitialDefinition);

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

		if (techTree.grid_definition && !useGridStore.getState().selectHasModulesInGrid()) {
			setInitialGridDefinition(techTree.grid_definition);
			setGridFromInitialDefinition(techTree.grid_definition);
		}
	}, [techTree, setTechColors, setInitialGridDefinition, setGridFromInitialDefinition]);

	return techTree;
}
