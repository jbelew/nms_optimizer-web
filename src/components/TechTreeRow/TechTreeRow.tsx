import "./TechTreeRow.scss";

import React from "react";
import { Avatar } from "@radix-ui/themes";

import { ActionButtons } from "./ActionButtons";
import { TechInfo } from "./TechInfo";
import { TechInfoBadges } from "./TechInfoBadges";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the `TechTreeRow` component.
 */
export interface TechTreeRowProps {
	/** Unique identifier for the technology (e.g., 'launch_thrusters'). **Must be a valid key.** */
	tech: string;
	/** Asynchronous callback to trigger an optimization solve for this row. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether any optimization solve is currently running globally. */
	solving: boolean;
	/** Filename of the icon image to display. `null` if no icon is available. */
	techImage: string | null;
	/** Whether all active grid slots are currently occupied. */
	isGridFull: boolean;
	/** The theme color identifier for the technology's avatar and UI accents. */
	techColor:
		| "gray"
		| "gold"
		| "bronze"
		| "brown"
		| "yellow"
		| "amber"
		| "orange"
		| "tomato"
		| "red"
		| "ruby"
		| "crimson"
		| "pink"
		| "plum"
		| "purple"
		| "violet"
		| "iris"
		| "indigo"
		| "blue"
		| "cyan"
		| "teal"
		| "jade"
		| "green"
		| "grass"
		| "lime"
		| "mint"
		| "sky";
}

/**
 * A component representing a single row in the technology sidebar.
 *
 * It provides the user interface for a specific technology category, including
 * an avatar, status badges, and action buttons for optimization and resetting.
 * It uses the `useTechTreeRow` hook to manage its internal state and derived data.
 *
 * @param {TechTreeRowProps} props - Component properties.
 * @returns {JSX.Element} The rendered technology row.
 *
 * @example
 * <TechTreeRow tech="pulse" techColor="blue" solving={false} isGridFull={false} handleOptimize={fn} techImage="pulse.webp" />
 */
export const TechTreeRow: React.FC<TechTreeRowProps> = (props) => {
	const hookData = useTechTreeRow(props);
	const { translatedTechName, imagePath, techColor, imagePath2x } = hookData;

	return (
		<div className="items-top optimizationButton mt-2 mb-2 ml-0 flex gap-2 sm:ml-1 lg:mr-1">
			<ActionButtons {...props} hookData={hookData} />

			<Avatar
				size="2"
				radius="full"
				alt={translatedTechName}
				fallback="IK"
				src={imagePath}
				color={techColor}
				srcSet={`${imagePath} 1x, ${imagePath2x} 2x`}
			/>

			<div className="grid flex-1 grid-cols-[1fr_auto] items-start gap-2">
				{/* First column */}
				<div className="flex justify-start">
					<TechInfo hookData={hookData} />
				</div>

				{/* Right-hand group */}
				<div className="flex items-start justify-end gap-1">
					<TechInfoBadges {...props} hookData={hookData} />
				</div>
			</div>
		</div>
	);
};

TechTreeRow.displayName = "TechTreeRow";
