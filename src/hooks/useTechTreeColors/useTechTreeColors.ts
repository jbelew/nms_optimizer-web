// src/hooks/useTechTreeColors/useTechTreeColors.ts
import type { TechTree } from "../useTechTree/useTechTree";
import { useEffect, useState } from "react";

import { fetchTechTreeAsync } from "../useTechTree/useTechTree";

/**
 * Custom hook to fetch the tech tree colors for all ship types.
 * Uses cached fetches to avoid redundant API calls.
 * Only fetches when enabled to avoid unnecessary requests for users not viewing stats.
 *
 * @param {boolean} [enabled=true] - Whether to fetch the colors.
 * @returns {{techColors: Record<string, string>, loading: boolean, error: string | null}}
 *          An object containing the tech colors, loading state, and error state.
 */
export const useTechTreeColors = (enabled: boolean = true) => {
	const [techColors, setTechColors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(enabled);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!enabled) {
			setLoading(false);
			return;
		}

		/**
		 * Fetches the tech tree colors for all ship types.
		 */
		const fetchColors = async () => {
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

				setTechColors(colors);
			} catch (err: unknown) {
				setError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};

		fetchColors();
	}, [enabled]);

	return { techColors, loading, error };
};
