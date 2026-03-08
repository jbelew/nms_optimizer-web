import type { TechTree } from "../useTechTree/useTechTree";

import { fetchTechTreeAsync } from "../useTechTree/useTechTree";

let techTreeColorsPromise: Promise<Record<string, string>> | null = null;

/**
 * Aggregates technology colors across all major ship and tool categories.
 *
 * This utility fetches multiple tech trees (Starship, Multi-Tool, Corvette)
 * and merges their technology-key-to-color mappings into a single registry.
 * The result is cached in a promise to prevent redundant network requests.
 *
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of tech keys to hex colors.
 *
 * @example
 * const colors = await fetchTechTreeColors();
 */
export const fetchTechTreeColors = (): Promise<Record<string, string>> => {
	if (!techTreeColorsPromise) {
		techTreeColorsPromise = (async () => {
			try {
				const colors: Record<string, string> = {};

				const processTechTree = (data: TechTree) => {
					for (const category in data) {
						const categoryItems = data[category];

						if (Array.isArray(categoryItems)) {
							categoryItems.forEach((tech) => {
								if ("key" in tech && "color" in tech) {
									colors[tech.key] = tech.color;
								}
							});
						}
					}
				};

				const [starshipData, multitoolData, corvetteData] = await Promise.all([
					fetchTechTreeAsync("standard"),
					fetchTechTreeAsync("standard-mt"),
					fetchTechTreeAsync("corvette"),
				]);

				processTechTree(starshipData);
				processTechTree(multitoolData);
				processTechTree(corvetteData);

				return colors;
			} catch (error) {
				// Reset promise on error so we can retry
				techTreeColorsPromise = null;
				throw error;
			}
		})();
	}

	return techTreeColorsPromise;
};

/**
 * Clears the internal cache for aggregated technology colors.
 *
 * @returns {void}
 *
 * @example
 * resetTechTreeColorsCache();
 */
export const resetTechTreeColorsCache = () => {
	techTreeColorsPromise = null;
};
