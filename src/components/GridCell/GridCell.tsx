import "./GridCell.css";

import { Tooltip } from "@radix-ui/themes";

import React, { memo, useCallback, useMemo, useRef } from "react"; // Import useCallback, memo, and useMemo
import { useTranslation } from "react-i18next";

import { useGridStore } from "../../store/GridStore";
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
	const totalSupercharged = useGridStore((state) => state.selectTotalSuperchargedCells());
	const superchargedFixed = useGridStore((state) => state.superchargedFixed);
	const gridFixed = useGridStore((state) => state.gridFixed);
	const [isTouching, setIsTouching] = React.useState(false);

	const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null); // New ref for shake timeout
	const { setShaking } = useShakeStore(); // Get setShaking from the store
	const { t } = useTranslation();

	const lastTapTime = useRef(0);
	const isTouchDevice = useRef(
		typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
	);

	const handleTouchStart = useCallback(() => {
		setIsTouching(true);
	}, []);

	const handleTouchEnd = useCallback(() => {
		setIsTouching(false);
	}, []);

	const triggerShake = useCallback(() => {
		setShaking(true);
		if (shakeTimeoutRef.current) {
			clearTimeout(shakeTimeoutRef.current);
		}
		shakeTimeoutRef.current = setTimeout(() => {
			setShaking(false);
			shakeTimeoutRef.current = null; // Clear the ref after timeout
		}, 500);
	}, [setShaking]);

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

			const handleSuperchargeToggle = () => {
				console.log("handleSuperchargeToggle called\t");
				if (superchargedFixed) {
					triggerShake();
					return;
				}
				if (totalSupercharged >= 4 && !cell.supercharged) {
					triggerShake();
					return;
				}
				toggleCellSupercharged(rowIndex, columnIndex);
			};

			const handleActiveToggle = () => {
				if (gridFixed) {
					triggerShake();
					return;
				}
				toggleCellActive(rowIndex, columnIndex);
			};

			const handleTap = () => {
				const currentTime = new Date().getTime();
				const timeSinceLastTap = currentTime - lastTapTime.current;

				if (timeSinceLastTap < 500 && timeSinceLastTap > 0) {
					// Double tap
					// Undo the single-click's active toggle
					handleActiveToggle();
					// Then apply the supercharge toggle
					handleSuperchargeToggle();
					lastTapTime.current = 0;
				} else {
					// Single tap
					handleActiveToggle();
					lastTapTime.current = currentTime;
				}
			};

			const handleMouseClick = () => {
				if (event.ctrlKey || event.metaKey) {
					handleActiveToggle();
				} else {
					handleSuperchargeToggle();
				}
			};

			if (isTouchDevice.current) {
				handleTap();
			} else {
				handleMouseClick();
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
			superchargedFixed,
			gridFixed,
			triggerShake,
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
			"sm:border-2 border-1",
			"shadow-sm",
			"sm:shadow-md",
			"relative",
		];
		// classes.push(cell.module || cell.supercharged ? "sm:border-2 border-1" : "");
		if (!cell.module) classes.push("gridCell--empty")
		if (cell.supercharged) classes.push("gridCell--supercharged");
		classes.push(cell.active ? "gridCell--active" : "gridCell--inactive");
		if (isTouching) classes.push("gridCell--touched");
		if (cell.adjacency_bonus === 0 && cell.image) classes.push("gridCell--black");
		if (cell.supercharged && cell.image) classes.push("gridCell--glow");
		if (cell.label) classes.push("flex", "items-center", "justify-center", "w-full", "h-full");
		return classes.join(" ");
	}, [cell.supercharged, cell.active, cell.adjacency_bonus, cell.image, cell.label, cell.module, isTouching]);

	// Get the upgrade priority for the current cell
	const upGradePriority = getUpgradePriority(cell.label);
	const backgroundImageStyle = useMemo(() => {
		if (!cell.module && cell.active) {
			// Use a generic "empty" image for cells without a module
			return `image-set(url(/assets/img/grid/empty.webp) 1x, url(/assets/img/grid/empty@2x.webp) 2x)`;
		}
		if (cell.image) {
			return `image-set(url(/assets/img/grid/${cell.image}) 1x, url(/assets/img/grid/${cell.image.replace(/\.webp$/, "@2x.webp")}) 2x)`;
		}
		return "none";
	}, [cell.module, cell.active, cell.image]);

	const cellElementStyle = useMemo(
		() => ({
			backgroundBlendMode: "screen", backgroundImage: backgroundImageStyle,
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
			{cell.label && ( // Conditionally render the label span
				<span className="mt-1 text-1xl sm:text-3xl lg:text-4xl gridCell__label">
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


export default GridCell;
