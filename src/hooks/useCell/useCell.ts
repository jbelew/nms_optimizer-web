/**
 * @file useCell hook
 * @description Custom hook to retrieve a specific cell from the grid store with shallow equality optimization.
 */

import { useShallow } from "zustand/react/shallow";

import { Cell, useGridStore } from "../../store/GridStore";

/**
 * Retrieves a specific cell from the grid based on row and column indices.
 * Uses shallow equality to prevent unnecessary re-renders.
 *
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} columnIndex - The column index of the cell.
 * @returns {Cell} The cell object at the specified indices.
 */
export const useCell = (rowIndex: number, columnIndex: number): Cell => {
	return useGridStore(useShallow((state) => state.grid.cells[rowIndex][columnIndex]));
};
