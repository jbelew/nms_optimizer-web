import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import type { DialogBodyProps } from "./DialogBody";
import type { DialogFooterProps } from "./DialogFooter";
import type { DialogHeaderProps } from "./DialogHeader";
import React from "react";
import { Dialog } from "@radix-ui/themes";

import { DialogBody } from "./DialogBody";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";

import "./ModuleSelectionDialog.scss";

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
 * Child components receive all props and call their hooks directly (colocated hook pattern).
 *
 * @param {ModuleSelectionDialogProps} props - The props for the component.
 * @returns {JSX.Element} The rendered dialog content.
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = (props) => {
	const headerProps: DialogHeaderProps = {
		translatedTechName: props.translatedTechName,
		techImage: props.techImage,
		techColor: props.techColor,
	};

	const bodyProps: DialogBodyProps = {
		groupedModules: props.groupedModules,
		currentCheckedModules: props.currentCheckedModules,
		handleValueChange: props.handleValueChange,
		handleSelectAllChange: props.handleSelectAllChange,
		allModulesSelected: props.allModulesSelected,
		isIndeterminate: props.isIndeterminate,
		techColor: props.techColor,
	};

	const footerProps: DialogFooterProps = {
		handleOptimizeClick: props.handleOptimizeClick,
		currentCheckedModules: props.currentCheckedModules,
	};

	return (
		<Dialog.Content
			size={{ initial: "1", sm: "2" }}
			// className="moduleSelection__content flex flex-col"
		>
			<DialogHeader {...headerProps} />

			{/* <div className="flex-1 overflow-y-auto pr-4 mb-4"> */}
			<Dialog.Description className="sr-only">
				Select modules to include in the optimization calculation.
			</Dialog.Description>

			<DialogBody {...bodyProps} />
			{/* </div> */}

			<DialogFooter {...footerProps} />
		</Dialog.Content>
	);
};
