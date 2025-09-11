import { useGridStore, Cell } from '../../store/GridStore';
import { shallow } from 'zustand/shallow';

export const useCell = (rowIndex: number, columnIndex: number): Cell => {
  return useGridStore(
    (state) => state.grid.cells[rowIndex][columnIndex],
    shallow
  );
};
