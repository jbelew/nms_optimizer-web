/**
 * Common UI and technology types for NMS Optimizer.
 *
 * @category Types
 */

/**
 * Represents a specific technology module in No Man's Sky.
 */
export interface Module {
	/** Whether the module is currently active. */
	active: boolean;
	/** Adjacency type identifier (e.g., `'pulse'`, `'photonix'`). Used for bonus calculations. */
	adjacency: string;
	/** Multiplier for adjacency bonuses (e.g., `0.05` for 5%). */
	adjacency_bonus: number;
	/** The base bonus value provided by this module. */
	bonus: number;
	/** Optional flag indicating if the module is selected in the UI. */
	checked?: boolean;
	/** Unique identifier for the module (e.g., `'PULSE_MODULE_1'`). */
	id: string;
	/** Filename or URL for the module's icon. */
	image: string;
	/** Display name of the module. */
	label: string;
	/** Whether this module can be placed in a supercharged slot. */
	sc_eligible: boolean;
	/** Whether the module is currently in a supercharged slot. */
	supercharged: boolean;
	/** The key of the technology category this module belongs to. */
	tech: string;
	/** The specific type classification of the module (e.g., `'normal'`, `'proc'`). */
	type: string;
	/** Numerical value associated with the module's primary stat. */
	value: number;
}

/**
 * Defines a pre-configured layout of technologies and modules.
 */
export interface RecommendedBuild {
	/** 2D array representing the grid layout of modules. */
	layout: (null | {
		active?: boolean;
		adjacency_bonus?: number;
		module?: null | string;
		supercharged?: boolean;
		tech?: null | string;
	})[][];
	/** Display title for the build. */
	title: string;
}

/**
 * Valid theme color identifiers used for technologies and UI accents.
 */
export type TechColor =
	| "amber"
	| "blue"
	| "bronze"
	| "brown"
	| "crimson"
	| "cyan"
	| "gold"
	| "grass"
	| "gray"
	| "green"
	| "indigo"
	| "iris"
	| "jade"
	| "lime"
	| "mint"
	| "orange"
	| "pink"
	| "plum"
	| "purple"
	| "red"
	| "ruby"
	| "sky"
	| "teal"
	| "tomato"
	| "violet"
	| "yellow";

/**
 * Root structure for technology tree data fetched from the API.
 */
export interface TechTree {
	/** Dynamic categories containing lists of technologies. */
	[key: string]: RecommendedBuild[] | TechTreeItem[] | undefined | { grid: Module[][] };
	/** Optional grid layout and constraints defined for the ship type. */
	grid_definition?: { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	/** List of recommended builds for this ship type. */
	recommended_builds?: RecommendedBuild[];
}

/**
 * Represents a technology category within the tech tree.
 */
export interface TechTreeItem {
	/** Theme color assigned to the technology in the UI. */
	color: TechColor;
	/** Optional icon for the technology. */
	image: null | string;
	/** Unique key for the technology (e.g., `'pulse'`). */
	key: string;
	/** Display label for the technology. */
	label: string;
	/** Total number of modules in this category. */
	module_count: number;
	/** List of modules available for this technology. */
	modules: Module[];
	/** Optional type classification (e.g., `'normal'`, `'weapon'`). */
	type?: string;
}
