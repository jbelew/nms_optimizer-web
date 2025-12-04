import React from "react";
import { Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { type TechTreeItem } from "../../hooks/useTechTree/useTechTree";
import { TechTreeRow } from "../TechTreeRow/TechTreeRow";

/**
 * @typedef {object} TypeImageMap
 * @property {string} [key] - The key is the technology type, and the value is the image file name.
 */
type TypeImageMap = {
	[key: string]: string;
};

/**
 * A map of technology types to their corresponding image file names.
 * @type {TypeImageMap}
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
 * @interface TechTreeSectionProps
 * @property {string} type - The category type of the technologies.
 * @property {TechTreeItem[]} technologies - An array of technology items in this section.
 * @property {number} index - The index of this section.
 * @property {(tech: string) => Promise<void>} handleOptimize - Callback to trigger optimization.
 * @property {boolean} solving - Indicates if an optimization is in progress.
 * @property {boolean} isGridFull - Boolean that returns true if the grid is full.
 */
interface TechTreeSectionProps {
	type: string;
	technologies: TechTreeItem[];
	index: number;
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	isGridFull: boolean; // Add isGridFull prop
}

/**
 * TechTreeSection component renders a section of the tech tree, grouping technologies by type.
 * It displays a header with an optional image and a list of `TechTreeRow` components.
 *
 * @param {TechTreeSectionProps} props - The props for the TechTreeSection component.
 * @returns {JSX.Element} The rendered TechTreeSection component.
 */
export const TechTreeSection: React.FC<TechTreeSectionProps> = React.memo(
	({ type, technologies, handleOptimize, solving, isGridFull }) => {
		const { t } = useTranslation();
		// Determine the image path from the typeImageMap
		const imagePath = typeImageMap[type] ? `/assets/img/sidebar/${typeImageMap[type]}` : null;

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
								className="mt-px mr-1 ml-1 h-[24] w-[36] opacity-25 sm:mt-1"
								style={{
									filter: "hue-rotate(190deg) saturate(2) brightness(1.5)",
									mixBlendMode: "color-dodge",
								}}
							/>
						)}
					<h2 className="heading-styled text-xl sm:text-2xl">
						{t(`techTree.categories.${type}`).toUpperCase()}
					</h2>
				</div>

				<Separator
					orientation="horizontal"
					size="4"
					className="sidebar__separator mt-2 mb-4"
				/>

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
	}
);

TechTreeSection.displayName = "TechTreeSection";
