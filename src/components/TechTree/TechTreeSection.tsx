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
 * @property {() => boolean} isGridFull - Function that returns true if the grid is full.
 * @property {string} selectedShipType - The currently selected ship type.
 */
interface TechTreeSectionProps {
	type: string;
	technologies: TechTreeItem[];
	index: number;
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	isGridFull: () => boolean; // Add isGridFull prop
	selectedShipType: string; // Add selectedShipType prop
}

/**
 * TechTreeSection component renders a section of the tech tree, grouping technologies by type.
 * It displays a header with an optional image and a list of `TechTreeRow` components.
 *
 * @param {TechTreeSectionProps} props - The props for the TechTreeSection component.
 * @param {string} props.type - The category type of the technologies (e.g., "Weaponry", "Hyperdrive").
 * @param {TechTreeItem[]} props.technologies - An array of technology items belonging to this section.
 * @param {number} props.index - The index of this section (used for internal mapping, not directly rendered).
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Callback function to trigger optimization for a specific technology.
 * @param {boolean} props.solving - Indicates if an optimization calculation is currently in progress.
 * @param {() => boolean} props.isGridFull - A function that returns true if the grid is full, disabling certain actions.
 * @param {string} props.selectedShipType - The currently selected ship type, used for filtering or context.
 * @returns {JSX.Element} The rendered TechTreeSection component.
 */
export const TechTreeSection: React.FC<TechTreeSectionProps> = React.memo(
	({ type, technologies, handleOptimize, solving, isGridFull, selectedShipType }) => {
		// selectedShipType is kept here if TechTreeSection needs it for other things
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
								alt={type}
								className="mr-2 ml-1 h-[24] opacity-25 sm:mt-1"
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
				{technologies.map((tech: TechTreeItem) => {
					const rewardModules = tech.modules.filter(
						(module: { type: string }) => module.type === "reward"
					);
					const hasRewardModules = rewardModules.length > 0;
					return (
						<TechTreeRow
							key={tech.key}
							tech={tech.key}
							handleOptimize={handleOptimize}
							solving={solving}
							techImage={tech.image} // Pass the tech.image here
							isGridFull={isGridFull()} // Pass isGridFull down
							hasRewardModules={hasRewardModules} // Pass hasRewardModules
							rewardModules={rewardModules} // Pass rewardModules
							selectedShipType={selectedShipType} // Pass selectedShipType
							moduleCount={tech.module_count} // Pass module_count
							techColor={tech.color} // Pass tech.color
						/>
					);
				})}
			</div>
		);
	}
);

TechTreeSection.displayName = "TechTreeSection";
