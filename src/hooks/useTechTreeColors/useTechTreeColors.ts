// src/hooks/useTechTreeColors/useTechTreeColors.ts
import type { TechTree } from "../useTechTree/useTechTree";
import { useEffect, useState } from "react";

import { API_URL } from "../../constants";

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
				const [starshipResponse, multitoolResponse, corvetteResponse] = await Promise.all([
					fetch(`${API_URL}tech_tree/standard`),
					fetch(`${API_URL}tech_tree/standard-mt`),
					fetch(`${API_URL}tech_tree/corvette`),
				]);

				if (!starshipResponse.ok || !multitoolResponse.ok || !corvetteResponse.ok) {
					throw new Error("Failed to fetch tech tree data");
				}

				const starshipData: TechTree = await starshipResponse.json();
				const multitoolData: TechTree = await multitoolResponse.json();
				const corvetteData: TechTree = await corvetteResponse.json();

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
				processTechTree(corvetteData);

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
