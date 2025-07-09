import "./GridCell.css";

import { Tooltip } from "@radix-ui/themes";
import PropTypes from "prop-types";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useGridStore, selectTotalSuperchargedCells } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import { useTechStore } from "../../store/TechStore";

// This pure function is defined outside the component to prevent re-creation on each render.
const getUpgradePriority = (label: string | undefined): number => {
	if (!label) return 0;
	const lowerLabel = label.toLowerCase();
	if (lowerLabel.includes("theta")) return 1;
	if (lowerLabel.includes("tau")) return 2;
	if (lowerLabel.includes("sigma")) return 3;
	return 0;
};
interface GridCellProps {
	rowIndex: number;
	columnIndex: number;
	isSharedGrid: boolean;
}

/**
 * A memoized component that displays a single cell in the grid.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} columnIndex - The column index of the cell.
 * @param {boolean} isSharedGrid - Flag indicating if the grid is in shared/read-only mode.
 */
const GridCell: React.FC<GridCellProps> = memo(({ rowIndex, columnIndex, isSharedGrid }) => {
	const cell = useGridStore((state) => state.grid.cells[rowIndex][columnIndex]);
	const toggleCellActive = useGridStore((state) => state.toggleCellActive);
	const toggleCellSupercharged = useGridStore((state) => state.toggleCellSupercharged);
	const totalSupercharged = useGridStore(selectTotalSuperchargedCells);
	const longPressTriggered = useRef(false);
	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const { setShaking } = useShakeStore();
	const { t } = useTranslation();

	/**
	 * Handles a click on the cell.
	 *
	 * @param event - The event object
	 */
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			if (isSharedGrid) {
				return;
			}

			if (longPressTriggered.current) {
				event.stopPropagation(); // Prevents unintended click after long press
				return;
			}

			if (event.ctrlKey || event.metaKey) {
				toggleCellActive(rowIndex, columnIndex);
			} else {
				if (totalSupercharged >= 4 && !cell.supercharged) {
					setShaking(true);
					setTimeout(() => {
						setShaking(false);
					}, 500);
					return; // Exit after initiating shake, don't toggle supercharge
				}
				toggleCellSupercharged(rowIndex, columnIndex);
			}
		},
		[
			isSharedGrid,
			toggleCellActive,
			rowIndex,
			columnIndex,
			totalSupercharged,
			cell.supercharged,
			toggleCellSupercharged,
			setShaking,
		]
	);

	useEffect(() => {
		const handler = (e: TouchEvent) => {
			if ((e.target as HTMLElement).closest(".gridCell")) {
				e.preventDefault();
			}
		};

		document.addEventListener("touchstart", handler, { passive: false });
		return () => document.removeEventListener("touchstart", handler);
	}, []);

	/**
	 * Handles a touch start on the cell.
	 */
	const handleTouchStart = useCallback(() => {
		longPressTimer.current = setTimeout(() => {
			longPressTriggered.current = true;
			// Ensure interaction is allowed
			if (isSharedGrid) {
				// Clear timer if interaction is not allowed but timer started
				if (longPressTimer.current) clearTimeout(longPressTimer.current);
				return;
			}
			toggleCellActive(rowIndex, columnIndex);
		}, 750); // Long press duration
	}, [isSharedGrid, toggleCellActive, rowIndex, columnIndex]);

	/**
	 * Handles a touch end on the cell.
	 */
	const handleTouchEnd = useCallback((event: React.TouchEvent) => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
		}
		if (longPressTriggered.current) {
			event.preventDefault(); // Prevent default behavior after a long press
			longPressTriggered.current = false; // Reset immediately
		}
	}, []);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === " " || event.key === "Enter") {
				// Prevent default spacebar scroll and enter key form submission
				event.preventDefault();
				// Cast to React.MouseEvent; not strictly necessary for handleClick's current signature
				// but good practice if handleClick expected more specific event properties.
				handleClick(event as unknown as React.MouseEvent);
			}
		},
		[handleClick]
	);

	// Directly select the color for the current cell's tech from the store.
	// This makes the component reactive to changes in the tech color mapping for this specific tech.
	const currentTechColorFromStore = useTechStore((state) => state.getTechColor(cell.tech ?? ""));
	const techColor = useMemo(() => {
		// If there's no specific tech color from the store (it's falsy) AND the cell is supercharged,
		// override to "purple". Otherwise, use the color from the store.
		return !currentTechColorFromStore && cell.supercharged ? "purple" : currentTechColorFromStore;
	}, [currentTechColorFromStore, cell.supercharged]);

	const cellClassName = useMemo(() => {
		const classes = [
			"gridCell",
			"gridCell--interactive",
			"shadow-md",
			"sm:border-2",
			"border-1",
			"rounded-sm",
			"sm:rounded-md",
		];
		if (cell.supercharged) classes.push("gridCell--supercharged");
		classes.push(cell.active ? "gridCell--active" : "gridCell--inactive");
		if (cell.adjacency_bonus === 0 && cell.image) classes.push("gridCell--black");
		if (cell.supercharged && cell.image) classes.push("gridCell--glow");
		if (cell.label) classes.push("flex", "items-center", "justify-center", "w-full", "h-full");
		return classes.join(" ");
	}, [cell.supercharged, cell.active, cell.adjacency_bonus, cell.image, cell.label]);

	const upGradePriority = getUpgradePriority(cell.label);
	const backgroundImageStyle = useMemo(
		() =>
			cell.image
				? `image-set(url(/assets/img/${cell.image}) 1x, url(/assets/img/${cell.image.replace(/\.webp$/, "@2x.webp")}) 2x)`
				: "none",
		[cell.image]
	);

	const cellElementStyle = useMemo(
		() => ({
			backgroundImage: backgroundImageStyle,
		}),
		[backgroundImageStyle]
	);
	const cellElement = (
		<div
			role="gridcell"
			aria-colindex={columnIndex + 1}
			tabIndex={isSharedGrid ? -1 : 0} // Make cell focusable if not shared
			contentEditable={false}
			draggable={false}
			data-accent-color={techColor}
			onContextMenu={(e) => e.preventDefault()}
			onClick={handleClick}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
			onKeyDown={handleKeyDown}
			className={cellClassName}
			style={cellElementStyle}
		>
			{cell.label && (
				<span className="mt-1 text-1xl md:text-3xl lg:text-4xl gridCell__label">
					{upGradePriority > 0 ? upGradePriority : null}
				</span>
			)}
		</div>
	);

	// Determine tooltip content: use translated string if image exists, otherwise original label.
	// Fallback to cell.label if translation is not found or if cell.image is not present.
	const tooltipContent = cell.image
		? t(`modules.${cell.image}`, { defaultValue: cell.label })
		: cell.label;
	return tooltipContent ? (
		<Tooltip content={tooltipContent} delayDuration={500}>
			{cellElement}
		</Tooltip>
	) : (
		cellElement
	);
});

GridCell.displayName = "GridCell";

GridCell.propTypes = {
	rowIndex: PropTypes.number.isRequired,
	columnIndex: PropTypes.number.isRequired,
	isSharedGrid: PropTypes.bool.isRequired,
};

export default GridCell;
