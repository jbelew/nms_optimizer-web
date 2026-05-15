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
import { useTranslation } from "react-i18next";

import { type TechTreeItem } from "../../hooks/useTechTree/useTechTree";
import { TechTreeRow } from "../TechTreeRow/TechTreeRow";

import "./TechTreeSection.scss";

/**
 * Mapping of technology categories to their corresponding decorative icon filenames.
 */
type TypeImageMap = {
	[key: string]: string;
};

/**
 * Registry of sidebar icons indexed by technology category name.
 */
const typeImageMap: TypeImageMap = {
	"Defensive Systems": "defensive.webp",
	"Fleet Upgrades": "upgrade.webp",
	"Hazard Protection": "hazard.webp",
	Hyperdrive: "hyperdrive.webp",
	"Life Support": "health.webp",
	Mining: "mining.webp",
	"Movement Systems": "movement.webp",
	Propulsion: "propulsion.webp",
	"Quest Rewards": "secondary2.webp",
	Scanners: "scanners.webp",
	"Secondary Weapons": "secondary.webp",
	"Upgrade Modules": "upgrade.webp",
	Utilities: "secondary.webp",
	Weaponry: "weaponry.webp",
};

/**
 * Props for the `TechTreeSection` component.
 */
interface TechTreeSectionProps {
	/** Asynchronous callback for triggering an optimization solve. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Index of the section for ordering purposes. */
	index: number;
	/** Whether the grid has reached its module capacity. */
	isGridFull: boolean;
	/** Whether any optimization solve is currently running. */
	solving: boolean;
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
 * @see {@link TechTreeRow}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeSection type="Propulsion" technologies={items} index={0} handleOptimize={fn} solving={false} isGridFull={false} />
 * // renders Propulsion header and child rows
 * ```
 */
export const TechTreeSection: React.FC<TechTreeSectionProps> = ({
	handleOptimize,
	isGridFull,
	solving,
	technologies,
	type,
}) => {
	const { t } = useTranslation();
	// Determine the image path from the typeImageMap
	const imagePath = typeImageMap[type]
		? `/assets/img/sidebar/${typeImageMap[type]}?v=${__APP_VERSION__}`
		: null;

	return (
		<div className="sidebar__section mb-6 last:mb-0 lg:mb-6">
			<div className="flex items-start">
				{/* Conditionally render the image if imagePath is available */}
				{imagePath &&
					typeImageMap[type] && ( // Ensure type exists in map before rendering image
						<img
							alt={type}
							className="mt-px mr-1 ml-1 opacity-35 sm:mt-1"
							height="24"
							src={imagePath}
							srcSet={`${imagePath.replace(".webp", "@2x.webp")} 2x`}
							width="36"
						/>
					)}
				<h2 className="heading-styled text-xl sm:text-2xl">
					{t(`techTree.categories.${type}`).toUpperCase()}
				</h2>
			</div>

			<Separator className="sidebar__separator mt-2 mb-4" orientation="horizontal" size="4" />

			{/* Render each technology as a TechTreeRow */}
			{technologies.map((tech: TechTreeItem) => (
				<TechTreeRow
					handleOptimize={handleOptimize}
					isGridFull={isGridFull} // Pass isGridFull down
					key={tech.key}
					solving={solving}
					tech={tech.key}
					techColor={tech.color} // Pass tech.color
					techImage={tech.image} // Pass the tech.image here
				/>
			))}
		</div>
	);
};

TechTreeSection.displayName = "TechTreeSection";
