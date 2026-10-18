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
 * Validates whether a cell's active state can be toggled under Slot Restriction rules.
 *
 * @remarks
 * Rejects toggling when a module is currently placed in the cell (`"moduleLocked"`) or when
 * the platform locks the entire grid layout (`"gridFixed"`).
 *
 * @param params - Input parameters.
 * @param params.cell - The target grid cell.
 * @param params.gridFixed - Whether the entire grid layout is locked.
 *
 * @returns Discriminated union indicating validity or the violated Slot Restriction reason.
 *
 * @see {@link ValidationResult}
 * @see {@link ./gridRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example
 * ```ts
 * const res = validateToggleActive({ cell: emptyCell, gridFixed: false });
 * // returns { valid: true }
 * ```
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
 * Validates whether a cell's supercharged status can be toggled under Slot Restriction rules.
 *
 * @remarks
 * Enforces occupied module locks (`"moduleLocked"`), locked grid layouts (`"gridFixed"`),
 * fixed supercharged layouts (`"superchargedFixed"`), top-4 row limits (`"rowLimit"`),
 * and the maximum of 4 supercharged slots (`"superchargedLimit"`).
 *
 * @param params - Input parameters.
 * @param params.cell - The target grid cell.
 * @param params.rowIndex - Zero-based row index of the cell.
 * @param params.gridFixed - Whether the entire grid layout is locked.
 * @param params.superchargedFixed - Whether the supercharged slots are locked.
 * @param params.totalSupercharged - Current total number of supercharged cells in the grid.
 *
 * @returns Discriminated union indicating validity or the violated Slot Restriction reason.
 *
 * @see {@link ValidationResult}
 * @see {@link ./gridRules.test.ts Unit Tests}
 *
 * @category Rules
 *
 * @example
 * ```ts
 * const res = validateToggleSupercharged({
 *   cell: emptyCell,
 *   gridFixed: false,
 *   rowIndex: 0,
 *   superchargedFixed: false,
 *   totalSupercharged: 2,
 * });
 * // returns { valid: true }
 * ```
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
 * @param params - Precomputed row indices and grid dimensions.
 * @param params.firstInactiveRowIndex - Index of the first row where every cell is inactive, or `-1`.
 * @param params.lastActiveRowIndex - Index of the last row containing at least one active cell, or `-1`.
 * @param params.rowIndex - Zero-based index of the candidate row.
 * @param params.totalRows - Total number of rows in the grid (`grid.cells.length`).
 *
 * @returns Flags indicating whether the activate and deactivate controls should be shown for the row.
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
