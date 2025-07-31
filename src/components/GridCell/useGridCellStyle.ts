import type { Cell } from "../../store/GridStore";
import { useMemo } from "react";

import { useTechStore } from "../../store/TechStore";

const emptySvgTemplate = (fillColor: string) =>
	`data:image/svg+xml;utf8,${encodeURIComponent(`<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="256.000000pt" height="256.000000pt" viewBox="0 0 256.000000 256.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.16, written by Peter Selinger 2001-2019
</metadata>
<g transform="translate(0.000000,256.000000) scale(0.100000,-0.100000)"
fill="${fillColor}" stroke="none">
<path d="M422 1114 c-29 -13 -33 -19 -28 -39 8 -32 -15 -88 -45 -109 -13 -9
-41 -16 -62 -16 -33 0 -40 -4 -52 -32 -12 -31 -11 -34 16 -66 38 -43 40 -98 4
-140 -29 -35 -30 -43 -10 -82 12 -24 22 -30 48 -30 18 0 43 -7 56 -16 27 -20
53 -76 45 -99 -5 -11 6 -21 41 -36 l46 -20 25 24 c42 42 101 41 149 -3 19 -17
23 -17 58 -3 31 13 37 20 37 45 0 61 44 107 101 108 31 0 38 5 53 36 16 35 16
37 -3 58 -47 50 -47 127 1 161 20 13 20 18 9 55 -11 38 -14 40 -52 40 -33 0
-47 6 -76 35 -28 28 -34 41 -32 67 4 43 -4 54 -45 68 -31 10 -36 9 -64 -20
-43 -42 -101 -42 -144 0 -33 34 -31 34 -76 14z m227 -213 c44 -31 63 -65 63
-115 0 -58 -26 -103 -72 -127 -122 -66 -254 61 -194 187 19 41 33 52 81 70 44
15 87 10 122 -15z"/>
<path d="M910 597 c0 -27 -36 -48 -76 -45 -38 3 -39 2 -37 -27 3 -50 -6 -75
-32 -87 -34 -15 -31 -42 6 -69 27 -19 30 -26 26 -55 -7 -42 16 -64 59 -57 25
4 35 0 51 -21 26 -33 56 -33 77 -1 13 19 25 25 54 25 48 0 62 14 55 55 -4 26
0 36 21 52 33 26 34 65 4 78 -19 8 -23 18 -23 52 0 51 -23 80 -51 65 -24 -12
-59 1 -74 27 -12 24 -60 29 -60 8z m84 -128 c52 -41 18 -139 -48 -139 -39 0
-79 41 -79 80 0 24 7 40 27 57 34 28 65 29 100 2z"/>
</g>
</svg>`)}`;

export const useGridCellStyle = (cell: Cell, isTouching: boolean) => {
	const currentTechColorFromStore = useTechStore((state) => state.getTechColor(cell.tech ?? ""));
	const fillColor = cell.supercharged ? "#C150FF2D" : "#00BEFD28";

	const emptySvg = useMemo(() => emptySvgTemplate(fillColor), [fillColor]);

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
		if (!cell.module && cell.active) {
			return `url('${emptySvg}')`;
		}
		if (cell.image) {
			return `image-set(url(/assets/img/grid/${
				cell.image
			}) 1x, url(/assets/img/grid/${cell.image.replace(/\.webp$/, "@2x.webp")}) 2x)`;
		}
		return "none";
	}, [cell.module, cell.active, cell.image, emptySvg]);

	const cellElementStyle = useMemo(
		() => ({
			backgroundImage: backgroundImageStyle,
			...(!cell.module &&
				cell.active && {
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
				}),
		}),
		[backgroundImageStyle, cell.module, cell.active]
	);

	return { techColor, cellClassName, cellElementStyle };
};
