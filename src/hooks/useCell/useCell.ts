import { useShallow } from "zustand/react/shallow";

import { Cell, useGridStore } from "../../store/GridStore";

export const useCell = (rowIndex: number, columnIndex: number): Cell => {
	return useGridStore(useShallow((state) => state.grid.cells[rowIndex][columnIndex]));
};
