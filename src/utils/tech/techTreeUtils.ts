import type { Module, TechTree, TechTreeItem } from "../../types/tech";

/**
 * Results of tech tree processing including flat maps and sets for lookup.
 */
export interface TechTreeMaps {
	/** Map of tech keys to their current active type/mode */
	activeGroups: Record<string, string>;
	/** Flat map of all modules, keyed by "techKey/moduleId" */
	modulesMap: Map<string, Module>;
	/** Map of tech keys to their associated brand color */
	techColors: Record<string, string>;
	/** Grouped tech items by their primary key */
	techGroups: Record<string, TechTreeItem[]>;
	/** Set of all valid tech keys in the current tree */
	validTechKeys: Set<string>;
}

/**
 * Processes the TechTree to extract useful flat maps for fast lookups.
 *
 * @param {TechTree | null} techTree - The hierarchical technology tree data.
 *
 * @returns {TechTreeMaps} Flat maps for modules, colors, and valid keys.
 *
 * @example
 * ```ts
 * const { modulesMap } = getTechTreeMaps(techTree);
 * ```
 */
export const getTechTreeMaps = (techTree: null | TechTree): TechTreeMaps => {
	const modulesMap = new Map<string, Module>();
	const techColors: Record<string, string> = {};
	const validTechKeys = new Set<string>();
	const techGroups: Record<string, TechTreeItem[]> = {};
	const activeGroups: Record<string, string> = {};

	if (!techTree) {
		return { activeGroups, modulesMap, techColors, techGroups, validTechKeys };
	}

	for (const category in techTree) {
		const categoryItems = techTree[category];

		if (category === "recommended_builds" || category === "grid_definition") continue;

		if (Array.isArray(categoryItems)) {
			const uniqueKeysInCat = new Set<string>();

			for (const item of categoryItems) {
				if (
					typeof item === "object" &&
					item !== null &&
					"key" in item &&
					"modules" in item
				) {
					const techItem = item as TechTreeItem;
					validTechKeys.add(techItem.key);
					techColors[techItem.key] = techItem.color;

					if (!uniqueKeysInCat.has(techItem.key)) {
						uniqueKeysInCat.add(techItem.key);

						if (!techGroups[techItem.key]) techGroups[techItem.key] = [];
						techGroups[techItem.key].push(techItem);

						if (!activeGroups[techItem.key]) {
							activeGroups[techItem.key] = techItem.type || "normal";
						}
					}

					for (const module of techItem.modules) {
						modulesMap.set(`${techItem.key}/${module.id}`, module);
					}
				}
			}
		}
	}

	return { activeGroups, modulesMap, techColors, techGroups, validTechKeys };
};
