/**
 * Categorized technology section layout module.
 *
 * @remarks
 * This module provides the `TechTreeSection` component, which groups
 * individual technologies under themed headers with decorative icons.
 *
 * @see {@link TechTreeSection}
 * @see {@link ./TechTreeSection.test.tsx Unit Tests}
 *
 * @category Components
 */

import React from "react";
import { Separator } from "@radix-ui/themes";

import { type TechTreeItem } from "@/hooks/useTechTree/useTechTree";

import { TechTreeSectionHeader } from "./TechTreeSectionHeader";
import { TechTreeSectionList } from "./TechTreeSectionList";

import "./TechTreeSection.scss";

/**
 * Props for the `TechTreeSection` component.
 */
interface TechTreeSectionProps {
	/** Index of the section for ordering purposes. */
	index: number;
	/** Array of individual technology items to render in this section. */
	technologies: TechTreeItem[];
	/** The category identifier for this section (e.g., 'Weaponry'). **Must exist in translations.** */
	type: string;
}

/**
 * A layout component that groups related technologies into a titled section.
 *
 * @remarks
 * It renders a category header with a decorative icon, followed by a list
 * of interactive `TechTreeRow` components. It handles localized category
 * names and resolution-aware icon paths.
 *
 * @param {TechTreeSectionProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered technology category section.
 *
 * @see {@link TechTreeSectionList}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeSection type="Propulsion" technologies={items} index={0} />
 * // renders Propulsion header and child rows
 * ```
 */
export const TechTreeSection: React.FC<TechTreeSectionProps> = ({ technologies, type }) => {
	return (
		<div className="sidebar__section mb-6 last:mb-0 lg:mb-6">
			<TechTreeSectionHeader type={type} />

			<Separator className="sidebar__separator mt-2 mb-4" orientation="horizontal" size="4" />

			<TechTreeSectionList technologies={technologies} />
		</div>
	);
};

TechTreeSection.displayName = "TechTreeSection";
