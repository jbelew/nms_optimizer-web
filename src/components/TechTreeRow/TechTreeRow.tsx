import "./TechTreeRow.css";

import React from "react";
import { Avatar, Switch } from "@radix-ui/themes";

import { TechTreeRowActionButtons } from "./TechTreeRowActionButtons";
import { TechTreeRowTechInfo } from "./TechTreeRowTechInfo";
import { TechTreeRowTechInfoBadges } from "./TechTreeRowTechInfoBadges";

/**
 * Props for the TechTreeRow component.
 */
export interface TechTreeRowProps {
	tech: string;
	solving: boolean;
	techImage: string | null;
	isGridFull: boolean;
	selectedShipType: string;
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
	hasTechInGrid: boolean;
	translatedTechName: string;
	techMaxBonus: number;
	techSolvedBonus: number;
	moduleCount: number;
	currentCheckedModules: string[];
	hasRewardModules: boolean;
	rewardModules: { label: string; id: string; image: string; type?: string }[];
	imagePath: string;
	imagePath2x: string;
	hasMultipleGroups: boolean;
	activeGroup: any;
	handleReset: () => void;
	handleCheckboxChange: (moduleId: string) => void;
	handleAllCheckboxesChange: (moduleIds: string[]) => void;
	handleOptimizeClick: () => Promise<void>;
	handleGroupChange: (checked: boolean) => void;
}

/**
 * Renders a single row in the technology tree, allowing users to optimize, reset, and view module details.
 *
 * @param {TechTreeRowProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech tree row.
 */
const TechTreeRowComponent: React.FC<TechTreeRowProps> = ({
	tech,
	solving,
	techImage,
	isGridFull,
	techColor,
	hasTechInGrid,
	translatedTechName,
	techMaxBonus,
	techSolvedBonus,
	moduleCount,
	currentCheckedModules,
	hasRewardModules,
	rewardModules,
	imagePath,
	imagePath2x,
	hasMultipleGroups,
	activeGroup,
	handleReset,
	handleCheckboxChange,
	handleAllCheckboxesChange,
	handleOptimizeClick,
	handleGroupChange,
}) => {
	return (
		<div className="items-top optimizationButton mt-2 mr-1 mb-2 ml-0 flex gap-2 sm:ml-1">
			<TechTreeRowActionButtons
				tech={tech}
				hasTechInGrid={hasTechInGrid}
				isGridFull={isGridFull}
				solving={solving}
				translatedTechName={translatedTechName}
				handleOptimizeClick={handleOptimizeClick}
				handleReset={handleReset}
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
					<TechTreeRowTechInfo
						tech={tech}
						translatedTechName={translatedTechName}
						hasRewardModules={hasRewardModules}
						rewardModules={rewardModules}
						currentCheckedModules={currentCheckedModules}
						handleCheckboxChange={handleCheckboxChange}
					/>
				</div>

				{/* Right-hand group */}
				<div className="flex items-start justify-end gap-1">
					<TechTreeRowTechInfoBadges
						hasTechInGrid={hasTechInGrid}
						techColor={techColor}
						moduleCount={moduleCount}
						currentCheckedModulesLength={currentCheckedModules.length}
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
						modules={activeGroup?.modules || []}
						currentCheckedModules={currentCheckedModules}
						handleCheckboxChange={handleCheckboxChange}
						handleAllCheckboxesChange={handleAllCheckboxesChange}
						translatedTechName={translatedTechName}
					/>

					{hasMultipleGroups && (
						<Switch
							mt="1"
							ml="1"
							checked={activeGroup?.type === "max"}
							onCheckedChange={handleGroupChange}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export const TechTreeRow = React.memo(TechTreeRowComponent);
