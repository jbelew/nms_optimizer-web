import "./GridCell.scss";

import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import EmptyCellIcon from "@/assets/svg/EmptyCellIcon";
import { ConditionalTooltip } from "@/components/ConditionalTooltip";
import { useCell } from "@/hooks/useCell/useCell";

import { useGridCellInteraction } from "./useGridCellInteraction";
import { useGridCellStyle } from "./useGridCellStyle";

/**
 * Determines the upgrade priority based on the technology label.
 * This is used to display a number or code on the cell for certain upgrades.
 *
 * @param {string|undefined} label - The label of the technology.
 * @returns {string} The priority ("1", "2", "3" for upgrades; "B1", "B2", "B3" for boosters), or "" if not applicable.
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
		lowerLabel.includes("ion") ||
		lowerLabel.includes("deflector") ||
		lowerLabel.includes("mag-field") ||
		lowerLabel.includes("torpedo") ||
		lowerLabel.includes("landing") ||
		lowerLabel.includes("deadeye");
	const isReactor = lowerLabel.includes("reactor");
	const isForbidden = lowerLabel.includes("forbidden");

	if (isUpgrade || isBooster || isReactor || isForbidden) {
		if (lowerLabel.includes("theta")) {
			if (isUpgrade) return "1";
			if (isBooster) return "C1";
			if (isReactor) return "R1";
			if (isForbidden) return "F1";
		}
		if (lowerLabel.includes("tau")) {
			if (isUpgrade) return "2";
			if (isBooster) return "C2";
			if (isReactor) return "R2";
			if (isForbidden) return "F2";
		}
		if (lowerLabel.includes("sigma")) {
			if (isUpgrade) return "3";
			if (isBooster) return "C3";
			if (isReactor) return "R3";
			if (isForbidden) return "F3";
		}
	}

	return "";
};

/**
 * @interface GridCellProps
 * @property {number} rowIndex - The row index of the cell.
 * @property {number} columnIndex - The column index of the cell.
 * @property {boolean} isSharedGrid - Indicates if the grid is in a shared (read-only) state.
 */
interface GridCellProps {
	rowIndex: number;
	columnIndex: number;
	isSharedGrid: boolean;
}

/**
 * GridCell component represents a single cell in the technology grid.
 * It displays the technology icon, handles user interactions, and applies styling.
 *
 * @param {GridCellProps} props - The props for the GridCell component.
 * @param {number} props.rowIndex - The row index of the cell.
 * @param {number} props.columnIndex - The column index of the cell.
 * @param {boolean} props.isSharedGrid - Indicates if the grid is in a shared (read-only) state.
 * @returns {JSX.Element} The rendered GridCell component.
 */
const GridCell: React.FC<GridCellProps> = memo(({ rowIndex, columnIndex, isSharedGrid }) => {
	const cell = useCell(rowIndex, columnIndex);
	const { t } = useTranslation();

	const {
		isTouching,
		handleClick,
		handleContextMenu,
		handleKeyDown,
		handleTouchStart,
		handleTouchEnd,
	} = useGridCellInteraction(cell, rowIndex, columnIndex, isSharedGrid);

	const { techColor, cellClassName, cellElementStyle, showEmptyIcon, emptyIconFillColor } =
		useGridCellStyle(cell, isTouching);

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
			onTouchEnd={handleTouchEnd}
			onKeyDown={handleKeyDown}
			className={cellClassName}
			style={cellElementStyle}
		>
			{showEmptyIcon && <EmptyCellIcon fillColor={emptyIconFillColor} />}
			{!cell.supercharged && (
				<>
					<span className="corner top-left"></span>
					<span className="corner top-right"></span>
					<span className="corner bottom-left"></span>
					<span className="corner bottom-right"></span>
				</>
			)}
			{cell.label && (
				<span
					className={`text-1xl gridCell__label mt-1 sm:text-3xl lg:text-4xl ${
						upGradePriority?.length > 1
							? "gridCell__label--corvette"
							: "gridCell__label"
					}`}
				>
					{upGradePriority ?? null}
				</span>
			)}
		</div>
	);

	const tooltipContent = cell.image
		? t(`modules.${cell.image.replace(/\.webp$/, "").replace(/\//g, ".")}`, {
				defaultValue: cell.label,
			})
		: cell.label;

	const isTooltipVisible = cell.module && cell.active && !isSharedGrid;

	return isTooltipVisible ? (
		<ConditionalTooltip label={tooltipContent ?? ""} delayDuration={500}>
			{cellElement}
		</ConditionalTooltip>
	) : (
		cellElement
	);
});

GridCell.displayName = "GridCell";

export default GridCell;
