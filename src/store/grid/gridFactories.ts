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
 * ```ts
 * const newCell = createEmptyCell(true, true);
 * // returns { active: true, supercharged: true, ... }
 * ```
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
 * ```ts
 * const grid = createGrid(10, 6);
 * // returns { width: 10, height: 6, cells: [...] }
 * ```
 */
export const createGrid = (width: number, height: number): Grid => ({
	cells: Array.from({ length: height }, () =>
		Array.from({ length: width }, () => createEmptyCell())
	),
	height,
	width,
});

/**
 * Populates a grid cell's module-specific properties in-place from raw module metadata.
 *
 * @remarks
 * Centralizes module-to-cell property mapping across Shared Grid deserialization,
 * Recommended Builds, and direct module placement so all hydrated cells share identical
 * field defaults (including `type`, `adjacency`, `bonus`, `sc_eligible`, and `value`).
 * Structural properties (`active`, `supercharged`, `tech`, `adjacency_bonus`) are preserved
 * unless explicitly overwritten by the caller.
 *
 * @param {Cell} cell - The target cell to hydrate in-place.
 * @param {Partial<Module> & { id?: null | string }} moduleData - The module metadata to apply.
 *
 * @returns {Cell} The mutated `Cell` instance.
 *
 * @see {@link Cell}
 * @see {@link createCellFromModuleData}
 *
 * @category Factories
 *
 * @example Hydrating a cell with module metadata
 * ```ts
 * const cell = createEmptyCell(false, true);
 * assignModuleToCell(cell, { id: "S1", label: "S-Class", bonus: 10, type: "upgrade" });
 * // returns mutated cell with module: "S1", type: "upgrade", bonus: 10
 * ```
 */
export const assignModuleToCell = (
	cell: Cell,
	moduleData: Partial<Module> & { id?: null | string }
): Cell => {
	cell.adjacency = moduleData.adjacency ?? "none";
	cell.bonus = moduleData.bonus !== undefined ? moduleData.bonus : 0.0;
	cell.image = moduleData.image || null;
	cell.label = moduleData.label ?? "";
	cell.module = moduleData.id || null;
	cell.sc_eligible = moduleData.sc_eligible ?? false;
	cell.type = moduleData.type ?? "";
	cell.value = moduleData.value !== undefined ? moduleData.value : 0;

	return cell;
};

/**
 * Maps raw module data to the `Cell` structure used by the grid.
 *
 * @param {Module} moduleData - The raw module metadata.
 *
 * @returns {Cell} A populated `Cell` object.
 *
 * @see {@link assignModuleToCell}
 *
 * @category Factories
 *
 * @example
 * ```typescript
 * const cell = createCellFromModuleData(rawModule);
 * // returns populated Cell object
 * ```
 */
export const createCellFromModuleData = (moduleData: Module): Cell => {
	const cell = createEmptyCell(moduleData?.supercharged ?? false, moduleData?.active ?? true);

	if (moduleData) {
		assignModuleToCell(cell, moduleData);
		cell.adjacency_bonus =
			moduleData.adjacency_bonus !== undefined ? moduleData.adjacency_bonus : 0.0;
		cell.tech = moduleData.tech || null;
	}

	return cell;
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
 * ```ts
 * resetCellContent(grid.cells[0][0]);
 * // resets module fields while keeping active and supercharged flags intact
 * ```
 */
export const resetCellContent = (cell: Cell) => {
	const { active, supercharged } = cell;
	const emptyCell = createEmptyCell(supercharged, active);
	Object.assign(cell, emptyCell);
};
