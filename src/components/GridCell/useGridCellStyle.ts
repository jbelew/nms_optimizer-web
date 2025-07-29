import type { Cell } from "../../store/GridStore";
import { useMemo } from "react";

import emptyAccent1x from "../../assets/img/empty-accent.webp";
import emptyAccent2x from "../../assets/img/empty-accent@2x.webp";
import emptySupercharged1x from "../../assets/img/empty-supercharged.webp";
import emptySupercharged2x from "../../assets/img/empty-supercharged@2x.webp";
import { useTechStore } from "../../store/TechStore";

export const useGridCellStyle = (cell: Cell, isTouching: boolean) => {
	const currentTechColorFromStore = useTechStore((state) => state.getTechColor(cell.tech ?? ""));

	const techColor = useMemo(() => {
		return !currentTechColorFromStore && cell.supercharged ? "purple" : currentTechColorFromStore;
	}, [currentTechColorFromStore, cell.supercharged]);

	const cellClassName = useMemo(() => {
		const classes = [
			"gridCell",
			"gridCell--interactive",
			"sm:border-2 border-1",
			"shadow-sm",
			"sm:shadow-md",
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

	const backgroundImageStyle = useMemo(() => {
		if (!cell.module && cell.active && !cell.supercharged) {
			return `image-set(url(${emptyAccent1x}) 1x, url(${emptyAccent2x}) 2x)`;
		}
		if (!cell.module && cell.supercharged) {
			return `image-set(url(${emptySupercharged1x}) 1x, url(${emptySupercharged2x}) 2x)`;
		}
		if (cell.image) {
			return `image-set(url(/assets/img/grid/${
				cell.image
			}) 1x, url(/assets/img/grid/${cell.image.replace(/\.webp$/, "@2x.webp")}) 2x)`;
		}
		return "none";
	}, [cell.module, cell.active, cell.image, cell.supercharged]);

	const cellElementStyle = useMemo(
		() => ({
			backgroundImage: backgroundImageStyle,
		}),
		[backgroundImageStyle]
	);

	return { techColor, cellClassName, cellElementStyle };
};
