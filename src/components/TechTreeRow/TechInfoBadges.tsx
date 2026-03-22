import type { TechTreeRowProps } from "./TechTreeRow";
import React, { useRef, useState, useTransition } from "react";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Button, Dialog } from "@radix-ui/themes";

import { useA11yStore } from "@/store/A11yStore";

import { ConditionalTooltip } from "../ConditionalTooltip/ConditionalTooltip";
import { ModuleSelectionDialog } from "../ModuleSelectionDialog/ModuleSelectionDialog";
import { BonusStatusIcon } from "./BonusStatusIcon";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Props for the `TechInfoBadges` component.
 */
interface TechInfoBadgesProps extends TechTreeRowProps {
	/** Consolidated state and handlers from the `useTechTreeRow` hook. */
	hookData: ReturnType<typeof useTechTreeRow>;
}

/**
 * A component that renders status and configuration badges for a technology row.
 *
 * It displays:
 * 1. The `BonusStatusIcon` (if the tech is in the grid) showing efficiency.
 * 2. A trigger button showing the count of selected modules.
 *
 * Clicking the count button opens the `ModuleSelectionDialog`. This component
 * manages the dialog's lifecycle, including state restoration if the user cancels.
 *
 * @param {TechInfoBadgesProps} props - Component properties.
 * @returns {JSX.Element} The rendered badges and dialog trigger.
 *
 * @example
 * <TechInfoBadges {...props} hookData={hookData} />
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

	/**
	 * Manages the dialog's open/close state and ensures data consistency.
	 *
	 * @param {boolean} open - The new visibility state.
	 * @example
	 */
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

	/**
	 * Wrapper for the optimize callback to ensure the dialog closes only after the solve starts.
	 *
	 * @returns {Promise<void>}
	 * @example
	 */
	const handleOptimizeWrapper = async () => {
		optimizeClickedRef.current = true;
		await handleOptimizeClick();
		// Close the dialog programmatically AFTER the async operation resolves.
		handleOpenChange(false);
	};

	const badgeContent = (
		<div>
			<Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Dialog.Trigger>
					<Button
						mt="1"
						className="ml-1! align-top font-mono! tabular-nums"
						size="1"
						radius="medium"
						highContrast={a11yMode}
						variant={modules.length === 1 ? "surface" : "solid"}
						color={hasTechInGrid ? "gray" : techColor}
						disabled={modules.length === 1 || solving}
						aria-label={`x${currentCheckedModules.length}, ${translatedTechName} Module Selection`}
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
						onClose={() => handleOpenChange(false)}
						allModulesSelected={allModulesSelected}
						isIndeterminate={isIndeterminate}
						techColor={techColor}
						techImage={techImage}
						tech={tech}
					/>
				)}
			</Dialog.Root>
		</div>
	);

	return (
		<>
			{hasTechInGrid && (
				<BonusStatusIcon
					tech={tech}
					techMaxBonus={techMaxBonus}
					techSolvedBonus={techSolvedBonus}
				/>
			)}
			{modules.length > 1 ? (
				<ConditionalTooltip label={`${translatedTechName} Module Selection`}>
					{badgeContent}
				</ConditionalTooltip>
			) : (
				badgeContent
			)}
		</>
	);
};
