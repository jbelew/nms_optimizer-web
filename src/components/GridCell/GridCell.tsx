import "./GridCell.scss";

import type { Cell } from "@/store/grid/gridStore";
import React from "react";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import EmptyCellIcon from "@/components/Icons/EmptyCellIcon";
import { useCell } from "@/hooks/useCell/useCell";

import { useGridCellInteraction } from "./useGridCellInteraction";
import { useGridCellStyle } from "./useGridCellStyle";

/**
 * Determines the upgrade priority identifier based on a technology's label.
 */
const getUpgradePriority = (label: string | undefined): string => {
	if (!label) return "";

	const lowerLabel = label.toLowerCase();

	let tier = "";
	if (lowerLabel.includes("theta")) tier = "1";
	else if (lowerLabel.includes("tau")) tier = "2";
	else if (lowerLabel.includes("sigma")) tier = "3";

	if (!tier) return "";

	if (lowerLabel.includes("salvaged")) return `S${tier}`;
	if (lowerLabel.includes("forbidden")) return `F${tier}`;
	if (lowerLabel.includes("reactor")) return `R${tier}`;

	const isBooster =
		lowerLabel.includes("booster") ||
		lowerLabel.includes("habitation") ||
		lowerLabel.includes("array") ||
		lowerLabel.includes("arcadia") ||
		lowerLabel.includes("ion barrier") ||
		lowerLabel.includes("deflector shield") ||
		lowerLabel.includes("mag-field") ||
		lowerLabel.includes("thunderbird") ||
		lowerLabel.includes("torpedo") ||
		lowerLabel.includes("landing") ||
		lowerLabel.includes("platform") ||
		lowerLabel.includes("defense cannon") ||
		lowerLabel.includes("deadeye");

	if (isBooster) return `C${tier}`;
	if (lowerLabel.includes("upgrade")) return tier;

	return "";
};

/**
 * Removes bracketed and parenthetical metadata from a technology label.
 */
const stripLabel = (label: string | undefined): string => {
	if (!label) return "";

	return label.replace(/\[[^\]]+\]|\([^)]+\)/g, "").trim();
};

/**
 * Static elements for the cell's corner highlights.
 */
const CORNER_SPANS = (
	<>
		<span className="corner top-left"></span>
		<span className="corner top-right"></span>
		<span className="corner bottom-left"></span>
		<span className="corner bottom-right"></span>
	</>
);

/**
 * Properties for the {@link GridCell} component.
 */
interface GridCellProps {
	columnIndex: number;
	isSharedGrid: boolean;
	rowIndex: number;
}

/**
 * Sub-component for rendering a technology module within a grid cell.
 */
const ModuleContent: React.FC<{ cell: Cell; rowIndex: number }> = ({ cell, rowIndex }) => {
	if (!cell.image) return null;

	const base1x = `/assets/img/grid/${cell.image}`;
	const base2x = base1x.replace(/\.webp$/, "@2x.webp");
	const url1x = `${base1x}?v=${__APP_VERSION__}`;
	const url2x = `${base2x}?v=${__APP_VERSION__}`;

	const upGradePriority = getUpgradePriority(cell.label);

	return (
		<>
			<img
				alt=""
				className="absolute inset-0 h-full w-full object-cover object-center"
				decoding="async"
				height="64"
				loading={rowIndex < 5 ? "eager" : "lazy"}
				src={url1x}
				srcSet={`${url1x} 1x, ${url2x} 2x`}
				width="64"
			/>
			{upGradePriority ? (
				<span
					className={`gridCell__label mt-1 text-xl sm:text-3xl lg:text-4xl ${
						upGradePriority.length > 1 ? "gridCell__label--corvette" : "gridCell__label"
					}`}
				>
					{upGradePriority}
				</span>
			) : null}
		</>
	);
};

/**
 * Sub-component for rendering an empty or supercharged slot within a grid cell.
 */
const EmptyContent: React.FC<{
	cell: Cell;
	emptyIconFillColor: string;
	showEmptyIcon: boolean;
}> = ({ cell, emptyIconFillColor, showEmptyIcon }) => {
	return (
		<>
			{showEmptyIcon ? <EmptyCellIcon fillColor={emptyIconFillColor} /> : null}
			{!cell.supercharged && !cell.image ? CORNER_SPANS : null}
		</>
	);
};

/**
 * A component representing an individual interactive cell in the optimization grid.
 */
const GridCell: React.FC<GridCellProps> = ({ columnIndex, isSharedGrid, rowIndex }) => {
	const cell = useCell(rowIndex, columnIndex);

	const {
		handleClick,
		handleContextMenu,
		handleKeyDown,
		handleTouchCancel,
		handleTouchEnd,
		handleTouchMove,
		handleTouchStart,
		isTouching,
	} = useGridCellInteraction(cell, rowIndex, columnIndex, isSharedGrid);

	const { cellClassName, cellElementStyle, emptyIconFillColor, showEmptyIcon, techColor } =
		useGridCellStyle(cell, isTouching);

	const cellElement = (
		<div
			aria-colindex={columnIndex + 1}
			className={cellClassName}
			data-accent-color={techColor}
			data-testid="grid-cell"
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			onKeyDown={handleKeyDown}
			onTouchCancel={handleTouchCancel}
			onTouchEnd={handleTouchEnd}
			onTouchMove={handleTouchMove}
			onTouchStart={handleTouchStart}
			role="gridcell"
			style={cellElementStyle as React.CSSProperties}
			tabIndex={isSharedGrid ? -1 : 0}
		>
			{cell.module && cell.active ? (
				<ModuleContent cell={cell} rowIndex={rowIndex} />
			) : (
				<EmptyContent
					cell={cell}
					emptyIconFillColor={emptyIconFillColor}
					showEmptyIcon={showEmptyIcon}
				/>
			)}
		</div>
	);

	const tooltipContent = stripLabel(cell.label);
	const isTooltipVisible = cell.module && cell.active;

	return isTooltipVisible ? (
		<ConditionalTooltip delayDuration={500} label={tooltipContent ?? ""}>
			{cellElement}
		</ConditionalTooltip>
	) : (
		cellElement
	);
};

export default React.memo(GridCell);
