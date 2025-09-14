import { useGridStore, Cell } from '../../store/GridStore';
import { shallow } from 'zustand/shallow';

/**
 * Custom hook for accessing a single cell's state from the grid store.
 * It uses a shallow equality check to prevent unnecessary re-renders.
 *
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} columnIndex - The column index of the cell.
 * @returns {Cell} The state of the specified cell.
 */
export const useCell = (rowIndex: number, columnIndex: number): Cell => {
  return useGridStore(
    (state) => state.grid.cells[rowIndex][columnIndex],
    shallow
  );
};
