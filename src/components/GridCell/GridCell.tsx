import "./GridCell.scss";

import type { Cell } from "@/store/grid/gridStore";
import React, { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { Logger } from "@/utils/system/monitoring";

/** Regular expression to match `.webp` file extensions at the end of a string. */
const WEBP_REGEX = /\.webp$/;

/** Default fallback grid width for keyboard navigation. */
const DEFAULT_GRID_WIDTH = 10;

/** Default fallback grid height for keyboard navigation. */
const DEFAULT_GRID_HEIGHT = 6;

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
 * Computes the unique DOM ID for a cell given its matrix coordinates.
 */
const getGridCellElementId = (row: number, col: number): string => `grid-cell-${row}-${col}`;

/**
 * Internal roving tabindex state for managing keyboard focus across grid cells.
 */
interface GridFocusState {
	focusedCol: number;
	focusedRow: number;
	navigateGrid: (
		key: string,
		currentRow: number,
		currentCol: number,
		width: number,
		height: number,
		isCtrlOrMeta: boolean
	) => boolean;
	setFocusedCell: (row: number, col: number) => void;
}

/**
 * Internal store tracking the active roving tabindex cell coordinates across `GridCell` instances.
 */
const useGridFocusStore = create<GridFocusState>()((set) => ({
	focusedCol: 0,
	focusedRow: 0,
	navigateGrid: (key, currentRow, currentCol, width, height, isCtrlOrMeta) => {
		let targetRow = currentRow;
		let targetCol = currentCol;
		let shouldNavigate = false;

		switch (key) {
			case "ArrowDown":
				targetRow = Math.min(height - 1, currentRow + 1);
				shouldNavigate = true;
				break;
			case "ArrowLeft":
				targetCol = Math.max(0, currentCol - 1);
				shouldNavigate = true;
				break;
			case "ArrowRight":
				targetCol = Math.min(width - 1, currentCol + 1);
				shouldNavigate = true;
				break;
			case "ArrowUp":
				targetRow = Math.max(0, currentRow - 1);
				shouldNavigate = true;
				break;
			case "End":
				if (isCtrlOrMeta) {
					targetRow = height - 1;
					targetCol = width - 1;
				} else {
					targetCol = width - 1;
				}

				shouldNavigate = true;
				break;
			case "Home":
				if (isCtrlOrMeta) {
					targetRow = 0;
					targetCol = 0;
				} else {
					targetCol = 0;
				}

				shouldNavigate = true;
				break;
			default:
				break;
		}

		if (shouldNavigate) {
			set({ focusedCol: targetCol, focusedRow: targetRow });
			const element = document.getElementById(getGridCellElementId(targetRow, targetCol));
			element?.focus();
		}

		return shouldNavigate;
	},
	setFocusedCell: (row: number, col: number) => set({ focusedCol: col, focusedRow: row }),
}));

/**
 * Removes bracketed and parenthetical metadata from a technology label.
 */
const stripLabel = (label: string | undefined): string => {
	if (!label) return "";

	return label.replace(/\[[^\]]+\]|\([^)]+\)/g, "").trim();
};

/**
 * Determines the short Module Rank Order badge identifier (`S1`–`S3`, `F1`–`F3`, `R1`–`R3`, `C1`–`C3`, `1`–`3`)
 * from a technology module's display label based on its tier (Theta, Tau, Sigma).
 *
 * @param label - The display label of the technology module.
 *
 * @returns The Module Rank Order badge code, or an empty string if not applicable.
 */
