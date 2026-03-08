import { useGridStore } from "../../store/GridStore";

/** Number of rows from the bottom of the grid where the deactivate button is allowed to appear. */
const LAST_N_ROWS_THRESHOLD = 3;

/**
 * Custom hook for deriving the control state of a specific grid row.
 *
 * It uses specialized selectors from `GridStore` to determine if a row is the
 * "frontier" for expansion (first inactive row) or the "frontier" for
 * contraction (last active row within the threshold). This encapsulates the
 * positioning logic for row activation/deactivation buttons.
 *
 * @param {number} rowIndex - The zero-based index of the row. **Must be within grid bounds.**
 * @returns {object} Derived boolean flags: `isFirstInactiveRow` and `isLastActiveRow`.
 *
 * @example
 * const { isFirstInactiveRow } = useGridRowState(5);
 */
export const useGridRowState = (rowIndex: number) => {
	const firstInactiveRowIndex = useGridStore((state) => state.selectFirstInactiveRowIndex());
	const lastActiveRowIndex = useGridStore((state) => state.selectLastActiveRowIndex());
	const row = useGridStore((state) => state.grid.cells[rowIndex]);
	const totalRows = useGridStore((state) => state.grid.cells.length);

	const isFirstInactiveRow = row
		? row.every((cell) => !cell.active) && rowIndex === firstInactiveRowIndex
		: false;

	const isLastActiveRow = row
		? row.some((cell) => cell.active) &&
			rowIndex === lastActiveRowIndex &&
			rowIndex >= totalRows - LAST_N_ROWS_THRESHOLD
		: false;

	return {
		isFirstInactiveRow,
		isLastActiveRow,
	};
};
