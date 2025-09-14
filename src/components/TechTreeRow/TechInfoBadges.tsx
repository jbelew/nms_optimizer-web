import React from "react";
import { Badge } from "@radix-ui/themes";

import { BonusStatusIcon } from "./BonusStatusIcon";
import { TechTreeRowProps } from "./TechTreeRow";

/**
 * @interface TechInfoBadgesProps
 * @property {boolean} hasTechInGrid - Whether the technology is in the grid.
 * @property {TechTreeRowProps["techColor"]} techColor - The color of the technology.
 * @property {number} moduleCount - The number of modules for the technology.
 * @property {number} currentCheckedModulesLength - The number of currently checked modules.
 * @property {number} techMaxBonus - The maximum potential bonus for the technology.
 * @property {number} techSolvedBonus - The bonus achieved from the current solved state for the technology.
 */
interface TechInfoBadgesProps {
	hasTechInGrid: boolean;
	techColor: TechTreeRowProps["techColor"];
	moduleCount: number;
	currentCheckedModulesLength: number;
	techMaxBonus: number;
	techSolvedBonus: number;
}

/**
 * Renders badges for a tech tree row, including a bonus status icon and a module count.
 *
 * @param {TechInfoBadgesProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech info badges.
 */
export const TechInfoBadges: React.FC<TechInfoBadgesProps> = React.memo(
	({
		hasTechInGrid,
		techColor,
		moduleCount,
		currentCheckedModulesLength,
		techMaxBonus,
		techSolvedBonus,
	}) => {
		return (
			<>
				{hasTechInGrid && (
					<BonusStatusIcon
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
					/>
				)}
				<Badge
					mt="1"
					className="!ml-0 align-top !font-mono"
					size="1"
					radius="full"
					variant={hasTechInGrid ? "soft" : "surface"}
					color={hasTechInGrid ? "gray" : techColor}
					style={
						hasTechInGrid
							? {
									backgroundColor: "var(--gray-a2)",
									color: "var(--gray-a8)",
								}
							: { backgroundColor: "var(--accent-a3)" }
					}
				>
					x{moduleCount + currentCheckedModulesLength}
				</Badge>
			</>
		);
	}
);
TechInfoBadges.displayName = "TechInfoBadges";