const getModuleRankBadge = (label: string | undefined): string => {
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
 * Translation function compatible with i18next `t`.
 */
type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * Generates an accessible, descriptive WAI-ARIA label for a grid slot.
 *
 * @param cell - The cell data model.
 * @param rowIndex - 0-based row coordinate.
 * @param columnIndex - 0-based column coordinate.
 * @param t - Translation function.
 *
 * @returns The formatted accessible label for the slot.
 */
const getGridCellAriaLabel = (
	cell: Cell,
	rowIndex: number,
	columnIndex: number,
	t: TranslateFn
): string => {
	const row = rowIndex + 1;
	const col = columnIndex + 1;

	let content: string;

	if (!cell.active) {
		content = cell.supercharged
			? t("gridTable.disabledSuperchargedSlot", {
					defaultValue: "Disabled Slot (Supercharged)",
				})
			: t("gridTable.disabledSlot", { defaultValue: "Disabled Slot" });
	} else if (cell.module) {
		const rawLabel = stripLabel(cell.label);
		const cleanedLabel = rawLabel || cell.module;
		content = cell.supercharged
			? t("gridTable.superchargedWithContent", {
					content: cleanedLabel,
					defaultValue: `${cleanedLabel} (Supercharged)`,
				})
			: cleanedLabel;
	} else {
		content = cell.supercharged
			? t("gridTable.superchargedSlot", {
					defaultValue: "Empty Slot (Supercharged)",
				})
			: t("gridTable.emptySlot", { defaultValue: "Empty Slot" });
	}

	return t("gridTable.cellAriaLabel", {
		col,
		content,
		defaultValue: `Row ${row}, Column ${col}: ${content}`,
		row,
	});
};

/**
 * Decorative SVG icon representing an empty active slot in the technology grid.
 */
const EmptyCellIcon: React.FC<{ fillColor: string }> = ({ fillColor }) => (
	<svg
		height="100%"
		preserveAspectRatio="xMidYMid meet"
		version="1.0"
		viewBox="0 0 256 256"
		width="100%"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g stroke="none" style={{ fill: fillColor }} transform="translate(0,256) scale(0.1,-0.1)">
			<path d="M422 1114 c-29 -13 -33 -19 -28 -39 8 -32 -15 -88 -45 -109 -13 -9 -41 -16 -62 -16 -33 0 -40 -4 -52 -32 -12 -31 -11 -34 16 -66 38 -43 40 -98 4 -140 -29 -35 -30 -43 -10 -82 12 -24 22 -30 48 -30 18 0 43 -7 56 -16 27 -20 53 -76 45 -99 -5 -11 6 -21 41 -36 l46 -20 25 24 c42 42 101 41 149 -3 19 -17 23 -17 58 -3 31 13 37 20 37 45 0 61 44 107 101 108 31 0 38 5 53 36 16 35 16 37 -3 58 -47 50 -47 127 1 161 20 13 20 18 9 55 -11 38 -14 40 -52 40 -33 0 -47 6 -76 35 -28 28 -34 41 -32 67 4 43 -4 54 -45 68 -31 10 -36 9 -64 -20 -43 -42 -101 -42 -144 0 -33 34 -31 34 -76 14z m227 -213 c44 -31 63 -65 63 -115 0 -58 -26 -103 -72 -127 -122 -66 -254 61 -194 187 19 41 33 52 81 70 44 15 87 10 122 -15z" />
			<path d="M910 597 c0 -27 -36 -48 -76 -45 -38 3 -39 2 -37 -27 3 -50 -6 -75 -32 -87 -34 -15 -31 -42 6 -69 27 -19 30 -26 26 -55 -7 -42 16 -64 59 -57 25 4 35 0 51 -21 26 -33 56 -33 77 -1 13 19 25 25 54 25 48 0 62 14 55 55 -4 26 0 36 21 52 33 26 34 65 4 78 -19 8 -23 18 -23 52 0 51 -23 80 -51 65 -24 -12 -59 1 -74 27 -12 24 -60 29 -60 8z m84 -128 c52 -41 18 -139 -48 -139 -39 0 -79 41 -79 80 0 24 7 40 27 57 34 28 65 29 100 2z" />
		</g>
	</svg>
);

/**
 * Sub-component for rendering a placed technology module and its Module Rank Order badge.
 */
const ModuleContent: React.FC<{ cell: Cell; rowIndex: number }> = ({ cell, rowIndex }) => {
	if (!cell.image) {
		return null;
	}

	const base1x = `/assets/img/grid/${cell.image}`;
	const base2x = base1x.replace(WEBP_REGEX, "@2x.webp");
	const url1x = `${base1x}?v=${__APP_VERSION__}`;
	const url2x = `${base2x}?v=${__APP_VERSION__}`;
	const moduleRankBadge = getModuleRankBadge(cell.label);

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
			{moduleRankBadge ? (
				<span
					className={`gridCell__label mt-1 text-xl sm:text-3xl lg:text-4xl ${
						moduleRankBadge.length > 1 ? "gridCell__label--corvette" : "gridCell__label"
					}`}
				>
					{moduleRankBadge}
				</span>
			) : null}
		</>
	);
};

/**
 * Sub-component for rendering an empty or supercharged slot indicator.
 */
const EmptyContent: React.FC<{
	cell: Cell;
	emptyIconFillColor: string;
	showEmptyIcon: boolean;
}> = ({ cell, emptyIconFillColor, showEmptyIcon }) => (
	<>
		{showEmptyIcon ? <EmptyCellIcon fillColor={emptyIconFillColor} /> : null}
		{!cell.supercharged && !cell.image ? CORNER_SPANS : null}
	</>
);

/**
 * Properties for the {@link GridCell} component.
 */
export interface GridCellProps {
	/** 0-based column coordinate in the inventory grid. */
	columnIndex: number;
	/** 0-based row coordinate in the inventory grid. */
	rowIndex: number;
}

/**
 * A single inventory slot within the technology grid.
 *
 * @remarks
 * Self-contained slot module that subscribes directly to {@link useGridStore} and {@link useTechStore},
 * computes visual state classes, Module Rank Order badges, and WAI-ARIA slot announcements, and translates
 * mouse, touch gesture, and roving-tabindex keyboard events into grid store actions.
 *
 * @param props - Component properties containing 0-based row and column coordinates.
 *
 * @returns The rendered grid cell element wrapped in a conditional module tooltip.
 *
 * @see {@link useGridStore}
 * @see {@link useTechStore}
 * @see {@link ./GridCell.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridCell columnIndex={0} rowIndex={0} />
 * // renders <div role="gridcell" id="grid-cell-0-0" ... />
 * ```
 */
