import React, { useMemo } from "react";


import { useGridStore } from "../../store/GridStore";
import { TechTreeSection } from "./TechTreeSection";
import { type TechTreeItem, type TechTree } from "../../hooks/useTechTree";

interface TechTreeContentProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	techTree: TechTree; // Define a more specific type for techTree if possible
	selectedShipType: string;
}

export const TechTreeContent: React.FC<TechTreeContentProps> = React.memo(
	({ handleOptimize, solving, techTree, selectedShipType }) => {
		const isGridFull = useGridStore((state) => state.isGridFull); // Calculate isGridFull once here

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

