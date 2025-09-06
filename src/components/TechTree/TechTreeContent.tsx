import React, { useMemo } from "react";

import { type TechTree, type TechTreeItem } from "../../hooks/useTechTree/useTechTree";
import { useGridStore } from "../../store/GridStore";
import { TechTreeSection } from "./TechTreeSection";

/**
 * @interface TechTreeContentProps
 * @property {(tech: string) => Promise<void>} handleOptimize - Function to call when optimizing a tech.
 * @property {boolean} solving - Indicates if the optimizer is currently solving.
 * @property {TechTree} techTree - The tech tree data.
 * @property {string} selectedShipType - The currently selected ship type.
 */
interface TechTreeContentProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	techTree: TechTree; // Define a more specific type for techTree if possible
	selectedShipType: string;
}

/**
 * Renders the main content of the tech tree, processing and displaying the sections.
 *
 * @param {TechTreeContentProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech tree content.
 */
export const TechTreeContent: React.FC<TechTreeContentProps> = React.memo(
	({ handleOptimize, solving, techTree, selectedShipType }) => {
		const isGridFull = useGridStore((state) => state.isGridFull()); // Calculate isGridFull once here

		/**
		 * Memoized and processed version of the tech tree.
		 * Filters out non-technology categories, ensures correct types, and sorts technologies alphabetically.
		 * @type {Record<string, TechTreeItem[]>}
		 */
		const processedTechTree = useMemo(() => {
			const result: { [key: string]: TechTreeItem[] } = {};
			Object.entries(techTree).forEach(([category, technologies]) => {
				if (
					category === "recommended_builds" ||
					category === "grid" ||
					category === "grid_definition"
				)
					return;

				const safeTechnologies = Array.isArray(technologies) ? technologies : [];
				if (!Array.isArray(technologies)) {
					console.warn(
						`TechTree: Expected 'technologies' to be an array for category '${category}', but received:`,
						technologies
					);
				}

				const mappedAndSortedTechnologies = safeTechnologies
					.filter(
						(tech): tech is TechTreeItem =>
							typeof tech === "object" && tech !== null && "key" in tech
					)
					.map((tech: TechTreeItem) => ({
						...tech,
						modules: tech.modules || [],
						image: tech.image || null,
					}))
					.sort((a, b) => a.label.localeCompare(b.label));

				result[category] = mappedAndSortedTechnologies;
			});
			return result;
		}, [techTree]);

		/**
		 * Memoized array of `TechTreeSection` components to be rendered.
		 * Each section represents a category of technologies.
		 * @type {JSX.Element[]}
		 */
		const renderedTechTree = useMemo(
			() =>
				Object.entries(processedTechTree).map(([type, technologies], index) => (
					<TechTreeSection
						key={type}
						type={type}
						technologies={technologies as TechTreeItem[]}
						handleOptimize={handleOptimize}
						solving={solving}
						index={index}
						isGridFull={isGridFull} // Pass isGridFull down
						selectedShipType={selectedShipType} // Pass selectedShipType down
					/>
				)),
			[processedTechTree, handleOptimize, solving, isGridFull, selectedShipType]
		);

		return <>{renderedTechTree}</>;
	}
);

TechTreeContent.displayName = "TechTreeContent";
