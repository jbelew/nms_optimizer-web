import type { Cell } from "../../store/GridStore";

import { useTechStore } from "../../store/TechStore";

/**
 * Custom hook for computing the visual presentation of a technology grid cell.
 *
 * It maps the abstract state of a `Cell` (active, supercharged, occupied, etc.)
 * to concrete CSS classes and inline styles. It also handles thematic color
 * overrides for supercharged slots and empty states.
 *
 * @param {Cell} cell - The data model for the cell. **Must be valid.**
 * @param {boolean} isTouching - Whether the cell is currently being pressed on a touch device.
 * @returns {object} Metadata for rendering, including `cellClassName`, `techColor`, and icon status.
 *
 * @example
 * const styles = useGridCellStyle(currentCell, false);
 */
export const useGridCellStyle = (cell: Cell, isTouching: boolean) => {
	const currentTechColorFromStore = useTechStore((state) => state.getTechColor(cell.tech ?? ""));

	const emptyIconFillColor = cell.supercharged ? "var(--purple-a4)" : "var(--accent-a4)";

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

	return { techColor, cellClassName, cellElementStyle, emptyIconFillColor, showEmptyIcon };
};
