import { useShallow } from "zustand/react/shallow";

import { Cell, useGridStore } from "../../store/GridStore";

/**
 * Custom hook to retrieve a specific cell from the grid store.
 *
 * Uses `useShallow` to ensure that components only re-render if the cell's
 * properties actually change, rather than on every grid state update.
 *
 * @param {number} rowIndex - The zero-based index of the row. **Must be within grid bounds.**
 * @param {number} columnIndex - The zero-based index of the column. **Must be within grid bounds.**
 * @returns {Cell} The cell object at the specified coordinates.
 *
 * @see {@link useGridStore} for the source of grid data.
 * @see {@link Cell} for the cell data structure.
 * @see [GridStore Source](../../store/GridStore.ts)
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const cell = useCell(0, 5);
 * // Returns the cell at row 0, column 5 with shallow equality checking.
 * ```
 */
export const useCell = (rowIndex: number, columnIndex: number): Cell => {
	return useGridStore(useShallow((state) => state.grid.cells[rowIndex][columnIndex]));
};
