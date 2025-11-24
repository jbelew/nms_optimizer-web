import type { TechTreeRowProps } from "./TechTreeRow";
import React, { useRef, useState, useTransition } from "react";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Button, Dialog } from "@radix-ui/themes";

import { useA11yStore } from "@/store/A11yStore";

import { ModuleSelectionDialog } from "../ModuleSelectionDialog";
import { BonusStatusIcon } from "./BonusStatusIcon";
import { useTechTreeRow } from "./useTechTreeRow";

interface TechInfoBadgesProps extends TechTreeRowProps {
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * Renders the badges for the tech tree row, including the bonus status icon
 * and the trigger for the module selection dialog.
 * Receives hook data from parent to avoid redundant hook calls.
 *
 * @param props - The props for the component.
 * @returns The rendered badges.
 */
export const TechInfoBadges: React.FC<TechInfoBadgesProps> = ({ hookData, tech }) => {
	const { a11yMode } = useA11yStore();
	const [isOpen, setIsOpen] = useState(false);
	const [initialModules, setInitialModules] = useState<string[]>([]);
	const optimizeClickedRef = useRef(false);
	const [, startTransition] = useTransition();

	const {
		hasTechInGrid,
		techColor,
		techMaxBonus,
		techSolvedBonus,
		modules,
		currentCheckedModules,
		techImage,
		solving,
		handleAllCheckboxesChange,
		handleOptimizeClick,
		groupedModules,
		allModulesSelected,
		isIndeterminate,
		handleValueChange,
		handleSelectAllChange,
		translatedTechName,
	} = hookData;

	const handleOpenChange = (open: boolean) => {
		if (open) {
			setInitialModules(currentCheckedModules);
			optimizeClickedRef.current = false;
			startTransition(() => {
				setIsOpen(open);
			});
		} else {
			// Dialog is closing
			startTransition(() => {
				if (!optimizeClickedRef.current) {
					handleAllCheckboxesChange(initialModules);
				}
				setIsOpen(open);
			});
		}
	};

	const handleOptimizeWrapper = async () => {
		optimizeClickedRef.current = true;
		await handleOptimizeClick();
	};

	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon
					tech={tech}
					techMaxBonus={techMaxBonus}
					techSolvedBonus={techSolvedBonus}
				/>
			)}
			<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Dialog.Trigger>
					<Button
						mt="1"
						className="ml-1! align-top font-mono!"
						size="1"
						radius="medium"
						highContrast={a11yMode}
						variant={modules.length === 1 ? "surface" : "solid"}
						color={hasTechInGrid ? "gray" : techColor}
						disabled={modules.length === 1 || solving}
					>
						x{currentCheckedModules.length}
						<OpenInNewWindowIcon />
					</Button>
				</Dialog.Trigger>
				{isOpen && (
					<ModuleSelectionDialog
						translatedTechName={translatedTechName}
						groupedModules={groupedModules}
						currentCheckedModules={currentCheckedModules}
						handleValueChange={handleValueChange}
						handleSelectAllChange={handleSelectAllChange}
						handleOptimizeClick={handleOptimizeWrapper}
						allModulesSelected={allModulesSelected}
						isIndeterminate={isIndeterminate}
						techColor={techColor}
						techImage={techImage}
					/>
				)}
			</Dialog.Root>
		</>
	);
};
