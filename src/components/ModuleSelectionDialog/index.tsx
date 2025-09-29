import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import React from "react";
import { Dialog } from "@radix-ui/themes";

import { DialogBody } from "./DialogBody";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";

import "./ModuleSelectionDialog.css";

/**
 * Represents a single technology module.
 */
export interface Module {
	label: string;
	id: string;
	image: string;
	type?: string;
	checked?: boolean;
}

/**
 * Represents a collection of modules, grouped by their type (e.g., "core", "bonus").
 */
export interface GroupedModules {
	[key: string]: Module[];
}

/**
 * Props for the main ModuleSelectionDialog component.
 */
export interface ModuleSelectionDialogProps {
	translatedTechName: string;
	groupedModules: GroupedModules;
	currentCheckedModules: string[];
	handleValueChange: (newValues: string[]) => void;
	handleSelectAllChange: (checked: boolean | "indeterminate") => void;
	handleOptimizeClick: () => Promise<void>;
	allModulesSelected: boolean;
	isIndeterminate: boolean;
	techColor: TechTreeRowProps["techColor"];
	techImage: string | null;
}

/**
 * Renders the content of the module selection dialog.
 * This component is responsible for displaying the list of available modules,
 * allowing the user to select them, and triggering the optimization.
 * It is composed of smaller, more manageable child components.
 *
 * @param {ModuleSelectionDialogProps} props - The props for the component.
 * @returns {JSX.Element} The rendered dialog content.
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = ({
	translatedTechName,
	groupedModules,
	currentCheckedModules,
	handleValueChange,
	handleSelectAllChange,
	handleOptimizeClick,
	allModulesSelected,
	isIndeterminate,
	techColor,
	techImage,
}) => {
	return (
		<Dialog.Content size="2">
			<DialogHeader
				translatedTechName={translatedTechName}
				techImage={techImage}
				techColor={techColor}
			/>

			<Dialog.Description className="sr-only">
				Select modules to include in the optimization calculation.
			</Dialog.Description>

			<DialogBody
				groupedModules={groupedModules}
				currentCheckedModules={currentCheckedModules}
				handleValueChange={handleValueChange}
				handleSelectAllChange={handleSelectAllChange}
				allModulesSelected={allModulesSelected}
				isIndeterminate={isIndeterminate}
				techColor={techColor}
			/>

			<DialogFooter
				handleOptimizeClick={handleOptimizeClick}
				isOptimizeDisabled={currentCheckedModules.length === 0}
			/>
		</Dialog.Content>
	);
};
