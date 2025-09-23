import { Badge } from "@radix-ui/themes";
import React from "react";
import { twMerge } from "tailwind-merge";
import { TechTreeRowModuleSelectionDialog } from "./TechTreeRowModuleSelectionDialog";
import { TechTreeRowBonusStatusIcon } from "./TechTreeRowBonusStatusIcon";


export interface TechInfoBadgesProps {
	hasTechInGrid: boolean;
	techColor: string;
	moduleCount: number;
	currentCheckedModulesLength: number;
	techMaxBonus: number;
	techSolvedBonus: number;
	modules: { label: string; id: string; image: string; type?: string }[];
	currentCheckedModules: string[];
	handleCheckboxChange: (moduleId: string) => void;
	handleAllCheckboxesChange: (moduleIds: string[]) => void;
	translatedTechName: string;
}

export const TechTreeRowTechInfoBadges: React.FC<TechInfoBadgesProps> = ({
	hasTechInGrid,
	techColor,
	moduleCount,
	currentCheckedModulesLength,
	techMaxBonus,
	techSolvedBonus,
	modules,
	currentCheckedModules,
	handleCheckboxChange,
	handleAllCheckboxesChange,
	translatedTechName,
}) => {
	return (
		<div className="flex items-start justify-end gap-1">
			{hasTechInGrid && (
				<Badge color={techColor} variant="soft" radius="full">
					<TechTreeRowBonusStatusIcon
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
					/>
					{techSolvedBonus.toFixed(2)}%
				</Badge>
			)}

			<TechTreeRowModuleSelectionDialog
				modules={modules}
				currentCheckedModules={currentCheckedModules}
				handleCheckboxChange={handleCheckboxChange}
				handleAllCheckboxesChange={handleAllCheckboxesChange}
				translatedTechName={translatedTechName}
                moduleCount={moduleCount}
                currentCheckedModulesLength={currentCheckedModulesLength}
                techColor={techColor}
                hasTechInGrid={hasTechInGrid}
			/>
		</div>
	);
};
