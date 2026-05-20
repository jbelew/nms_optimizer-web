import React from "react";
import { useTranslation } from "react-i18next";

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
 * Component that renders the header for a technology tree section.
 */
export const TechTreeSectionHeader: React.FC<{ type: string }> = ({ type }) => {
	const { t } = useTranslation();
	// Determine the image path from the typeImageMap
	const imagePath = typeImageMap[type]
		? `/assets/img/sidebar/${typeImageMap[type]}?v=${__APP_VERSION__}`
		: null;

	return (
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
	);
};
