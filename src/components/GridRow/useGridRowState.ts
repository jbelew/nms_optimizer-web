import { useGridStore } from "../../store/GridStore";

/**
 * Hook that derives the state of a grid row, determining if it's the first inactive
 * row or the last active row. This encapsulates the logic for calculating row states
 * so child components can call this hook directly without prop forwarding.
 *
 * Using the colocated hook pattern: components that need this state call the hook
 * directly with the rowIndex, rather than receiving calculated values via props.
 *
 * @param {number} rowIndex - The index of the row to derive state for.
 * @returns {object} Object containing derived state:
 *   - isFirstInactiveRow: true if this is the first row with no active cells
 *   - isLastActiveRow: true if this is the last row with at least one active cell
 */
export const useGridRowState = (rowIndex: number) => {
	const firstInactiveRowIndex = useGridStore((state) => state.selectFirstInactiveRowIndex());
	const lastActiveRowIndex = useGridStore((state) => state.selectLastActiveRowIndex());
	const row = useGridStore((state) => state.grid.cells[rowIndex]);

	const isFirstInactiveRow = row
		? row.every((cell) => !cell.active) && rowIndex === firstInactiveRowIndex
		: false;
	const isLastActiveRow = row
		? row.some((cell) => cell.active) &&
			rowIndex === lastActiveRowIndex &&
			rowIndex >= useGridStore.getState().grid.cells.length - 3
		: false;

	return {
		isFirstInactiveRow,
		isLastActiveRow,
	};
};
