import "./TechTreeRow.scss";

import React from "react";
import { Avatar } from "@radix-ui/themes";

import { ActionButtons } from "./ActionButtons";
import { TechInfo } from "./TechInfo";
import { TechInfoBadges } from "./TechInfoBadges";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the TechTreeRow component.
 */
export interface TechTreeRowProps {
	/** The unique identifier for the technology. */
	tech: string;
	/** Async function to handle the optimization process for a given technology. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Boolean indicating if an optimization process is currently active. */
	solving: boolean;
	/** The filename of the image representing the technology (e.g., "hyperdrive.webp"). Null if no specific image. */
	techImage: string | null;
	/** Boolean indicating whether the grid is currently full. */
	isGridFull: boolean;
	/** The color associated with the technology. */
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
 * Renders a single row in the technology tree, allowing users to optimize, reset, and view module details.
 * This component is now a pure presentational component that delegates all its logic to the useTechTreeRow hook.
 *
 * @param {TechTreeRowProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech tree row.
 */
const TechTreeRowComponent: React.FC<TechTreeRowProps> = (props) => {
	const { tech, isGridFull } = props;
	const hookProps = useTechTreeRow(props);
	const {
		hasTechInGrid,
		solving,
		translatedTechName,
		handleOptimizeClick,
		handleReset,
		imagePath,
		techColor,
		imagePath2x,
		currentCheckedModules,
		isResetting,
	} = hookProps;

	return (
		<div className="items-top optimizationButton mt-2 mr-1 mb-2 ml-0 flex gap-2 sm:ml-1">
			<ActionButtons
				tech={tech}
				hasTechInGrid={hasTechInGrid}
				isGridFull={isGridFull}
				solving={solving}
				translatedTechName={translatedTechName}
				handleOptimizeClick={handleOptimizeClick}
				handleReset={handleReset}
				currentCheckedModules={currentCheckedModules}
				isResetting={isResetting}
			/>

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
					<TechInfo tech={tech} translatedTechName={translatedTechName} />
				</div>

				{/* Right-hand group */}
				<div className="flex items-start justify-end gap-1">
					<TechInfoBadges {...hookProps} />
				</div>
			</div>
		</div>
	);
};

/**
 * Memoized version of TechTreeRowComponent to prevent unnecessary re-renders.
 */
export const TechTreeRow = React.memo(TechTreeRowComponent);
