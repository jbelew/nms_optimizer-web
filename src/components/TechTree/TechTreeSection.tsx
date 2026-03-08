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
	Weaponry: "weaponry.webp",
	"Defensive Systems": "defensive.webp",
	Hyperdrive: "hyperdrive.webp",
	Mining: "mining.webp",
	"Secondary Weapons": "secondary.webp",
	"Fleet Upgrades": "upgrade.webp",
	Scanners: "scanners.webp",
	Utilities: "secondary.webp",
	Propulsion: "propulsion.webp",
	"Hazard Protection": "hazard.webp",
	"Life Support": "health.webp",
	"Movement Systems": "movement.webp",
	"Quest Rewards": "secondary2.webp",
	"Upgrade Modules": "upgrade.webp",
};

/**
 * Props for the `TechTreeSection` component.
 */
interface TechTreeSectionProps {
	/** The category identifier for this section (e.g., 'Weaponry'). **Must exist in translations.** */
	type: string;
	/** Array of individual technology items to render in this section. */
	technologies: TechTreeItem[];
	/** Index of the section for ordering purposes. */
	index: number;
	/** Asynchronous callback for triggering an optimization solve. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether any optimization solve is currently running. */
	solving: boolean;
	/** Whether the grid has reached its module capacity. */
	isGridFull: boolean;
}

/**
 * A layout component that groups related technologies into a titled section.
 *
 * It renders a category header with a decorative icon, followed by a list
 * of interactive `TechTreeRow` components. It handles localized category
 * names and resolution-aware icon paths.
 *
 * @param {TechTreeSectionProps} props - Component properties.
 * @returns {JSX.Element} The rendered technology category section.
 *
 * @example
 * <TechTreeSection type="Propulsion" technologies={items} index={0} handleOptimize={fn} solving={false} isGridFull={false} />
 */
export const TechTreeSection: React.FC<TechTreeSectionProps> = ({
	type,
	technologies,
	handleOptimize,
	solving,
	isGridFull,
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
							src={imagePath}
							srcSet={`${imagePath.replace(".webp", "@2x.webp")} 2x`}
							alt={type}
							width="36"
							height="24"
							className="mt-px mr-1 ml-1 opacity-35 sm:mt-1"
						/>
					)}
				<h2 className="heading-styled text-xl sm:text-2xl">
					{t(`techTree.categories.${type}`).toUpperCase()}
				</h2>
			</div>

			<Separator orientation="horizontal" size="4" className="sidebar__separator mt-2 mb-4" />

			{/* Render each technology as a TechTreeRow */}
			{technologies.map((tech: TechTreeItem) => (
				<TechTreeRow
					key={tech.key}
					tech={tech.key}
					handleOptimize={handleOptimize}
					solving={solving}
					techImage={tech.image} // Pass the tech.image here
					isGridFull={isGridFull} // Pass isGridFull down
					techColor={tech.color} // Pass tech.color
				/>
			))}
		</div>
	);
};

TechTreeSection.displayName = "TechTreeSection";
