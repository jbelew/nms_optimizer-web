import type { Cell } from "../../store/GridStore";
import { useCallback, useState } from "react";

import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";

// To track double taps correctly across all cells, we need a shared reference.
// A tap on one cell should not be considered the first tap of a double tap on another.
let lastTapInfo = {
	time: 0,
	cell: [-1, -1], // [rowIndex, columnIndex]
};

const DOUBLE_TAP_THRESHOLD = 400; // ms

/**
 * Custom hook for handling user interactions (clicks, touches, keyboard) with a grid cell.
 * It manages single tap, double tap, and keyboard interactions, and integrates with
 * the grid and shake stores to update cell states and trigger visual feedback.
 *
 * @param {Cell} cell - The cell object representing the current grid cell.
 * @param {number} rowIndex - The row index of the cell.
 * @param {number} columnIndex - The column index of the cell.
 * @param {boolean} isSharedGrid - Indicates if the grid is in a shared (read-only) state.
 * @returns {{
 * isTouching: boolean;
 * handleClick: (event: React.MouseEvent) => void;
 * handleContextMenu: (event: React.MouseEvent) => void;
 * handleTouchStart: () => void;
 * handleTouchEnd: () => void;
 * handleKeyDown: (event: React.KeyboardEvent) => void;
 * }} An object containing interaction handlers and the `isTouching` state.
 */
export const useGridCellInteraction = (
	cell: Cell,
	rowIndex: number,
	columnIndex: number,
	isSharedGrid: boolean
) => {
	const {
		handleCellTap,
		handleCellDoubleTap,
		revertCellTap,
		clearInitialCellStateForTap,
		toggleCellActive,
		toggleCellSupercharged,
		selectTotalSuperchargedCells,
		superchargedFixed,
		gridFixed,
	} = useGridStore.getState();
	const [isTouching, setIsTouching] = useState(false);

	const { triggerShake: storeTriggerShake } = useShakeStore();

	/**
	 * Triggers a visual shake animation on the grid.
	 * Calls the `triggerShake` action from the ShakeStore.
	 */
	const triggerShake = useCallback(() => {
		storeTriggerShake();
	}, [storeTriggerShake]);

	const handleTouchLogic = useCallback(() => {
		const currentTime = new Date().getTime();
		const timeSinceLastTap = currentTime - lastTapInfo.time;
		const isSameCell = lastTapInfo.cell[0] === rowIndex && lastTapInfo.cell[1] === columnIndex;

		if (isSameCell && timeSinceLastTap < DOUBLE_TAP_THRESHOLD && timeSinceLastTap > 0) {
			// Double tap on the same cell
			lastTapInfo = { time: 0, cell: [-1, -1] }; // Reset after double tap
			const totalSupercharged = selectTotalSuperchargedCells();
			const isInvalidDoubleTap =
				superchargedFixed ||
				gridFixed ||
				rowIndex >= 4 ||
				(totalSupercharged >= 4 && !cell.supercharged);

			if (isInvalidDoubleTap) {
				triggerShake();
				revertCellTap(rowIndex, columnIndex);
			} else {
				handleCellDoubleTap(rowIndex, columnIndex);
			}
		} else {
			// Single tap or tap on a different cell
			lastTapInfo = { time: currentTime, cell: [rowIndex, columnIndex] };
			const isInvalidSingleTap = gridFixed || (superchargedFixed && cell.supercharged);

			if (isInvalidSingleTap) {
				triggerShake();
				clearInitialCellStateForTap();
			} else {
				handleCellTap(rowIndex, columnIndex);
			}
		}
	}, [
		cell.supercharged,
		columnIndex,
		clearInitialCellStateForTap,
		gridFixed,
		handleCellDoubleTap,
		handleCellTap,
		revertCellTap,
		rowIndex,
		selectTotalSuperchargedCells,
		superchargedFixed,
		triggerShake,
	]);

	/**
	 * Handles the touch start event for a grid cell.
	 */
	const handleTouchStart = useCallback(() => {
		setIsTouching(true);
	}, []);

	/**
	 * Handles the touch end event for a grid cell.
	 * Calls preventDefault to stop the browser from generating a click event, eliminating the 300ms delay.
	 */
	const handleTouchEnd = useCallback(
		(event: React.TouchEvent | React.MouseEvent) => {
			// We can cast event to any because we preventDefault on both if needed,
			// though physically this is usually a TouchEvent.
			if (event.cancelable) {
				event.preventDefault();
			}

			setIsTouching(false);
			if (isSharedGrid) return;

			if (cell.module) {
				triggerShake();

				return;
			}

			handleTouchLogic();
		},
		[handleTouchLogic, isSharedGrid, cell.module, triggerShake]
	);

	const handleTouchCancel = useCallback(() => {
		setIsTouching(false);
	}, []);

	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			if (isSharedGrid) {
				return;
			}

			// If the cell has a module, no interactions should change its state.
			if (cell.module) {
				triggerShake();

				return;
			}

			// Mouse-specific logic (Ctrl/Cmd + Click)
			if (event.ctrlKey || event.metaKey) {
				// Ctrl/Cmd + Click: Toggle Active
				if (gridFixed) {
					triggerShake();
				} else {
					toggleCellActive(rowIndex, columnIndex);
				}
			} else {
				// Normal Click: Toggle Supercharged
				const totalSupercharged = selectTotalSuperchargedCells();
				const isInvalidSuperchargeToggle =
					superchargedFixed ||
					gridFixed ||
					rowIndex >= 4 ||
					(totalSupercharged >= 4 && !cell.supercharged);

				if (isInvalidSuperchargeToggle) {
					triggerShake();
				} else {
					toggleCellSupercharged(rowIndex, columnIndex);
				}
			}
		},
		[
			isSharedGrid,
			rowIndex,
			columnIndex,
			toggleCellActive,
			toggleCellSupercharged,
			cell.supercharged,
			cell.module,
			triggerShake,
			gridFixed,
			superchargedFixed,
			selectTotalSuperchargedCells,
		]
	);

	const handleContextMenu = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
	}, []);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === " " || event.key === "Enter") {
				event.preventDefault();
				if (isSharedGrid) return;

				if (cell.module) {
					triggerShake();

					return;
				}

				if (gridFixed) {
					triggerShake();
				} else {
					toggleCellActive(rowIndex, columnIndex);
				}
			}
		},
		[
			isSharedGrid,
			gridFixed,
			triggerShake,
			toggleCellActive,
			rowIndex,
			columnIndex,
			cell.module,
		]
	);

	return {
		isTouching,
		handleClick,
		handleContextMenu,
		handleTouchStart,
		handleTouchEnd,
		handleTouchCancel,
		handleKeyDown,
	};
};
