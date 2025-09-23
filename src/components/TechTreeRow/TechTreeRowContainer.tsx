import React from "react";
import { useTechTreeRowState } from "./hooks/useTechTreeRowState";
import { useTechTreeRowHandlers } from "./hooks/useTechTreeRowHandlers";
import { TechTreeRow, TechTreeRowProps } from "./TechTreeRow";

type TechTreeRowContainerProps = Omit<
	TechTreeRowProps,
	| "hasTechInGrid"
	| "translatedTechName"
	| "techMaxBonus"
	| "techSolvedBonus"
	| "moduleCount"
	| "currentCheckedModules"
	| "hasRewardModules"
	| "rewardModules"
	| "imagePath"
	| "imagePath2x"
	| "hasMultipleGroups"
	| "activeGroup"
	| "handleReset"
	| "handleCheckboxChange"
	| "handleAllCheckboxesChange"
	| "handleOptimizeClick"
	| "handleGroupChange"
> & { handleOptimize: (tech: string) => Promise<void> };

export const TechTreeRowContainer: React.FC<TechTreeRowContainerProps> = ({
	tech,
	techImage,
	isGridFull,
	solving,
	selectedShipType,
	techColor,
    handleOptimize,
}) => {
	const state = useTechTreeRowState(tech, techImage);
	const handlers = useTechTreeRowHandlers(
		tech,
		handleOptimize,
		isGridFull,
		state.hasTechInGrid
	);

	return (
		<TechTreeRow
			tech={tech}
			techImage={techImage}
			isGridFull={isGridFull}
			solving={solving}
			selectedShipType={selectedShipType}
			techColor={techColor}
			{...state}
			{...handlers}
		/>
	);
};
