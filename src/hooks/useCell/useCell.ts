import { Cell, useGridStore } from "../../store/GridStore";

/**
 * Custom hook for accessing a single cell's state from the grid store.
 * It uses a shallow equality check to prevent unnecessary re-renders.
 *
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} columnIndex - The column index of the cell.
 * @returns {Cell} The state of the specified cell.
 */
import { shallow } from "zustand/shallow";

export const useCell = (rowIndex: number, columnIndex: number): Cell => {
	return useGridStore((state) => state.grid.cells[rowIndex][columnIndex], shallow);
};
