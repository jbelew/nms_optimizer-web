import type { Cell } from "./gridTypes";

/**
 * Result of a grid validation check.
 */
export type ValidationResult =
	| {
			reason:
				| "gridFixed"
				| "moduleLocked"
				| "rowLimit"
				| "superchargedFixed"
				| "superchargedLimit";
			valid: false;
	  }
	| { valid: true };

/**
 * Validates whether a cell's active state can be toggled.
 *
 * @param {object} params - Input parameters.
 * @param {Cell} params.cell - The cell target.
 * @param {boolean} params.gridFixed - Whether the entire grid layout is locked.
 *
 * @returns {ValidationResult} Result containing validation status and optional reason.
 */
export function validateToggleActive(params: { cell: Cell; gridFixed: boolean }): ValidationResult {
	if (params.cell.module) {
		return { reason: "moduleLocked", valid: false };
	}

	if (params.gridFixed) {
		return { reason: "gridFixed", valid: false };
	}

	return { valid: true };
}

/**
 * Validates whether a cell's supercharged status can be toggled.
 *
 * @param {object} params - Input parameters.
 * @param {Cell} params.cell - The cell target.
 * @param {number} params.rowIndex - The row index of the cell.
 * @param {boolean} params.gridFixed - Whether the entire grid layout is locked.
 * @param {boolean} params.superchargedFixed - Whether the supercharged slots are locked.
 * @param {number} params.totalSupercharged - Current total number of supercharged cells.
 *
 * @returns {ValidationResult} Result containing validation status and optional reason.
 */
export function validateToggleSupercharged(params: {
	cell: Cell;
	gridFixed: boolean;
	rowIndex: number;
	superchargedFixed: boolean;
	totalSupercharged: number;
}): ValidationResult {
	if (params.cell.module) {
		return { reason: "moduleLocked", valid: false };
	}

	if (params.gridFixed) {
		return { reason: "gridFixed", valid: false };
	}

	if (params.superchargedFixed) {
		return { reason: "superchargedFixed", valid: false };
	}

	if (params.rowIndex >= 4) {
		return { reason: "rowLimit", valid: false };
	}

	if (params.totalSupercharged >= 4 && !params.cell.supercharged) {
		return { reason: "superchargedLimit", valid: false };
	}

	return { valid: true };
}

/**
 * Number of bottom rows in the grid that are eligible for row-level deactivation.
 *
 * @category Constants
 */
export const LAST_N_ROWS_THRESHOLD = 3;

/**
 * Computes whether a specific grid row is eligible for row-level activation or deactivation controls.
 *
 * @remarks
 * Operates in $O(1)$ time using the precomputed `firstInactiveRowIndex` and `lastActiveRowIndex`
 * indices from `useGridStore`, avoiding per-row 2D cell scans during render.
 *
 * A row can be activated if:
 * - It is within the grid bounds (`0 <= rowIndex < totalRows`).
 * - At least one cell in the grid is currently active (`0 <= lastActiveRowIndex < totalRows`).
 * - Its index matches `firstInactiveRowIndex`.
 *
 * A row can be deactivated if:
 * - It is within the grid bounds (`0 <= rowIndex < totalRows`).
 * - At least one cell in the grid is currently active (`0 <= lastActiveRowIndex < totalRows`).
 * - Its index matches `lastActiveRowIndex`.
 * - Its index is within the last {@link LAST_N_ROWS_THRESHOLD} rows of the grid (`rowIndex >= totalRows - LAST_N_ROWS_THRESHOLD`).
 *
 * @param {object} params - Precomputed row indices and grid dimensions.
 * @param {number} params.firstInactiveRowIndex - Index of the first row where every cell is inactive, or `-1`.
 * @param {number} params.lastActiveRowIndex - Index of the last row containing at least one active cell, or `-1`.
 * @param {number} params.rowIndex - Zero-based index of the candidate row.
 * @param {number} params.totalRows - Total number of rows in the grid (`grid.cells.length`).
 *
 * @returns {{ canActivateRow: boolean; canDeactivateRow: boolean }} Flags indicating whether the activate and deactivate controls should be shown for the row.
 *
 * @see {@link LAST_N_ROWS_THRESHOLD}
 * @see {@link ./rowActivation.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const { canActivateRow, canDeactivateRow } = getRowControlEligibility({
 *   firstInactiveRowIndex: 4,
 *   lastActiveRowIndex: 3,
 *   rowIndex: 4,
 *   totalRows: 6,
 * });
 * // => { canActivateRow: true, canDeactivateRow: false }
 * ```
 */
export function getRowControlEligibility(params: {
	firstInactiveRowIndex: number;
	lastActiveRowIndex: number;
	rowIndex: number;
	totalRows: number;
}): { canActivateRow: boolean; canDeactivateRow: boolean } {
	const isRowInBounds = params.rowIndex >= 0 && params.rowIndex < params.totalRows;
	const hasAnyActiveCells =
		params.lastActiveRowIndex >= 0 && params.lastActiveRowIndex < params.totalRows;

	if (!isRowInBounds || !hasAnyActiveCells) {
		return { canActivateRow: false, canDeactivateRow: false };
	}

	const canActivateRow = params.rowIndex === params.firstInactiveRowIndex;
	const canDeactivateRow =
		params.rowIndex === params.lastActiveRowIndex &&
		params.rowIndex >= params.totalRows - LAST_N_ROWS_THRESHOLD;

	return { canActivateRow, canDeactivateRow };
}
