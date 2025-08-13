import "./GridCell.css";

import React, { memo } from "react";
import { Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useGridStore } from "../../store/GridStore";
import { useGridCellInteraction } from "./useGridCellInteraction";
import { useGridCellStyle } from "./useGridCellStyle";

/**
 * Determines the upgrade priority based on the technology label.
 * @param {string | undefined} label - The label of the technology.
 * @returns {number} The priority (1 for Theta, 2 for Tau, 3 for Sigma), or 0 if not found.
 */
const getUpgradePriority = (label: string | undefined): number => {
	if (!label) return 0;
	const lowerLabel = label.toLowerCase();
	if (lowerLabel.includes(" theta")) return 1;
	if (lowerLabel.includes(" tau")) return 2;
	if (lowerLabel.includes(" sigma")) return 3;
	return 0;
};

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
	const cell = useGridStore((state) => state.grid.cells[rowIndex][columnIndex]);
	const { t } = useTranslation();

	const {
		isTouching,
		handleClick,
		handleContextMenu,
		handleKeyDown,
		handleTouchStart,
		handleTouchEnd,
	} = useGridCellInteraction(cell, rowIndex, columnIndex, isSharedGrid);

	const { techColor, cellClassName, cellElementStyle } = useGridCellStyle(cell, isTouching);

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
			{!cell.supercharged && (
				<>
					<span className="corner top-left"></span>
					<span className="corner top-right"></span>
					<span className="corner bottom-left"></span>
					<span className="corner bottom-right"></span>
				</>
			)}
			{cell.label && (
				<span className="text-1xl gridCell__label mt-1 sm:text-3xl lg:text-4xl">
					{upGradePriority > 0 ? upGradePriority : null}
				</span>
			)}
		</div>
	);

	const tooltipContent = cell.image
		? t(`modules.${cell.image.replace(/\.webp$/, "").replace(/\//g, ".")}`, {
				defaultValue: cell.label,
			})
		: cell.label;

	return cell.module && cell.active && !isSharedGrid ? (
		<Tooltip content={tooltipContent} delayDuration={500}>
			{cellElement}
		</Tooltip>
	) : (
		cellElement
	);
});

GridCell.displayName = "GridCell";

export default GridCell;
