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

import { EmptyState } from "@/components/EmptyState/EmptyState";
import { type TechTree, type TechTreeItem } from "@/hooks/useTechTree/useTechTree";
import { Logger } from "@/utils/system/monitoring";

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
 */
export const TechTreeContent: React.FC<TechTreeContentProps> = ({ techTree }) => {
	/**
	 * Processes raw tech tree data into a list of categories and their technologies.
	 *
	 * @remarks
	 * Filters out top-level metadata and performs alphabetical sorting.
	 */
	const technologyGroups = useMemo(() => {
		const groups: Record<string, TechTreeItem[]> = {};

		Object.entries(techTree).forEach(([key, value]) => {
			// Skip special keys like grid_definition, recommended_builds, and the legacy 'grid' key
			if (key === "grid_definition" || key === "recommended_builds" || key === "grid") return;

			// Check if value is an array of TechTreeItems
			if (Array.isArray(value)) {
				const validItems = value.filter(
					(item) =>
						item && typeof item === "object" && "label" in item && "modules" in item
				) as TechTreeItem[];

				if (validItems.length > 0 || value.length === 0) {
					groups[key] = [...validItems];
					// Sort technologies within each category
					groups[key].sort((a, b) => a.label.localeCompare(b.label));
				}
			}
		});

		return groups;
	}, [techTree]);

	/**
	 * Sorted list of category names.
	 */
	const categories = useMemo(() => Object.keys(technologyGroups).sort(), [technologyGroups]);

	if (categories.length === 0) {
		Logger.warn("TechTreeContent: No technology categories found to render.", {
			techTreeKeys: Object.keys(techTree),
		});

		return (
			<EmptyState
				description="No technologies were found for the selected platform."
				title="No Technologies Found"
			/>
		);
	}

	return (
		<div className="tech-tree-content">
			{categories.map((category, index) => (
				<TechTreeSection
					index={index}
					key={category}
					technologies={technologyGroups[category]}
					type={category}
				/>
			))}
		</div>
	);
};

TechTreeContent.displayName = "TechTreeContent";
