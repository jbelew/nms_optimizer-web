// src/hooks/useTechTreeColors/useTechTreeColors.ts
import type { TechTree } from "../useTechTree/useTechTree";
import { useEffect, useState } from "react";

import { fetchTechTree } from "../useTechTree/useTechTree";

// Assuming TechTree interface is defined here

/**
 * Custom hook to fetch the tech tree colors from the API.
 *
 * @returns {{techColors: Record<string, string>, loading: boolean, error: string | null}}
 *          An object containing the tech colors, loading state, and error state.
 */
export const useTechTreeColors = () => {
	const [techColors, setTechColors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		/**
		 * Fetches the tech tree colors from the API.
		 */
		const fetchColors = async () => {
			try {
				const [starshipResource, multitoolResource] = await Promise.all([
					fetchTechTree("standard"),
					fetchTechTree("standard-mt"),
				]);
				const starshipData: TechTree = starshipResource.read();
				const multitoolData: TechTree = multitoolResource.read();

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

				processTechTree(starshipData);
				processTechTree(multitoolData);

				setTechColors(colors);
			} catch (err: unknown) {
				setError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};

		fetchColors();
	}, []);

	return { techColors, loading, error };
};
