import type { Cell } from "@/store/grid/gridStore";
import { useShallow } from "zustand/react/shallow";

import { useGridStore } from "@/store/grid/gridStore";

/**
 * Custom hook to retrieve a specific cell from the grid store.
 *
 * @remarks
 * Uses `useShallow` to ensure that components only re-render if the cell's
 * properties actually change, rather than on every grid state update. This is
 * critical for performance in the 10x6 grid where state updates can be frequent.
 *
 * @param {number} rowIndex - The zero-based index of the row. **Must be within grid bounds.**
 * @param {number} columnIndex - The zero-based index of the column. **Must be within grid bounds.**
 *
 * @returns {Cell} The cell object at the specified coordinates.
 *
 * @see {@link useGridStore} for the source of grid data.
 * @see {@link Cell} for the cell data structure.
 * @see {@link ../../components/GridCell/GridCell.test.tsx Unit Tests (via GridCell)}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const cell = useCell(0, 5);
 * // returns { active: true, tech: "warp", ... }
 * ```
 */
export const useCell = (rowIndex: number, columnIndex: number): Cell => {
	return useGridStore(useShallow((state) => state.grid.cells[rowIndex][columnIndex]));
};
