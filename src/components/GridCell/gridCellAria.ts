import type { Cell } from "@/store/grid/gridStore";

/**
 * Removes bracketed and parenthetical metadata from a technology label.
 *
 * @param {string | undefined} label - The raw technology label.
 *
 * @returns {string} The cleaned label.
 *
 * @category Utilities
 */
export const stripLabel = (label: string | undefined): string => {
	if (!label) return "";

	return label.replace(/\[[^\]]+\]|\([^)]+\)/g, "").trim();
};

/**
 * Translation function signature compatible with i18next `t`.
 */
export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * Generates an accessible, descriptive ARIA label for a grid cell.
 *
 * @remarks
 * Produces comprehensive announcements for screen readers including 1-based row and column
 * coordinates, active or disabled status, slotted module name (stripped of metadata brackets),
 * and supercharged status.
 *
 * @param {Cell} cell - The cell data model.
 * @param {number} rowIndex - 0-based row index.
 * @param {number} columnIndex - 0-based column index.
 * @param {TranslateFn} t - The i18next translation function.
 *
 * @returns {string} The formatted accessible label for the cell.
 *
 * @see {@link Cell}
 * @see {@link ./gridCellAria.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const label = getGridCellAriaLabel(cell, 0, 0, t);
 * // returns "Row 1, Column 1: Deflector Shield (Supercharged)"
 * ```
 */
export const getGridCellAriaLabel = (
	cell: Cell,
	rowIndex: number,
	columnIndex: number,
	t: TranslateFn
): string => {
	const row = rowIndex + 1;
	const col = columnIndex + 1;

	let content: string;

	if (!cell.active) {
		content = cell.supercharged
			? t("gridTable.disabledSuperchargedSlot", {
					defaultValue: "Disabled Slot (Supercharged)",
				})
			: t("gridTable.disabledSlot", { defaultValue: "Disabled Slot" });
	} else if (cell.module) {
		const rawLabel = stripLabel(cell.label);
		const cleanedLabel = rawLabel || cell.module;
		content = cell.supercharged
			? t("gridTable.superchargedWithContent", {
					content: cleanedLabel,
					defaultValue: `${cleanedLabel} (Supercharged)`,
				})
			: cleanedLabel;
	} else {
		content = cell.supercharged
			? t("gridTable.superchargedSlot", {
					defaultValue: "Empty Slot (Supercharged)",
				})
			: t("gridTable.emptySlot", { defaultValue: "Empty Slot" });
	}

	return t("gridTable.cellAriaLabel", {
		col,
		content,
		defaultValue: `Row ${row}, Column ${col}: ${content}`,
		row,
	});
};
