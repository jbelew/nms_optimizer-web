import type { Cell } from "../../store/GridStore";
import { useCallback, useRef, useState, useTransition } from "react";

import { useGridStore } from "../../store/GridStore";
import { useSessionStore } from "../../store/SessionStore";
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
	} = useGridStore.getState();
	const [isTouching, setIsTouching] = useState(false);
	const [_isPending, startTransition] = useTransition();

	// Refs to track gestures (scroll, zoom) vs taps
	const gestureStartRef = useRef<{ x: number; y: number } | null>(null);
	const isGestureRef = useRef(false);

	const { triggerShake: storeTriggerShake } = useShakeStore();
	const {
		incrementSuperchargedLimit,
		incrementSuperchargedFixed,
		incrementGridFixed,
		incrementModuleLocked,
		incrementRowLimit,
	} = useSessionStore();

	/**
	 * Triggers a visual shake animation on the grid.
	 * Calls the `triggerShake` action from the ShakeStore.
	 */
	const triggerShake = useCallback(() => {
		storeTriggerShake();
	}, [storeTriggerShake]);

	const handleTouchLogic = useCallback(() => {
		const { superchargedFixed, gridFixed } = useGridStore.getState();
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
				if (totalSupercharged >= 4 && !cell.supercharged) {
					incrementSuperchargedLimit();
				} else if (superchargedFixed) {
					incrementSuperchargedFixed();
				} else if (gridFixed) {
					incrementGridFixed();
				} else if (rowIndex >= 4) {
					incrementRowLimit();
				}

				triggerShake();
				setTimeout(() => {
					startTransition(() => {
						revertCellTap(rowIndex, columnIndex);
					});
				}, 0);
			} else {
				setTimeout(() => {
					startTransition(() => {
						handleCellDoubleTap(rowIndex, columnIndex);
					});
				}, 0);
			}
		} else {
			// Single tap or tap on a different cell
			lastTapInfo = { time: currentTime, cell: [rowIndex, columnIndex] };
			const isInvalidSingleTap = gridFixed || (superchargedFixed && cell.supercharged);

			if (isInvalidSingleTap) {
				if (superchargedFixed && cell.supercharged) {
					incrementSuperchargedFixed();
				} else if (gridFixed) {
					incrementGridFixed();
				}

				triggerShake();
				setTimeout(() => {
					startTransition(() => {
						clearInitialCellStateForTap();
					});
				}, 0);
			} else {
				setTimeout(() => {
					startTransition(() => {
						handleCellTap(rowIndex, columnIndex);
					});
				}, 0);
			}
		}
	}, [
		cell.supercharged,
		columnIndex,
		clearInitialCellStateForTap,
		handleCellDoubleTap,
		handleCellTap,
		incrementGridFixed,
		incrementRowLimit,
		incrementSuperchargedFixed,
		incrementSuperchargedLimit,
		revertCellTap,
		rowIndex,
		selectTotalSuperchargedCells,
		triggerShake,
	]);

	/**
	 * Handles the touch start event for a grid cell.
	 */
	const handleTouchStart = useCallback((event: React.TouchEvent) => {
		setIsTouching(true);

		// If more than one finger, it's a gesture (pinch/zoom)
		if (event.touches.length > 1) {
			isGestureRef.current = true;
		} else {
			isGestureRef.current = false;
			gestureStartRef.current = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY,
			};
		}
	}, []);

	/**
	 * Handles touch move to detect scrolling/gestures
	 */
	const handleTouchMove = useCallback((event: React.TouchEvent) => {
		if (isGestureRef.current || !gestureStartRef.current) return;

		const x = event.touches[0].clientX;
		const y = event.touches[0].clientY;
		const dx = Math.abs(x - gestureStartRef.current.x);
		const dy = Math.abs(y - gestureStartRef.current.y);

		// If moved more than 10px, treat as scroll/gesture
		if (dx > 10 || dy > 10) {
			isGestureRef.current = true;
		}
	}, []);

	/**
	 * Handles the touch end event for a grid cell.
	 * Calls preventDefault to stop the browser from generating a click event, eliminating the 300ms delay.
	 */
	const handleTouchEnd = useCallback(
		(event: React.TouchEvent | React.MouseEvent) => {
			setIsTouching(false);

			// If it was a gesture (scroll/zoom), ignore the tap
			if (isGestureRef.current) {
				isGestureRef.current = false;
				gestureStartRef.current = null;

				return;
			}

			// We can cast event to any because we preventDefault on both if needed,
			// though physically this is usually a TouchEvent.
			if (event.cancelable) {
				event.preventDefault();
			}

			if (isSharedGrid) return;

			if (cell.module) {
				incrementModuleLocked();
				triggerShake();

				return;
			}

			handleTouchLogic();
		},
		[handleTouchLogic, isSharedGrid, cell.module, triggerShake, incrementModuleLocked]
	);

	const handleTouchCancel = useCallback(() => {
		setIsTouching(false);
	}, []);

	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			const { superchargedFixed, gridFixed } = useGridStore.getState();

			if (isSharedGrid) {
				return;
			}

			// If the cell has a module, no interactions should change its state.
			if (cell.module) {
				incrementModuleLocked();
				triggerShake();

				return;
			}

			// Mouse-specific logic (Ctrl/Cmd + Click)
			if (event.ctrlKey || event.metaKey) {
				// Ctrl/Cmd + Click: Toggle Active
				if (gridFixed || (superchargedFixed && cell.supercharged)) {
					if (superchargedFixed && cell.supercharged) {
						incrementSuperchargedFixed();
					} else if (gridFixed) {
						incrementGridFixed();
					}

					triggerShake();
				} else {
					setTimeout(() => {
						startTransition(() => {
							toggleCellActive(rowIndex, columnIndex);
						});
					}, 0);
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
					if (totalSupercharged >= 4 && !cell.supercharged) {
						incrementSuperchargedLimit();
					} else if (superchargedFixed) {
						incrementSuperchargedFixed();
					} else if (rowIndex >= 4) {
						incrementRowLimit();
					}

					triggerShake();
				} else {
					setTimeout(() => {
						startTransition(() => {
							toggleCellSupercharged(rowIndex, columnIndex);
						});
					}, 0);
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
			incrementGridFixed,
			incrementModuleLocked,
			incrementRowLimit,
			incrementSuperchargedFixed,
			incrementSuperchargedLimit,
			triggerShake,
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
					incrementModuleLocked();
					triggerShake();

					return;
				}

				const { gridFixed } = useGridStore.getState();

				if (gridFixed) {
					incrementGridFixed();
					triggerShake();
				} else {
					setTimeout(() => {
						startTransition(() => {
							toggleCellActive(rowIndex, columnIndex);
						});
					}, 0);
				}
			}
		},
		[
			isSharedGrid,
			triggerShake,
			toggleCellActive,
			rowIndex,
			columnIndex,
			cell.module,
			incrementGridFixed,
			incrementModuleLocked,
		]
	);

	return {
		isTouching,
		handleClick,
		handleContextMenu,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleTouchCancel,
		handleKeyDown,
	};
};
