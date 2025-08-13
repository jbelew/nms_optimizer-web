// src/hooks/useTechTreeColors/useTechTreeColors.ts
import { useEffect, useState } from "react";

import { API_URL } from "../../constants";
import { type TechTree } from "../useTechTree/useTechTree"; // Assuming TechTree interface is defined here

export const useTechTreeColors = () => {
	const [techColors, setTechColors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchColors = async () => {
			try {
				const [starshipResponse, multitoolResponse] = await Promise.all([
					fetch(`${API_URL}tech_tree/standard`),
					fetch(`${API_URL}tech_tree/standard-mt`),
				]);

				if (!starshipResponse.ok) {
					throw new Error(
						`HTTP error! status: ${starshipResponse.status} for standard tech tree`
					);
				}
				if (!multitoolResponse.ok) {
					throw new Error(
						`HTTP error! status: ${multitoolResponse.status} for standard-mt tech tree`
					);
				}

				const starshipData: TechTree = await starshipResponse.json();
				const multitoolData: TechTree = await multitoolResponse.json();

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
