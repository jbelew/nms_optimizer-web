import type { Module } from "@/types/tech";

/**
 * Structure for the optimization engine's successful result.
 *
 * @see {@link Grid}
 *
 * @category State
 */
export type ApiResponse = {
	/** The newly optimized grid layout. `null` if the solve failed. */
	grid: Grid | null;
	/** The theoretical maximum bonus for the configuration. */
	max_bonus: number;
	/** The identifier of the solver method used (e.g., `'SA'`, `'Pattern'`). */
	solve_method: string;
	/** The actual bonus achieved by the solver. */
	solved_bonus: number;
};

/**
 * Represents a single cell within the technology grid.
 *
 * Each cell maintains its own state for active/inactive status, supercharged status,
 * and the specific module currently placed within it.
 *
 * @remarks
 * This type uses a mix of camelCase and snake_case properties intentionally.
 * The snake_case properties (e.g., `adjacency_bonus`, `group_adjacent`) are
 * dictated by the external Python solver API and legacy data structures, while
 * newer/internal properties use camelCase.
 *
 * @category State
 */
export type Cell = {
	/** Whether the cell is part of the active layout. */
	active: boolean;
	/** The type of adjacency bonus the module in this cell provides. */
	adjacency: string;
	/** The calculated bonus multiplier from adjacent technologies. */
	adjacency_bonus: number;
	/** The base bonus value from the module itself. */
	bonus: number;
	/** Whether the cell belongs to an adjacency grouping. */
	group_adjacent: boolean;
	/** Optional icon path/URL for the module. */
	image: null | string;
	/** Display label for the module. */
	label: string;
	/** The unique ID of the module currently placed in this cell. */
	module: null | string;
	/** Whether this cell is allowed to be supercharged. */
	sc_eligible: boolean;
	/** Whether the cell is currently supercharged. */
	supercharged: boolean;
	/** The technology category key (e.g., `'pulse'`). */
	tech: null | string;
	/** The final calculated score/bonus for this specific cell. */
	total: number;
	/** The category/type of the module. */
	type: string;
	/** The raw stat value of the module. */
	value: number;
};

/**
 * Represents the entire technology grid state.
 *
 * The grid is a 2D structure of `Cell` objects, providing a workspace for module placement.
 *
 * @see {@link Cell}
 *
 * @category State
 */
export type Grid = {
	/** 2D array of grid cells. Row-major order. */
	cells: Cell[][];
	/** The number of rows in the grid. */
	height: number;
	/** Whether the grid configuration is valid (e.g. no overlapping modules). */
	valid?: boolean;
	/** The number of columns in the grid. */
	width: number;
};

/**
 * Actions available to modify the grid state.
 *
 * @category Actions
 */
export interface GridActions {
	/** Activates all cells in the specified row. */
	activateRow: (rowIndex: number) => void;
	/** Batch applies modules to the grid by linear index. */
	applyModulesToGrid: (modules: (Module | null)[]) => void;
	/** Deactivates all cells in the specified row. */
	deActivateRow: (rowIndex: number) => void;
	/** Handles a second tap on a cell by toggling its supercharged state. */
	handleCellDoubleTap: (rowIndex: number, columnIndex: number) => void;
	/** Handles a single tap on a grid cell. */
	handleCellTap: (rowIndex: number, columnIndex: number) => void;
	/** Resets the grid to its initial state or a blank grid. */
	resetGrid: () => void;
	/** Removes all modules of a specific technology from the grid. */
	resetGridTech: (tech: string) => void;
	/** Restores the entire grid state from a saved build. */
	restoreGridState: (savedState: Partial<GridState>) => void;
	/** Restores a cell to its previous state, typically after an invalid tap. */
	revertCellTap: (rowIndex: number, columnIndex: number, originalState: Cell) => void;
	/** Updates the current build name. */
	setBuildName: (name: null | string) => void;
	/** Sets the active status of a specific cell. */
	setCellActive: (rowIndex: number, columnIndex: number, active: boolean) => void;
	/** Sets the supercharged status of a specific cell. */
	setCellSupercharged: (rowIndex: number, columnIndex: number, supercharged: boolean) => void;
	/** Replaces the entire grid object. */
	setGrid: (grid: Grid) => void;
	/** Toggles the grid layout lock. */
	setGridFixed: (fixed: boolean) => void;
	/** Builds the grid from an initial definition. */
	setGridFromInitialDefinition: (definition: {
		grid: Module[][];
		gridFixed: boolean;
		superchargedFixed: boolean;
	}) => void;
	/** Stores the initial definition for later resets. */
	setInitialGridDefinition: (
		definition: undefined | { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean }
	) => void;
	/** Marks the grid as being from a shared URL. */
	setIsSharedGrid: (isShared: boolean) => void;
	/** Updates the optimization result. */
	setResult: (result: ApiResponse | null) => void;
	/** Toggles the supercharged slot lock. */
	setSuperchargedFixed: (fixed: boolean) => void;
	/** Toggles the active status of a cell. */
	toggleCellActive: (rowIndex: number, columnIndex: number) => void;
	/** Toggles the supercharged status of a cell. */
	toggleCellSupercharged: (rowIndex: number, columnIndex: number) => void;
	/** Manually triggers recomputation of derived state. */
	triggerRecompute: () => void;
}

/**
 * Derived/computed state fields maintained internally for performance.
 *
 * @category State
 */
export interface GridComputed {
	/** Set of technology keys currently placed in at least one grid cell. */
	activeTechs: Set<string>;
	/** Index of the first row where every cell is inactive, or -1. */
	firstInactiveRowIndex: number;
	/** Whether any cell in the grid has a non-null module. */
	hasModulesInGrid: boolean;
	/** Whether every active cell has a module assigned. */
	isGridFull: boolean;
	/** Index of the last row containing at least one active cell, or -1. */
	lastActiveRowIndex: number;
	/** Count of cells where `supercharged === true`. */
	totalSuperchargedCells: number;
}

/**
 * Publicly visible state of the technology grid.
 *
 * @category State
 */
export interface GridState {
	/** The name of the currently loaded build, if any. */
	buildName: null | string;
	/** The current 2D grid of cells. */
	grid: Grid;
	/** Whether the active layout of the grid is locked. */
	gridFixed: boolean;
	/** The default layout definition for the current ship type. */
	initialGridDefinition:
		| undefined
		| { grid: Module[][]; gridFixed: boolean; superchargedFixed: boolean };
	/** Whether the grid was populated from a shared URL. */
	isSharedGrid: boolean;
	/** The most recent optimization result from the server. */
	result: ApiResponse | null;
	/** Whether the locations of supercharged slots are locked. */
	superchargedFixed: boolean;
}

/**
 * Combined type for the grid store.
 */
export type GridStore = GridActions & GridComputed & GridState;
