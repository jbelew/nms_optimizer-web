import type { Module, TechTree, TechTreeItem } from "../../hooks/useTechTree/useTechTree";

/**
 * Results of tech tree processing including flat maps and sets for lookup.
 */
export interface TechTreeMaps {
	/** Flat map of all modules, keyed by "techKey/moduleId" */
	modulesMap: Map<string, Module>;
	/** Map of tech keys to their associated brand color */
	techColors: Record<string, string>;
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
export const getTechTreeMaps = (techTree: TechTree | null): TechTreeMaps => {
	const modulesMap = new Map<string, Module>();
	const techColors: Record<string, string> = {};
	const validTechKeys = new Set<string>();

	if (!techTree) {
		return { modulesMap, techColors, validTechKeys };
	}

	for (const category in techTree) {
		const categoryItems = techTree[category];

		if (Array.isArray(categoryItems)) {
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

					for (const module of techItem.modules) {
						modulesMap.set(`${techItem.key}/${module.id}`, module);
					}
				}
			}
		}
	}

	return { modulesMap, techColors, validTechKeys };
};