const GridCell: React.FC<GridCellProps> = ({ columnIndex, rowIndex }) => {
	const { t } = useTranslation();
	const cell = useGridStore(useShallow((state) => state.grid.cells[rowIndex][columnIndex]));
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const currentTechColorFromStore = useTechStore((state) => state.techColors[cell.tech ?? ""]);
	const isRovingFocused = useGridFocusStore(
		(state) => state.focusedRow === rowIndex && state.focusedCol === columnIndex
	);

	const [isTouching, setIsTouching] = useState(false);
	const [, startTransition] = useTransition();
	const gestureStartRef = useRef<null | { x: number; y: number }>(null);
	const isGestureRef = useRef(false);

	const handleTouchStart = (event: React.TouchEvent) => {
		setIsTouching(true);

		if (event.touches.length > 1) {
			isGestureRef.current = true;
		} else {
			isGestureRef.current = false;
			gestureStartRef.current = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY,
			};
		}
	};

	const handleTouchMove = (event: React.TouchEvent) => {
		if (isGestureRef.current || !gestureStartRef.current) return;

		const x = event.touches[0].clientX;
		const y = event.touches[0].clientY;
		const dx = Math.abs(x - gestureStartRef.current.x);
		const dy = Math.abs(y - gestureStartRef.current.y);

		if (dx > 10 || dy > 10) {
			isGestureRef.current = true;
		}
	};

	const handleTouchEnd = (event: React.MouseEvent | React.TouchEvent) => {
		setIsTouching(false);

		if (isGestureRef.current) {
			isGestureRef.current = false;
			gestureStartRef.current = null;

			return;
		}

		if (event.cancelable) {
			event.preventDefault();
		}

		if (isSharedGrid) return;

		const currentTime = Date.now();
		startTransition(() => {
			useGridStore.getState().registerCellTap(rowIndex, columnIndex, currentTime);
		});
	};

	const handleTouchCancel = () => {
		setIsTouching(false);
	};

	const handleClick = (event: React.MouseEvent) => {
		if (isSharedGrid) {
			return;
		}

		const gridState = useGridStore.getState();

		startTransition(() => {
			if (event.ctrlKey || event.metaKey) {
				gridState.toggleCellActive(rowIndex, columnIndex);
			} else {
				gridState.toggleCellSupercharged(rowIndex, columnIndex);
			}
		});
	};

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
	};

	const handleFocus = () => {
		useGridFocusStore.getState().setFocusedCell(rowIndex, columnIndex);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		try {
			const key = event.key;
			const isModifier = event.ctrlKey || event.metaKey;

			if (
				(key === " " || key === "Enter") &&
				!event.shiftKey &&
				!isModifier &&
				!event.altKey
			) {
				event.preventDefault();
				if (isSharedGrid) return;

				startTransition(() => {
					useGridStore.getState().toggleCellActive(rowIndex, columnIndex);
				});

				return;
			}

			if (
				((key === "s" || key === "S") && !isModifier && !event.altKey) ||
				(key === "Enter" && event.shiftKey && !isModifier && !event.altKey)
			) {
				event.preventDefault();
				if (isSharedGrid) return;

				startTransition(() => {
					useGridStore.getState().toggleCellSupercharged(rowIndex, columnIndex);
				});

				return;
			}

			const grid = useGridStore.getState().grid;
			const width = grid?.width ?? DEFAULT_GRID_WIDTH;
			const height = grid?.height ?? DEFAULT_GRID_HEIGHT;

			const didNavigate = useGridFocusStore
				.getState()
				.navigateGrid(key, rowIndex, columnIndex, width, height, isModifier);

			if (didNavigate) {
				event.preventDefault();
			}
		} catch (error) {
			Logger.error("Failed to handle key down on grid cell", error);
		}
	};

	// Using hex values instead of CSS variables for screenshot compatibility (html-to-image)
	const emptyIconFillColor = cell.supercharged ? "#c150ff2d" : "#00befd28";
	const techColor =
		!currentTechColorFromStore && cell.supercharged ? "purple" : currentTechColorFromStore;

	const classes = [
		"gridCell",
		"gridCell--interactive",
		"sm:border-2 border-1",
		"shadow-sm",
		"relative",
	];
	if (!cell.module && cell.active) classes.push("gridCell--empty");
	if (cell.supercharged) classes.push("gridCell--supercharged");
	classes.push(cell.active ? "gridCell--active" : "gridCell--inactive");
	if (isTouching) classes.push("gridCell--touched");
	if (cell.adjacency_bonus === 0 && !cell.group_adjacent && cell.image)
		classes.push("gridCell--black");
	if (cell.supercharged && cell.image) classes.push("gridCell--glow");
	if (cell.label) classes.push("flex", "items-center", "justify-center", "w-full", "h-full");

	const cellClassName = classes.join(" ");
	const showEmptyIcon = !cell.module && cell.active;
	const ariaLabel = getGridCellAriaLabel(cell, rowIndex, columnIndex, t);

	const cellElement = (
		<div
			aria-colindex={columnIndex + 1}
			// Note: aria-disabled is intentionally omitted so inactive cells remain interactive
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
