import "./GridCell.scss";

import React from "react";

import EmptyCellIcon from "@/assets/svg/EmptyCellIcon";
import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useCell } from "@/hooks/useCell/useCell";

import { useGridCellInteraction } from "./useGridCellInteraction";
import { useGridCellStyle } from "./useGridCellStyle";

/**
 * Determines the upgrade priority identifier based on a technology's label.
 *
 * This utility maps specific keywords (Theta, Tau, Sigma) and categories
 * (Booster, Reactor, etc.) to a shorthand code used as an overlay on the cell icon.
 *
 * @param {string} [label] - The display name of the technology.
 * @returns {string} A shorthand code (e.g., '1', 'C2', 'S3') or an empty string.
 *
 * @example
 * getUpgradePriority("Warp Reactor Theta"); // returns "R1"
 */
const getUpgradePriority = (label: string | undefined): string => {
	if (!label) return "";

	const lowerLabel = label.toLowerCase();
	const isUpgrade = lowerLabel.includes("upgrade");
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
	const isReactor = lowerLabel.includes("reactor");
	const isForbidden = lowerLabel.includes("forbidden");
	const isSalvaged = lowerLabel.includes("salvaged");

	if (isUpgrade || isBooster || isReactor || isForbidden || isSalvaged) {
		if (lowerLabel.includes("theta")) {
			if (isSalvaged) return "S1";
			if (isForbidden) return "F1";
			if (isReactor) return "R1";
			if (isBooster) return "C1";
			if (isUpgrade) return "1";
		}

		if (lowerLabel.includes("tau")) {
			if (isSalvaged) return "S2";
			if (isForbidden) return "F2";
			if (isReactor) return "R2";
			if (isBooster) return "C2";
			if (isUpgrade) return "2";
		}

		if (lowerLabel.includes("sigma")) {
			if (isSalvaged) return "S3";
			if (isForbidden) return "F3";
			if (isReactor) return "R3";
			if (isBooster) return "C3";
			if (isUpgrade) return "3";
		}
	}

	return "";
};

/**
 * Props for the `GridCell` component.
 */
interface GridCellProps {
	/** The row index of the cell within the grid. **Must be a valid index.** */
	rowIndex: number;
	/** The column index of the cell within the grid. **Must be a valid index.** */
	columnIndex: number;
	/** Whether the grid is currently in read-only shared mode. */
	isSharedGrid: boolean;
}

/**
 * Removes bracketed and parenthetical metadata from a technology label.
 *
 * @param {string} [label] - The raw label string.
 * @returns {string} The cleaned label string.
 *
 * @example
 * stripLabel("Photonic Core [Active]"); // returns "Photonic Core"
 */
const stripLabel = (label: string | undefined): string => {
	if (!label) return "";

	return label.replace(/\[[^\]]+\]|\([^)]+\)/g, "").trim();
};

/** Static elements for the cell's corner highlights. */
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
 * It manages its own styling based on the cell's state (active, supercharged, occupied)
 * and handles complex user interactions including taps, double-taps, and long-presses.
 *
 * @param {GridCellProps} props - Component properties.
 * @returns {JSX.Element} The rendered cell element.
 * @component
 * @category Components
 *
 * @example
 * ```tsx
 * <GridCell rowIndex={0} columnIndex={5} isSharedGrid={false} />
 * ```
 *
 * @performance
 * - Direct row-less rendering in parent to minimize layout depth.
 * - Subscribes to targeted cell state via `useCell` hook to avoid full grid re-renders.
 *
 * @accessibility
 * - Full keyboard navigation support (tabIndex).
 * - ARIA gridcell role and column index mapping.
 */
const GridCell: React.FC<GridCellProps> = ({ rowIndex, columnIndex, isSharedGrid }) => {
	const cell = useCell(rowIndex, columnIndex);

	const {
		isTouching,
		handleClick,
		handleContextMenu,
		handleKeyDown,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleTouchCancel,
	} = useGridCellInteraction(cell, rowIndex, columnIndex, isSharedGrid);

	const { techColor, cellClassName, cellElementStyle, showEmptyIcon, emptyIconFillColor } =
		useGridCellStyle(cell, isTouching);

	/**
	 * Generates resolution-aware URLs for the cell's technology icon.
	 *
	 * @returns {{ imageUrl?: string, imageSrcSet?: string }} Image metadata.
	 *
	 * @example
	 * ```typescript
	 * const { imageUrl, imageSrcSet } = getImageUrl();
	 * // returns { imageUrl: "/assets/img/grid/tech_warp.webp?v=1.0", ... }
	 * ```
	 */
	const getImageUrl = () => {
		if (!cell.image) return { imageUrl: undefined, imageSrcSet: undefined };

		const base1x = `/assets/img/grid/${cell.image}`;
		const base2x = base1x.replace(/\.webp$/, "@2x.webp");
		const url1x = `${base1x}?v=${__APP_VERSION__}`;
		const url2x = `${base2x}?v=${__APP_VERSION__}`;

		return { imageUrl: url1x, imageSrcSet: `${url1x} 1x, ${url2x} 2x` };
	};

	const { imageUrl, imageSrcSet } = getImageUrl();

	const upGradePriority = getUpgradePriority(cell.label);

	const cellElement = (
		<div
			role="gridcell"
			aria-colindex={columnIndex + 1}
			tabIndex={isSharedGrid ? -1 : 0}
			data-accent-color={techColor}
			onContextMenu={handleContextMenu}
			onClick={handleClick}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchCancel}
			onKeyDown={handleKeyDown}
			className={cellClassName}
			style={cellElementStyle as React.CSSProperties}
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					srcSet={imageSrcSet}
					alt=""
					width="64"
					height="64"
					className="absolute inset-0 h-full w-full object-cover object-center"
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

	const isTooltipVisible = cell.module && cell.active && !isSharedGrid;

	return isTooltipVisible ? (
		<ConditionalTooltip label={tooltipContent ?? ""} delayDuration={500}>
			{cellElement}
		</ConditionalTooltip>
	) : (
		cellElement
	);
};

export default GridCell;
