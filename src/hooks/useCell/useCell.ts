import { useGridStore, Cell } from "../../store/GridStore";
import { useShallow } from "zustand/react/shallow";

export const useCell = (rowIndex: number, columnIndex: number): Cell => {
	return useGridStore(useShallow((state) => state.grid.cells[rowIndex][columnIndex]));
};
