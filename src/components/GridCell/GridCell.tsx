import "./GridCell.scss";

import React from "react";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import EmptyCellIcon from "@/components/Icons/EmptyCellIcon";
import { useCell } from "@/hooks/useCell/useCell";

import { useGridCellInteraction } from "./useGridCellInteraction";
import { useGridCellStyle } from "./useGridCellStyle";

/**
 * Determines the upgrade priority identifier based on a technology's label.
 *
 * @remarks
 * Logic maps technology tiers (Theta, Tau, Sigma) and categories (Salvaged, Forbidden, Reactor)
 * to a short alphanumeric code used for visual identification in the grid.
 *
 * @param {string} [label] - The technology label to analyze.
 *
 * @returns {string} A 1-2 character priority code (e.g., "S1", "F2", "1") or an empty string.
 *
 * @category Helpers
 *
 * @example
 * ```ts
 * getUpgradePriority("Salvaged Theta Module"); // returns "S1"
 * ```
 */
const getUpgradePriority = (label: string | undefined): string => {
	if (!label) return "";

	const lowerLabel = label.toLowerCase();

	// Check tier first as it's the most specific
	let tier = "";
	if (lowerLabel.includes("theta")) tier = "1";
	else if (lowerLabel.includes("tau")) tier = "2";
	else if (lowerLabel.includes("sigma")) tier = "3";

	if (!tier) return "";

	// Check category
	if (lowerLabel.includes("salvaged")) return `S${tier}`;
	if (lowerLabel.includes("forbidden")) return `F${tier}`;
	if (lowerLabel.includes("reactor")) return `R${tier}`;

	// Booster/Category keywords
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
 * Properties for the `GridCell` component.
 *
 * @category Components
 */
interface GridCellProps {
	/** The column index of the cell within the grid (0-based). */
	columnIndex: number;
	/** Whether the grid is currently in read-only shared mode. */
	isSharedGrid: boolean;
	/** The row index of the cell within the grid (0-based). */
	rowIndex: number;
}

/**
 * Removes bracketed and parenthetical metadata from a technology label.
 *
 * @remarks
 * Used for cleaning up raw tech labels (e.g., from save files) before
 * displaying them in tooltips or grid labels.
 *
 * @param {string} [label] - The raw label string.
 *
 * @returns {string} The cleaned label string.
 *
 * @category Helpers
 *
 * @example
 * ```ts
 * stripLabel("Photonic Core [Active]"); // returns "Photonic Core"
 * ```
 */
const stripLabel = (label: string | undefined): string => {
	if (!label) return "";

	return label.replace(/\[[^\]]+\]|\([^)]+\)/g, "").trim();
};

/**
 * Static elements for the cell's corner highlights.
 *
 * @remarks
 * Rendered for non-supercharged, non-imaged cells to provide grid structure.
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
 * A component representing an individual interactive cell in the optimization grid.
 *
 * @remarks
 * Manages its own styling via `useGridCellStyle` and handles complex interactions
 * (touch, gestures, keyboard) via `useGridCellInteraction`. Cell data is
 * reactively retrieved from `GridStore` using the `useCell` hook.
 *
 * @param {GridCellProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered cell element.
 *
 * @see {@link useGridCellInteraction}
 * @see {@link useGridCellStyle}
 * @see {@link useCell}
 * @see {@link import('../../store/grid/gridStore').GridStore}
 * @see {@link ./GridCell.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridCell rowIndex={0} columnIndex={5} isSharedGrid={false} />
 * ```
 *
 * @performance
 * - Avoids full grid re-renders by subscribing only to specific cell data.
 * - Optimized asset loading (eager vs lazy) based on grid position.
 * @accessibility
 * - Full keyboard navigation support (Space/Enter for activation).
 * - ARIA `gridcell` role and index mapping.
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

	let imageUrl: string | undefined;
	let imageSrcSet: string | undefined;

	if (cell.image) {
		const base1x = `/assets/img/grid/${cell.image}`;
		const base2x = base1x.replace(/\.webp$/, "@2x.webp");
		const url1x = `${base1x}?v=${__APP_VERSION__}`;
		const url2x = `${base2x}?v=${__APP_VERSION__}`;

		imageUrl = url1x;
		imageSrcSet = `${url1x} 1x, ${url2x} 2x`;
	}

	const upGradePriority = getUpgradePriority(cell.label);

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
			{imageUrl ? (
				<img
					alt=""
					className="absolute inset-0 h-full w-full object-cover object-center"
					decoding="async"
					height="64"
					loading={rowIndex < 5 ? "eager" : "lazy"}
					src={imageUrl}
					srcSet={imageSrcSet}
					width="64"
				/>
			) : null}
			{showEmptyIcon ? <EmptyCellIcon fillColor={emptyIconFillColor} /> : null}
			{!cell.supercharged && !cell.image ? CORNER_SPANS : null}
			{upGradePriority ? (
				<span
					className={`gridCell__label mt-1 text-xl sm:text-3xl lg:text-4xl ${
						upGradePriority.length > 1 ? "gridCell__label--corvette" : "gridCell__label"
					}`}
				>
					{upGradePriority}
				</span>
			) : null}
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
