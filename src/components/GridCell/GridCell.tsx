import "./GridCell.css";

import { Tooltip } from "@radix-ui/themes";
import PropTypes from "prop-types"; // Import PropTypes
import React, { memo, useCallback, useMemo, useRef, useState } from "react"; // Import useCallback, memo, and useMemo
import { useTranslation } from "react-i18next";

import { useGridStore, selectTotalSuperchargedCells } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import { useTechStore } from "../../store/TechStore";

// Moved outside the component to prevent re-creation on each render
// This function is pure and only depends on its input.
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
 * A memoized component that displays a single cell in the grid.
 *
 * @param rowIndex - The row index of the cell
 * @param columnIndex - The column index of the cell
 * @param cell - The cell object, containing properties like label, supercharged, active, and image
 */

const GridCell: React.FC<GridCellProps> = memo(({ rowIndex, columnIndex, isSharedGrid }) => {
	const cell = useGridStore((state) => state.grid.cells[rowIndex][columnIndex]);
	const toggleCellActive = useGridStore((state) => state.toggleCellActive);
	const toggleCellSupercharged = useGridStore((state) => state.toggleCellSupercharged);
	const totalSupercharged = useGridStore(selectTotalSuperchargedCells);
	const superchargedFixed = useGridStore((state) => state.superchargedFixed);
	const gridFixed = useGridStore((state) => state.gridFixed);
	
	const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // New ref for shake timeout
	const { setShaking } = useShakeStore(); // Get setShaking from the store
	const { t } = useTranslation();

	const lastTapTime = useRef(0);

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

			const currentTime = new Date().getTime();
			const tapLength = currentTime - lastTapTime.current;

			// Function to handle shaking and its timeout
			const triggerShake = () => {
				setShaking(true);
				if (shakeTimeoutRef.current) {
					clearTimeout(shakeTimeoutRef.current);
				}
				shakeTimeoutRef.current = setTimeout(() => {
					setShaking(false);
					shakeTimeoutRef.current = null; // Clear the ref after timeout
				}, 500);
			};

			if (event.ctrlKey || event.metaKey || (tapLength < 300 && tapLength > 0)) {
				// Double tap or Ctrl/Meta key for toggling active state
				if (gridFixed) {
					triggerShake();
					return; // Exit after initiating shake, don't toggle active
				}
				toggleCellActive(rowIndex, columnIndex);
			} else if (superchargedFixed) {
				triggerShake();
				return; // Exit after initiating shake, don't toggle supercharge
			} else {
				// Single tap for toggling supercharged state
				if (totalSupercharged >= 4 && !cell.supercharged) {
					triggerShake();
					return; // Exit after initiating shake, don't toggle supercharge
				}
				toggleCellSupercharged(rowIndex, columnIndex);
			}
			lastTapTime.current = currentTime;
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
			superchargedFixed,
			gridFixed,
		]
	);

	

	/**
	 * Handles a context menu on the cell.
	 *
	 * @param event - The event object
	 */
	const handleContextMenu = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
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

	// Get the upgrade priority for the current cell
	const upGradePriority = getUpgradePriority(cell.label);
	const backgroundImageStyle = useMemo(
		() =>
			cell.image
				? `image-set(url(/assets/img/grid/${cell.image}) 1x, url(/assets/img/grid/${cell.image.replace(/\.webp$/, "@2x.webp")}) 2x)`
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
			data-accent-color={techColor}
			onContextMenu={handleContextMenu}
			onClick={handleClick}
			
			onKeyDown={handleKeyDown}
			className={cellClassName}
			style={cellElementStyle}
		>
			{cell.label && ( // Conditionally render the label span
				<span className="mt-1 text-1xl md:text-3xl lg:text-4xl gridCell__label">
					{upGradePriority > 0 ? upGradePriority : null}
				</span>
			)}
		</div>
	);

	// Determine tooltip content: use translated string if image exists, otherwise original label.
	// Fallback to cell.label if translation is not found or if cell.image is not present.
	const tooltipContent = cell.image
		? t(`modules.${cell.image.replace(/\.webp$/, "").replace(/\//g, ".")}`, {
				defaultValue: cell.label,
			})
		: cell.label;
	return cell.module && cell.active ? (
		<Tooltip content={tooltipContent} delayDuration={500}>
			{cellElement}
		</Tooltip>
	) : (
		cellElement
	);
});

// Set display name for better debugging in React DevTools
GridCell.displayName = "GridCell";

// Add PropTypes for runtime validation
GridCell.propTypes = {
	rowIndex: PropTypes.number.isRequired,
	columnIndex: PropTypes.number.isRequired,
	isSharedGrid: PropTypes.bool.isRequired,
};

export default GridCell;
