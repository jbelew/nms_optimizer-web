import type { Cell } from "@/store/grid/gridStore";

import { useTechStore } from "@/store/tech/techStore";

/**
 * Custom hook for computing the visual presentation of a technology grid cell.
 *
 * @remarks
 * Maps the abstract state of a `Cell` (active, supercharged, occupied, etc.)
 * to concrete CSS classes and inline styles. Handles dynamic color overrides
 * from `TechStore` and theme-based fallback colors for supercharged slots.
 *
 * @param {Cell} cell - The data model for the cell.
 * @param {boolean} isTouching - Whether the cell is currently being pressed on a touch device.
 *
 * @returns {object} Metadata for rendering.
 * @returns {string|undefined} returns.techColor - The hex or name of the accent color.
 * @returns {string} returns.cellClassName - Concatenated list of CSS classes.
 * @returns {React.CSSProperties} returns.cellElementStyle - Inline style overrides.
 * @returns {string} returns.emptyIconFillColor - Fill color for the `EmptyCellIcon`.
 * @returns {boolean} returns.showEmptyIcon - Whether to render the empty cell icon.
 *
 * @see {@link import('@/store/tech/techStore').TechStore}
 * @see {@link Cell}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { cellClassName, techColor } = useGridCellStyle(currentCell, false);
 * ```
 */
export function useGridCellStyle(cell: Cell, isTouching: boolean) {
	const currentTechColorFromStore = useTechStore((state) => state.techColors[cell.tech ?? ""]);

	// Using hex values instead of CSS variables for screenshot compatibility (html-to-image)
	const emptyIconFillColor = cell.supercharged ? "#c150ff2d" : "#00befd28";

	const techColor =
		!currentTechColorFromStore && cell.supercharged ? "purple" : currentTechColorFromStore;

	const classes = [
		"gridCell",
		"gridCell--interactive",
		"sm:border-2 border-1",
		"shadow-sm",
		"relative",
	];
	if (!cell.module && cell.active) classes.push("gridCell--empty");
	if (cell.supercharged) classes.push("gridCell--supercharged");
	classes.push(cell.active ? "gridCell--active" : "gridCell--inactive");
	if (isTouching) classes.push("gridCell--touched");
	if (cell.adjacency_bonus === 0 && !cell.group_adjacent && cell.image)
		classes.push("gridCell--black");
	if (cell.supercharged && cell.image) classes.push("gridCell--glow");
	if (cell.label) classes.push("flex", "items-center", "justify-center", "w-full", "h-full");

	const cellClassName = classes.join(" ");

	const cellElementStyle: React.CSSProperties = {};

	const showEmptyIcon = !cell.module && cell.active;

	return { cellClassName, cellElementStyle, emptyIconFillColor, showEmptyIcon, techColor };
}
