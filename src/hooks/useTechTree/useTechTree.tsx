import { use, useEffect } from "react";

import { API_URL } from "../../constants";
import { useGridStore } from "../../store/GridStore";
import { useTechStore } from "../../store/TechStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { apiCall } from "../../utils/apiCall";
import { isValidRecommendedBuild } from "../../utils/recommendedBuildValidation";

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

const cache = new Map<string, Promise<TechTree>>();

export const clearTechTreeCache = () => {
	cache.clear();
};

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

export function fetchTechTree(shipType: string = "standard"): Promise<TechTree> {
	return fetchTechTreeAsync(shipType);
}

function processTechTreeMetadata(techTree: TechTree) {
	const colors: { [key: string]: string } = {};
	const techGroups: { [key: string]: TechTreeItem[] } = {};
	const activeGroups: { [key: string]: string } = {};

	for (const [category, items] of Object.entries(techTree)) {
		if (category === "recommended_builds" || category === "grid_definition") continue;

		if (Array.isArray(items)) {
			const uniqueKeys = new Set<string>();

			for (const item of items) {
				if (typeof item === "object" && item !== null && "key" in item) {
					if (uniqueKeys.has(item.key)) continue;
					uniqueKeys.add(item.key);

					if ("color" in item) {
						colors[item.key] = item.color as string;
						if (!techGroups[item.key]) techGroups[item.key] = [];
						techGroups[item.key].push(item as TechTreeItem);

						if (!activeGroups[item.key]) {
							activeGroups[item.key] = (item.type as string) || "normal";
						}
					}
				}
			}
		}
	}

	return { colors, techGroups, activeGroups };
}

export function useFetchTechTreeSuspense(shipType: string = "standard"): TechTree {
	const data = use(fetchTechTree(shipType));

	useEffect(() => {
		if (data && Object.keys(data).length > 0) {
			const { colors, techGroups, activeGroups } = processTechTreeMetadata(data);
			useTechStore.getState().setTechColors(colors);
			useTechStore.getState().setTechGroups(techGroups);
			useTechStore.getState().setActiveGroups(activeGroups);

			if (data.grid_definition && !useGridStore.getState().selectHasModulesInGrid()) {
				useGridStore.getState().setInitialGridDefinition(data.grid_definition);
				useGridStore.getState().setGridFromInitialDefinition(data.grid_definition);
			}
		}
	}, [data, shipType]);

	return data;
}
