import type { TechTree } from "../useTechTree/useTechTree";

import { fetchTechTreeAsync } from "../useTechTree/useTechTree";

let techTreeColorsPromise: Promise<Record<string, string>> | null = null;

/**
 * Fetches and aggregates colors for all technologies across different tech trees.
 * Caches the result in a promise to avoid redundant network calls.
 * @returns {Promise<Record<string, string>>} A map of technology keys to their associated colors.
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
 * Resets the cached promise for tech tree colors.
 * Useful for testing or to force a re-fetch of the color data.
 */
export const resetTechTreeColorsCache = () => {
	techTreeColorsPromise = null;
};
