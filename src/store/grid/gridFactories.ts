import type { Cell, Grid } from "./gridTypes";
import type { Module } from "@/types/tech";

/**
 * Factory function to create a default, empty grid cell.
 *
 * Initialized with default values for adjacency, image, and module.
 *
 * @param {boolean} [supercharged=false] - Initial supercharged state.
 * @param {boolean} [active=false] - Initial active state.
 *
 * @returns {Cell} A new `Cell` object with default values.
 *
 * @see {@link Cell}
 *
 * @category Factories
 *
 * @example
 * const newCell = createEmptyCell(true, true);
 * // returns { active: true, supercharged: true, ... }
 */
export const createEmptyCell = (supercharged = false, active = false): Cell => ({
	active,
	adjacency: "none",
	adjacency_bonus: 0.0,
	bonus: 0.0,
	group_adjacent: false,
	image: null,
	label: "",
	module: null,
	sc_eligible: false,
	supercharged: supercharged,
	tech: null,
	total: 0.0,
	type: "",
	value: 0,
});

/**
 * Factory function to create a blank grid of specified dimensions.
 *
 * Initializes a `Grid` object with a 2D array of empty cells.
 *
 * @param {number} width - Number of columns.
 * @param {number} height - Number of rows.
 *
 * @returns {Grid} A new `Grid` object populated with empty cells.
 *
 * @see {@link Grid}
 * @see {@link createEmptyCell}
 *
 * @category Factories
 *
 * @example
 * const grid = createGrid(10, 6);
 * // returns { width: 10, height: 6, cells: [...] }
 */
export const createGrid = (width: number, height: number): Grid => ({
	cells: Array.from({ length: height }, () =>
		Array.from({ length: width }, () => createEmptyCell())
	),
	height,
	width,
});

/**
 * Maps raw module data to the `Cell` structure used by the grid.
 *
 * @param {Module} moduleData - The raw module metadata.
 *
 * @returns {Cell} A populated `Cell` object.
 *
 * @example
 * ```typescript
 * const cell = createCellFromModuleData(rawModule);
 * ```
 */
export const createCellFromModuleData = (moduleData: Module): Cell => {
	return {
		active: moduleData?.active ?? true,
		adjacency: moduleData?.adjacency ?? "none",
		adjacency_bonus:
			moduleData?.adjacency_bonus !== undefined ? moduleData.adjacency_bonus : 0.0,
		bonus: moduleData?.bonus !== undefined ? moduleData.bonus : 0.0,
		group_adjacent: false,
		image: moduleData?.image ?? null,
		label: moduleData?.label ?? "",
		module: moduleData?.id ?? null,
		sc_eligible: moduleData?.sc_eligible ?? false,
		supercharged: moduleData?.supercharged ?? false,
		tech: moduleData?.tech ?? null,
		total: 0.0,
		type: moduleData?.type ?? "",
		value: moduleData?.value !== undefined ? moduleData.value : 0,
	};
};

/**
 * Resets a cell's module-specific content while preserving its structural state.
 *
 * Structural state includes whether the cell is `active` and whether it is `supercharged`.
 *
 * @param {Cell} cell - The cell object to modify in-place. **Will be mutated.**
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link Cell}
 * @see {@link createEmptyCell}
 *
 * @category Utilities
 *
 * @example
 * resetCellContent(grid.cells[0][0]);
 */
export const resetCellContent = (cell: Cell) => {
	const { active, supercharged } = cell;
	const emptyCell = createEmptyCell(supercharged, active);
	Object.assign(cell, emptyCell);
};
