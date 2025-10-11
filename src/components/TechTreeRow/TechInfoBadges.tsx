import React, { useRef, useState, useTransition } from "react";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Button, Dialog } from "@radix-ui/themes";

import { ModuleSelectionDialog } from "../ModuleSelectionDialog";
import { BonusStatusIcon } from "./BonusStatusIcon";
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
	const [isOpen, setIsOpen] = useState(false);
	const [initialModules, setInitialModules] = useState<string[]>([]);
	const optimizeClickedRef = useRef(false);
	const [isPending, startTransition] = useTransition();

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
					props.handleAllCheckboxesChange(initialModules);
				}
				setIsOpen(open);
			});
		}
	};

	const handleOptimizeWrapper = async () => {
		optimizeClickedRef.current = true;
		await props.handleOptimizeClick();
	};

	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon techMaxBonus={techMaxBonus} techSolvedBonus={techSolvedBonus} />
			)}
			<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Dialog.Trigger>
					<Button
						mt="1"
						className="!ml-1 align-top !font-mono"
						size="1"
						radius="medium"
						variant={modules.length === 1 ? "surface" : "solid"}
						color={hasTechInGrid ? "gray" : techColor}
						disabled={modules.length === 1 || solving || isPending}
					>
						x{currentCheckedModules.length}
						<OpenInNewWindowIcon />
					</Button>
				</Dialog.Trigger>
				{isOpen && (
					<ModuleSelectionDialog
						{...props}
						techColor={techColor}
						currentCheckedModules={currentCheckedModules}
						techImage={techImage}
						handleOptimizeClick={handleOptimizeWrapper}
					/>
				)}
			</Dialog.Root>
		</>
	);
};
