/**
 * Interactive technology module configuration dialog module.
 *
 * @remarks
 * This module provides the `ModuleSelectionDialog`, which allows users to
 * precisely control which technology upgrades are included in optimization
 * calculations. It supports categorical filtering and mass-selection.
 *
 * @category Components
 * @see {@link ModuleSelectionDialog}
 * @see {@link ./ModuleSelectionDialog.test.tsx Unit Tests}
 * @see {@link ./ModuleSelectionDialog.stories.tsx Storybook}
 */

import type { TechTreeRowProps } from "../TechTreeRow/TechTreeRow";
import React from "react";
import { Dialog } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { DialogBody } from "./DialogBody";
import { DialogFooter } from "./DialogFooter";
import { DialogHeader } from "./DialogHeader";
import { useModuleSelectionDialog } from "./useModuleSelectionDialog";

import "./ModuleSelectionDialog.scss";

/**
 * Represents a simplified technology module definition used within the selection UI.
 */
export interface SelectionModule {
	/** Display name of the module. */
	label: string;
	/** Unique identifier for the module. */
	id: string;
	/** Icon filename. */
	image: string;
	/** Optional classification (e.g., 'upgrade'). */
	type?: string;
	/** Initial checked status. */
	checked?: boolean;
}

/**
 * A dictionary of module lists, keyed by their grouping category (e.g., 'Procedural Upgrades').
 */
export interface GroupedModules {
	[key: string]: SelectionModule[];
}

/**
 * Props for the `ModuleSelectionDialog` component.
 */
export interface ModuleSelectionDialogProps {
	/** Localized name of the technology being configured. */
	translatedTechName: string;
	/** Modules organized into categories for display. **Must be provided.** */
	groupedModules: GroupedModules;
	/** Array of IDs for currently selected modules. */
	currentCheckedModules: string[];
	/** Callback for individual module selection changes. */
	handleValueChange: (newValues: string[]) => void;
	/** Callback for the "Select All" toggle. */
	handleSelectAllChange: (checked: boolean | "indeterminate") => void;
	/** Asynchronous callback to trigger an optimization using the current selection. */
	handleOptimizeClick: () => Promise<void>;
	/** Whether all modules in the dialog are selected. */
	allModulesSelected: boolean;
	/** Whether the "Select All" checkbox is in an indeterminate state. */
	isIndeterminate: boolean;
	/** Theme color for the technology icon/avatar. */
	techColor: TechTreeRowProps["techColor"];
	/** Icon filename for the main technology. */
	techImage: string | null;
	/** The unique technology key. */
	tech?: string;
	/** Optional callback triggered when the dialog closes. */
	onClose?: () => void;
}

/**
 * A dialog component that allows users to pick which specific modules to include in an optimization run.
 *
 * @remarks
 * It features categorical groupings, individual module checkboxes, resolution-aware
 * icons, and a "Select All" convenience toggle. It uses `useModuleSelectionDialog`
 * to manage the complex state of multi-select and property mapping.
 *
 * @param {ModuleSelectionDialogProps} props - Component properties.
 * @returns {JSX.Element} The rendered module selection UI.
 * @component
 * @category Components
 * @see {@link useModuleSelectionDialog}
 * @see {@link DialogBody}
 * @see {@link DialogHeader}
 * @see {@link DialogFooter}
 *
 * @example
 * ```tsx
 * <ModuleSelectionDialog {...props} />
 * // renders technology configuration dialog
 * ```
 */
export const ModuleSelectionDialog: React.FC<ModuleSelectionDialogProps> = (props) => {
	const { headerProps, bodyProps, footerProps } = useModuleSelectionDialog(props);
	const { t } = useTranslation();

	return (
		<Dialog.Content size={{ initial: "1", sm: "2" }}>
			<DialogHeader {...headerProps} />

			<Dialog.Description className="sr-only">
				{t(
					"moduleSelection.description",
					"Select modules to include in the optimization calculation."
				)}
			</Dialog.Description>

			<DialogBody {...bodyProps} />

			<DialogFooter {...footerProps} />
		</Dialog.Content>
	);
};
