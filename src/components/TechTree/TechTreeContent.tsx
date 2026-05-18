/**
 * Technology tree data processing and list module.
 *
 * @remarks
 * This module contains the `TechTreeContent` component, which transforms
 * raw technology tree data into a sorted, categorical list of interactive sections.
 *
 * @see {@link TechTreeContent}
 * @see {@link ./TechTreeContent.test.tsx Unit Tests}
 *
 * @category Components
 */

import React, { useMemo } from "react";

import { type TechTree, type TechTreeItem } from "@/hooks/useTechTree/useTechTree";

import { TechTreeSection } from "./TechTreeSection";

/**
 * Props for the `TechTreeContent` component.
 */
interface TechTreeContentProps {
	/** The full technology tree data structure to render. **Must be valid `TechTree` data.** */
	techTree: TechTree;
}

/**
 * Internal component that handles the processing and rendering of technology sections.
 *
 * @remarks
 * It filters the raw `techTree` data to remove metadata (like grid definitions),
 * sorts technologies alphabetically within their categories, and calculates
 * the overall grid capacity state.
 *
 * @param {TechTreeContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered technology sections.
 *
 * @see {@link TechTreeSection}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeContent techTree={fetchedTree} />
 * // renders list of tech categories
 * ```
 */
export const TechTreeContent: React.FC<TechTreeContentProps> = ({ techTree }) => {
	/**
	 * Processed version of the tech tree.
	 * Filters out non-technology categories, ensures correct types, and sorts technologies alphabetically.
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
					image: tech.image || null,
					modules: tech.modules || [],
				}))
				.sort((a, b) => a.label.localeCompare(b.label));

			result[category] = mappedAndSortedTechnologies;
		});

		return result;
	}, [techTree]);

	/**
	 * Array of `TechTreeSection` components to be rendered.
	 * Each section represents a category of technologies.
	 */
	const renderedTechTree = useMemo(
		() =>
			Object.entries(processedTechTree).map(([type, technologies], index) => (
				<TechTreeSection
					index={index}
					key={type}
					technologies={technologies as TechTreeItem[]}
					type={type}
				/>
			)),
		[processedTechTree]
	);

	return <>{renderedTechTree}</>;
};

TechTreeContent.displayName = "TechTreeContent";
