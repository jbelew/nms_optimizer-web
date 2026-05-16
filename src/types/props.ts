/**
 * Shared component property types for NMS Optimizer.
 *
 * @category Types
 */

import type { TechColor } from "./tech";

/**
 * A dictionary of module lists, keyed by their grouping category (e.g., 'Procedural Upgrades').
 */
export interface GroupedModules {
	[key: string]: SelectionModule[];
}

/**
 * Props for the `DialogBody` internal component of ModuleSelectionDialog.
 */
export interface ModuleDialogBodyProps {
	/** Organized modules for display. */
	groupedModules: GroupedModules;
	/** Currently selected module IDs. */
	selectedModules: string[];
}

/**
 * Props for the `DialogFooter` internal component of ModuleSelectionDialog.
 */
export interface ModuleDialogFooterProps {
	/** Active selection of module IDs. */
	currentCheckedModules: string[];
	/** Optimization trigger. */
	handleOptimizeClick: () => Promise<void>;
}

/**
 * Properties for the `ModuleSelectionDialog` component.
 */
export interface ModuleSelectionDialogProps {
	/** Whether all modules in the dialog are selected. */
	allModulesSelected: boolean;
	/** Array of IDs for currently selected modules. */
	currentCheckedModules: string[];
	/** Modules organized into categories for display. **Must be provided.** */
	groupedModules: GroupedModules;
	/** Asynchronous callback to trigger an optimization using the current selection. */
	handleOptimizeClick: () => Promise<void>;
	/** Callback for the "Select All" toggle. */
	handleSelectAllChange: (checked: "indeterminate" | boolean) => void;
	/** Callback for individual module selection changes. */
	handleValueChange: (newValues: string[]) => void;
	/** Whether the "Select All" checkbox is in an indeterminate state. */
	isIndeterminate: boolean;
	/** Whether the dialog is currently visible. */
	isOpen: boolean;
	/** Optional callback triggered when the dialog closes. */
	onClose: () => void;
	/** The unique technology key. */
	tech?: string;
	/** Theme color for the technology icon/avatar. */
	techColor: TechColor;
	/** Icon filename for the main technology. */
	techImage: null | string;
	/** Localized name of the technology being configured. */
	translatedTechName: string;
}

/**
 * A module entry for selection in the `ModuleSelectionDialog`.
 */
export interface SelectionModule {
	/** Initial checked status. */
	checked?: boolean;
	/** Unique identifier for the module. */
	id: string;
	/** Icon filename. */
	image: string;
	/** Display name of the module. */
	label: string;
	/** Optional classification (e.g., 'upgrade'). */
	type?: string;
}

/**
 * Properties for the `TechTreeRow` component and its sub-components.
 */
export interface TechTreeRowProps {
	/** Asynchronous callback to trigger an optimization solve for this row. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether all active grid slots are currently occupied. */
	isGridFull: boolean;
	/** Whether any optimization solve is currently running globally. */
	solving: boolean;
	/** Unique identifier for the technology (e.g., 'launch_thrusters'). **Must be a valid key.** */
	tech: string;
	/** The theme color identifier for the technology's avatar and UI accents. */
	techColor: TechColor;
	/** Filename of the icon image to display. `null` if no icon is available. */
	techImage: null | string;
}
