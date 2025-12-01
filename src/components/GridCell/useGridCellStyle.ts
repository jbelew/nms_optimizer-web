import type { Cell } from "../../store/GridStore";
import { useMemo } from "react";

import { useTechStore } from "../../store/TechStore";

/**
 * Custom hook for determining the styling of a grid cell.
 * Calculates `techColor`, `cellClassName`, and `cellElementStyle` based on cell properties.
 *
 * @param {Cell} cell - The grid cell object.
 * @param {boolean} isTouching - Indicates if the cell is currently being touched (for touch devices).
 * @returns {{ techColor: string | undefined; cellClassName: string; cellElementStyle: React.CSSProperties; emptyIconFillColor: string; showEmptyIcon: boolean; }} Styling properties for the grid cell.
 */
export const useGridCellStyle = (cell: Cell, isTouching: boolean) => {
	const currentTechColorFromStore = useTechStore((state) => state.getTechColor(cell.tech ?? ""));
	const emptyIconFillColor = cell.supercharged ? "var(--purple-a6)" : "var(--accent-a6)";

	const techColor = useMemo(() => {
		return !currentTechColorFromStore && cell.supercharged
			? "purple"
			: currentTechColorFromStore;
	}, [currentTechColorFromStore, cell.supercharged]);

	const cellClassName = useMemo(() => {
		const classes = [
			"gridCell",
			"gridCell--interactive",
			"sm:border-2 border-1",
			"shadow-md",
			"relative",
		];
		if (!cell.module && cell.active) classes.push("gridCell--empty");
		if (cell.supercharged) classes.push("gridCell--supercharged");
		classes.push(cell.active ? "gridCell--active" : "gridCell--inactive");
		if (isTouching) classes.push("gridCell--touched");
		if (cell.adjacency_bonus === 0 && cell.image) classes.push("gridCell--black");
		if (cell.supercharged && cell.image) classes.push("gridCell--glow");
		if (cell.label) classes.push("flex", "items-center", "justify-center", "w-full", "h-full");
		return classes.join(" ");
	}, [
		cell.supercharged,
		cell.active,
		cell.adjacency_bonus,
		cell.image,
		cell.label,
		cell.module,
		isTouching,
	]);

	const cellElementStyle: React.CSSProperties = {};

	const showEmptyIcon = !cell.module && cell.active;

	return { techColor, cellClassName, cellElementStyle, emptyIconFillColor, showEmptyIcon };
};
