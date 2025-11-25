import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import React from "react";
import { Dialog } from "@radix-ui/themes";

import { DialogBody } from "./DialogBody";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";
import { useModuleSelectionDialog } from "./useModuleSelectionDialog";

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
 * Uses the colocated hook pattern with `useModuleSelectionDialog` to manage
 * all state and props distribution to child components.
 *
 * @param {ModuleSelectionDialogProps} props - The props for the component.
 * @returns {JSX.Element} The rendered dialog content.
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = (props) => {
	const { headerProps, bodyProps, footerProps } = useModuleSelectionDialog(props);

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
