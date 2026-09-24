import { create } from "zustand";

/**
 * Computes the unique DOM ID for a cell given its matrix coordinates.
 *
 * @param {number} row - The 0-based row index.
 * @param {number} col - The 0-based column index.
 *
 * @returns {string} The element ID string.
 *
 * @category Utilities
 */
export const getGridCellElementId = (row: number, col: number): string => `grid-cell-${row}-${col}`;

/**
 * State and actions for managing keyboard focus in the grid via roving tabindex.
 */
export interface GridFocusState {
	/** Currently focused column index (0-based). */
	focusedCol: number;
	/** Currently focused row index (0-based). */
	focusedRow: number;
	/**
	 * Navigates focus to an adjacent or boundary cell using arrow or home/end keys.
	 *
	 * @param {string} key - The keyboard event key.
	 * @param {number} currentRow - Current 0-based row index.
	 * @param {number} currentCol - Current 0-based column index.
	 * @param {number} width - Total grid columns.
	 * @param {number} height - Total grid rows.
	 * @param {boolean} isCtrlOrMeta - Whether Ctrl or Meta modifier is pressed.
	 *
	 * @returns {boolean} True if the key was handled as a navigation key.
	 */
	navigateGrid: (
		key: string,
		currentRow: number,
		currentCol: number,
		width: number,
		height: number,
		isCtrlOrMeta: boolean
	) => boolean;
	/** Resets focused coordinates back to (0, 0). */
	resetFocus: () => void;
	/**
	 * Sets the currently focused cell coordinates.
	 *
	 * @param {number} row - The 0-based row index.
	 * @param {number} col - The 0-based column index.
	 */
	setFocusedCell: (row: number, col: number) => void;
}

/**
 * Ephemeral store for tracking active roving tabindex cell coordinates.
 *
 * @remarks
 * Used by the technology grid cell components and interaction handlers to maintain exactly one
 * focusable `tabIndex="0"` cell across the 10x6 matrix, implementing WAI-ARIA grid pattern
 * without unnecessary re-renders.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<GridFocusState>>} The focus store hook.
 *
 * @see {@link GridFocusState}
 * @see {@link ./useGridFocusStore.test.ts Unit Tests}
 *
 * @category State
 *
 * @example
 * ```tsx
 * const isFocused = useGridFocusStore((s) => s.focusedRow === 0 && s.focusedCol === 0);
 * ```
 */
export const useGridFocusStore = create<GridFocusState>()((set) => ({
	focusedCol: 0,
	focusedRow: 0,
	navigateGrid: (key, currentRow, currentCol, width, height, isCtrlOrMeta) => {
		let targetRow = currentRow;
		let targetCol = currentCol;
		let shouldNavigate = false;

		switch (key) {
			case "ArrowDown":
				targetRow = Math.min(height - 1, currentRow + 1);
				shouldNavigate = true;
				break;
			case "ArrowLeft":
				targetCol = Math.max(0, currentCol - 1);
				shouldNavigate = true;
				break;
			case "ArrowRight":
				targetCol = Math.min(width - 1, currentCol + 1);
				shouldNavigate = true;
				break;
			case "ArrowUp":
				targetRow = Math.max(0, currentRow - 1);
				shouldNavigate = true;
				break;
			case "End":
				if (isCtrlOrMeta) {
					targetRow = height - 1;
					targetCol = width - 1;
				} else {
					targetCol = width - 1;
				}

				shouldNavigate = true;
				break;
			case "Home":
				if (isCtrlOrMeta) {
					targetRow = 0;
					targetCol = 0;
				} else {
					targetCol = 0;
				}

				shouldNavigate = true;
				break;
			default:
				break;
		}

		if (shouldNavigate) {
			set({ focusedCol: targetCol, focusedRow: targetRow });
			const element = document.getElementById(getGridCellElementId(targetRow, targetCol));
			element?.focus();
		}

		return shouldNavigate;
	},
	resetFocus: () => set({ focusedCol: 0, focusedRow: 0 }),
	setFocusedCell: (row: number, col: number) => set({ focusedCol: col, focusedRow: row }),
}));
