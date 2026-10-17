/**
 * Shared component property types for NMS Optimizer.
 *
 * @category Types
 */

import type { TechColor } from "./tech";

/**
 * A dictionary of module lists, keyed by their Module Group category (e.g., `'upgrade'`, `'bonus'`).
 */
export interface GroupedModules {
	[key: string]: SelectionModule[];
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
	/** Optional Module Group classification (e.g., `'upgrade'`). */
	type?: string;
}

/**
 * Properties for the `TechTreeRow` component and its sub-components.
 */
export interface TechTreeRowProps {
	/** Unique identifier for the technology (e.g., 'launch_thrusters'). **Must be a valid key.** */
	tech: string;
	/** The theme color identifier for the technology's avatar and UI accents. */
	techColor: TechColor;
	/** Filename of the icon image to display. `null` if no icon is available. */
	techImage: null | string;
}
