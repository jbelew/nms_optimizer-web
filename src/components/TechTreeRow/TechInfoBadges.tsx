import React from "react";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Button, Dialog } from "@radix-ui/themes";

import { BonusStatusIcon } from "./BonusStatusIcon";
import { ModuleSelectionDialog } from "../ModuleSelectionDialog";
import { useTechTreeRow } from "./useTechTreeRow";

type TechInfoBadgesProps = ReturnType<typeof useTechTreeRow>;

/**
 * Renders the badges for the tech tree row, including the bonus status icon
 * and the trigger for the module selection dialog.
 *
 * @param props - The props for the component, derived from the `useTechTreeRow` hook.
 * @returns The rendered badges.
 */
export const TechInfoBadges: React.FC<TechInfoBadgesProps> = ({
	hasTechInGrid,
	techColor,
	techMaxBonus,
	techSolvedBonus,
	modules,
	currentCheckedModules,
	techImage,
	solving,
	...props
}) => {
	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon techMaxBonus={techMaxBonus} techSolvedBonus={techSolvedBonus} />
			)}
			<Dialog.Root>
				<Dialog.Trigger>
					<Button
						mt="1"
						className="!ml-1 align-top !font-mono"
						size="1"
						radius="medium"
						variant={modules.length === 1 ? "surface" : "solid"}
						color={hasTechInGrid ? "gray" : techColor}
						disabled={modules.length === 1 || solving}
					>
						x{currentCheckedModules.length}
						<OpenInNewWindowIcon />
					</Button>
				</Dialog.Trigger>
				<ModuleSelectionDialog
					{...props}
					techColor={techColor}
					currentCheckedModules={currentCheckedModules}
					techImage={techImage}
				/>
			</Dialog.Root>
		</>
	);
};
