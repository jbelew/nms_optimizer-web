import type { Cell } from "../../store/GridStore";
import { useCallback, useRef, useState, useTransition } from "react";

import { useGridStore } from "../../store/GridStore";
import { useSessionStore } from "../../store/SessionStore";
import { useShakeStore } from "../../store/ShakeStore";
import { Logger } from "../../utils/logger";

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
	const [isTouching, setIsTouching] = useState(false);
	const [_isPending, startTransition] = useTransition();

	// Refs to track gestures (scroll, zoom) vs taps
	const gestureStartRef = useRef<{ x: number; y: number } | null>(null);
	const isGestureRef = useRef(false);

	/**
	 * Triggers a visual shake animation on the grid.
	 * Calls the `triggerShake` action from the ShakeStore directly to avoid subscription.
	 */
	const triggerShake = useCallback(() => {
		useShakeStore.getState().triggerShake();
	}, []);

	const handleTouchLogic = useCallback(() => {
		const gridState = useGridStore.getState();
		const sessionState = useSessionStore.getState();

		const currentTime = new Date().getTime();
		const timeSinceLastTap = currentTime - lastTapInfo.time;
		const isSameCell = lastTapInfo.cell[0] === rowIndex && lastTapInfo.cell[1] === columnIndex;

		if (isSameCell && timeSinceLastTap < DOUBLE_TAP_THRESHOLD && timeSinceLastTap > 0) {
			// Double tap on the same cell
			lastTapInfo = { time: 0, cell: [-1, -1] }; // Reset after double tap
			const totalSupercharged = gridState.selectTotalSuperchargedCells();
			const isInvalidDoubleTap =
				gridState.superchargedFixed ||
				gridState.gridFixed ||
				rowIndex >= 4 ||
				(totalSupercharged >= 4 && !cell.supercharged);

			if (isInvalidDoubleTap) {
				if (totalSupercharged >= 4 && !cell.supercharged) {
					sessionState.incrementSuperchargedLimit();
				} else if (gridState.superchargedFixed) {
					sessionState.incrementSuperchargedFixed();
				} else if (gridState.gridFixed) {
					sessionState.incrementGridFixed();
				} else if (rowIndex >= 4) {
					sessionState.incrementRowLimit();
				}

				triggerShake();
				startTransition(() => {
					gridState.revertCellTap(rowIndex, columnIndex);
				});
			} else {
				startTransition(() => {
					gridState.handleCellDoubleTap(rowIndex, columnIndex);
				});
			}
		} else {
			// Single tap or tap on a different cell
			lastTapInfo = { time: currentTime, cell: [rowIndex, columnIndex] };
			const isInvalidSingleTap =
				gridState.gridFixed || (gridState.superchargedFixed && cell.supercharged);

			if (isInvalidSingleTap) {
				if (gridState.superchargedFixed && cell.supercharged) {
					sessionState.incrementSuperchargedFixed();
				} else if (gridState.gridFixed) {
					sessionState.incrementGridFixed();
				}

				triggerShake();
				startTransition(() => {
					gridState.clearInitialCellStateForTap();
				});
			} else {
				startTransition(() => {
					gridState.handleCellTap(rowIndex, columnIndex);
				});
			}
		}
	}, [cell.supercharged, columnIndex, rowIndex, triggerShake]);

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
				useSessionStore.getState().incrementModuleLocked();
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
			const gridState = useGridStore.getState();
			const sessionState = useSessionStore.getState();

			const { superchargedFixed, gridFixed } = gridState;

			if (isSharedGrid) {
				return;
			}

			// If the cell has a module, no interactions should change its state.
			if (cell.module) {
				sessionState.incrementModuleLocked();
				triggerShake();

				return;
			}

			// Mouse-specific logic (Ctrl/Cmd + Click)
			if (event.ctrlKey || event.metaKey) {
				// Ctrl/Cmd + Click: Toggle Active
				if (gridFixed || (superchargedFixed && cell.supercharged)) {
					if (superchargedFixed && cell.supercharged) {
						sessionState.incrementSuperchargedFixed();
					} else if (gridFixed) {
						sessionState.incrementGridFixed();
					}

					triggerShake();
				} else {
					Logger.info(`Cell active toggled: [${rowIndex}, ${columnIndex}]`, {
						rowIndex,
						columnIndex,
						active: !cell.active,
					});
					startTransition(() => {
						gridState.toggleCellActive(rowIndex, columnIndex);
					});
				}
			} else {
				// Normal Click: Toggle Supercharged
				const totalSupercharged = gridState.selectTotalSuperchargedCells();
				const isInvalidSuperchargeToggle =
					superchargedFixed ||
					gridFixed ||
					rowIndex >= 4 ||
					(totalSupercharged >= 4 && !cell.supercharged);

				if (isInvalidSuperchargeToggle) {
					if (totalSupercharged >= 4 && !cell.supercharged) {
						sessionState.incrementSuperchargedLimit();
					} else if (superchargedFixed) {
						sessionState.incrementSuperchargedFixed();
					} else if (rowIndex >= 4) {
						sessionState.incrementRowLimit();
					}

					triggerShake();
				} else {
					Logger.info(`Cell supercharged toggled: [${rowIndex}, ${columnIndex}]`, {
						rowIndex,
						columnIndex,
						supercharged: !cell.supercharged,
					});
					startTransition(() => {
						gridState.toggleCellSupercharged(rowIndex, columnIndex);
					});
				}
			}
		},
		[
			isSharedGrid,
			rowIndex,
			columnIndex,
			cell.supercharged,
			cell.active,
			cell.module,
			triggerShake,
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
					useSessionStore.getState().incrementModuleLocked();
					triggerShake();

					return;
				}

				const gridState = useGridStore.getState();
				const { gridFixed } = gridState;

				if (gridFixed) {
					useSessionStore.getState().incrementGridFixed();
					triggerShake();
				} else {
					setTimeout(() => {
						startTransition(() => {
							gridState.toggleCellActive(rowIndex, columnIndex);
						});
					}, 0);
				}
			}
		},
		[isSharedGrid, triggerShake, rowIndex, columnIndex, cell.module]
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
