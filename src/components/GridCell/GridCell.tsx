import "./GridCell.scss";

import type { Cell } from "@/store/grid/gridStore";
import React from "react";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import EmptyCellIcon from "@/components/Icons/EmptyCellIcon";
import { useCell } from "@/hooks/useCell/useCell";
import { useGridStore } from "@/store/grid/gridStore";
import { getGridCellElementId, useGridFocusStore } from "@/store/grid/useGridFocusStore";
import { getUpgradePriority } from "@/utils/grid/upgradePriority";

import { getGridCellAriaLabel, stripLabel } from "./gridCellAria";
import { useGridCellInteraction } from "./useGridCellInteraction";
import { useGridCellStyle } from "./useGridCellStyle";

/** Regular expression to match `.webp` file extensions at the end of a string. */
const WEBP_REGEX = /\.webp$/;

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

	rowIndex: number;
}

/**
 * Sub-component for rendering a technology module within a grid cell.
 */
const ModuleContent: React.FC<{ cell: Cell; rowIndex: number }> = ({ cell, rowIndex }) => {
	if (!cell.image) {
		return null;
	}

	const base1x = `/assets/img/grid/${cell.image}`;
	const base2x = base1x.replace(WEBP_REGEX, "@2x.webp");
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
 * A single cell within the technology grid.
 *
 * @remarks
 * Displays technology modules, supercharged slot indicators, and handles
 * user interactions via the {@link useGridCellInteraction} hook.
 * It manages its own selection of global state (like `isSharedGrid`) to minimize prop drilling.
 *
 * @param {GridCellProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered grid cell.
 *
 * @see {@link Cell}
 * @see {@link useCell}
 * @see {@link useGridCellInteraction}
 * @see {@link useGridCellStyle}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridCell columnIndex={0} rowIndex={0} />
 * ```
 */
const GridCell: React.FC<GridCellProps> = ({ columnIndex, rowIndex }) => {
	const { t } = useTranslation();
	const cell = useCell(rowIndex, columnIndex);
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const isRovingFocused = useGridFocusStore(
		(state) => state.focusedRow === rowIndex && state.focusedCol === columnIndex
	);

	const {
		handleClick,
		handleContextMenu,
		handleFocus,
		handleKeyDown,
		handleTouchCancel,
		handleTouchEnd,
		handleTouchMove,
		handleTouchStart,
		isTouching,
	} = useGridCellInteraction(cell, rowIndex, columnIndex, isSharedGrid);

	const { cellClassName, cellElementStyle, emptyIconFillColor, showEmptyIcon, techColor } =
		useGridCellStyle(cell, isTouching);

	const ariaLabel = getGridCellAriaLabel(cell, rowIndex, columnIndex, t);

	const cellElement = (
		<div
			aria-colindex={columnIndex + 1}
			aria-disabled={!cell.active ? true : undefined}
			aria-label={ariaLabel}
			className={cellClassName}
			data-accent-color={techColor}
			data-testid="grid-cell"
			id={getGridCellElementId(rowIndex, columnIndex)}
			onClick={handleClick}
			onContextMenu={handleContextMenu}
			onFocus={handleFocus}
			onKeyDown={handleKeyDown}
			onTouchCancel={handleTouchCancel}
			onTouchEnd={handleTouchEnd}
			onTouchMove={handleTouchMove}
			onTouchStart={handleTouchStart}
			role="gridcell"
			style={cellElementStyle as React.CSSProperties}
			tabIndex={isRovingFocused ? 0 : -1}
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
