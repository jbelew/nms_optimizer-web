import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Separator } from "@radix-ui/themes";

import { TechTreeRow } from "../TechTreeRow/TechTreeRow";
import { type TechTreeItem } from "../../hooks/useTechTree";

// --- Image Map (This is the key part) ---
type TypeImageMap = {
	[key: string]: string;
};

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
 * TechTreeSection component renders a section of the tech tree.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.type - The type of technology.
 * @param {TechTreeItem[]} props.technologies - Array of technology items.
 * @param {number} props.index - The index of the section.
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Function to handle optimization.
 * @param {boolean} props.solving - Indicates whether solving is in progress.
 * @param {string} props.selectedShipType - The selected ship type.
 *
 * @returns {JSX.Element} - The rendered component.
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

export const TechTreeSection: React.FC<TechTreeSectionProps> = React.memo(
	({ type, technologies, handleOptimize, solving, isGridFull, selectedShipType }) => {
		// selectedShipType is kept here if TechTreeSection needs it for other things
		const { t } = useTranslation();
		// Determine the image path from the typeImageMap
		const imagePath = typeImageMap[type] ? `/assets/img/sidebar/${typeImageMap[type]}` : null;
		return (
			<div className="mb-6 lg:mb-6 last:mb-0 sidebar__section">
				<div className="flex items-start">
					{/* Conditionally render the image if imagePath is available */}
					{imagePath &&
						typeImageMap[type] && ( // Ensure type exists in map before rendering image
							<img
								src={imagePath}
								alt={type}
								className="sm:mt-1 ml-1 h-[24] w-[32] mr-2 opacity-25"
							/>
						)}
					<h2 className="text-xl sm:text-2xl heading-styled">
						{t(`techTree.categories.${type}`).toUpperCase()}
					</h2>
				</div>

				<Separator orientation="horizontal" size="4" className="mt-2 mb-4 sidebar__separator" />

				{/* Render each technology as a TechTreeRow */}
				{technologies.map((tech) => {
					const rewardModules = tech.modules.filter((module) => module.type === "reward");
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
TechTreeSection.propTypes = {
	type: PropTypes.string.isRequired,
	technologies: PropTypes.array.isRequired,
	index: PropTypes.number.isRequired,
	handleOptimize: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
};
