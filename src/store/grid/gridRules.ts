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
