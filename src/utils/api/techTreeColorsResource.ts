import type { TechTree } from "../../hooks/useTechTree/useTechTree";

import { fetchTechTreeAsync } from "../../hooks/useTechTree/useTechTree";

let techTreeColorsPromise: null | Promise<Record<string, string>> = null;

/**
 * Aggregates technology colors across all major ship and tool categories.
 *
 * @remarks
 * This utility fetches multiple tech trees (Starship, Multi-Tool, Corvette)
 * and merges their technology-key-to-color mappings into a single registry.
 * The result is cached in a promise to prevent redundant network requests.
 *
 * It is used primarily by components that need to colorize tech items without
 * knowing the specific ship type currently being optimized.
 *
 * @returns {Promise<Record<string, string>>} A promise resolving to a mapping of tech keys to hex colors.
 *
 * @see {@link fetchTechTreeAsync} for the underlying tech tree fetching.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const colors = await fetchTechTreeColors();
 * const pulseColor = colors['pulse']; // e.g., "blue"
 * ```
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
