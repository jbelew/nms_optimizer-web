import type { Cell } from "@/store/grid/gridStore";
import { useRef, useState } from "react";

import { UI_TIMING } from "@/constants";
import { useGridStore } from "@/store/grid/gridStore";
import { useInteractionStore } from "@/store/grid/interactionStore";
import { useSessionStore, useShakeStore } from "@/store/ui/uiStore";
import { Logger } from "@/utils/system/monitoring";

/**
 * Custom hook for managing complex user interactions with an individual grid cell.
 *
 * @remarks
 * Orchestrates mouse, touch, and keyboard events into grid actions.
 * Specialized for mobile gesture detection (taps vs scrolls) and desktop shortcuts.
 * Actions are validated against grid constraints (e.g., supercharge limits)
 * before being dispatched to the `GridStore`.
 *
 * @param {Cell} cell - The current data model for the cell.
 * @param {number} rowIndex - The row index of the cell (0-based).
 * @param {number} columnIndex - The column index of the cell (0-based).
 * @param {boolean} isSharedGrid - Flag for read-only mode.
 *
 * @returns {object} Interaction flags and event handlers for the cell component.
 *
 * @see {@link useGridStore}
 * @see {@link useSessionStore}
 * @see {@link useShakeStore}
 * @see {@link useInteractionStore}
 * @see {@link ./useGridCellInteraction.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Usage in a component
 * ```tsx
 * const handlers = useGridCellInteraction(cell, 0, 5, false);
 * ```
 */
export const useGridCellInteraction = (
	cell: Cell,
	rowIndex: number,
	columnIndex: number,
	isSharedGrid: boolean
) => {
	const [isTouching, setIsTouching] = useState(false);

	// Refs to track gestures (scroll, zoom) vs taps
	const gestureStartRef = useRef<null | { x: number; y: number }>(null);
	const isGestureRef = useRef(false);

	/**
	 * Triggers a visual shake animation on the grid for feedback.
	 */
	const triggerShake = () => {
		useShakeStore.getState().triggerShake();
	};

	/**
	 * Internal logic for handling timed taps (single vs double).
	 */
	const handleTouchLogic = () => {
		const gridState = useGridStore.getState();
		const sessionState = useSessionStore.getState();
		const interactionState = useInteractionStore.getState();

		const currentTime = Date.now();
		const timeSinceLastTap = currentTime - interactionState._lastTapTime;
		const isSameCell =
			interactionState._lastTapCell[0] === rowIndex &&
			interactionState._lastTapCell[1] === columnIndex;

		if (
			isSameCell &&
			timeSinceLastTap < UI_TIMING.DOUBLE_TAP_THRESHOLD &&
			timeSinceLastTap > 0
		) {
			// Double tap on the same cell
			const totalSupercharged = gridState.totalSuperchargedCells;
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

				if (interactionState._initialCellStateForTap) {
					gridState.revertCellTap(
						rowIndex,
						columnIndex,
						interactionState._initialCellStateForTap
					);
				}

				interactionState.clearInteractionState();
			} else {
				// FIX: Revert the first tap's effects before applying double tap logic
				if (interactionState._initialCellStateForTap) {
					gridState.revertCellTap(
						rowIndex,
						columnIndex,
						interactionState._initialCellStateForTap
					);
				}

				gridState.handleCellDoubleTap(rowIndex, columnIndex);
				interactionState.clearInteractionState();
			}
		} else {
			// Single tap
			interactionState.setLastTap([rowIndex, columnIndex], currentTime);
			const isInvalidSingleTap =
				gridState.gridFixed || (gridState.superchargedFixed && cell.supercharged);

			if (isInvalidSingleTap) {
				if (gridState.superchargedFixed && cell.supercharged) {
					sessionState.incrementSuperchargedFixed();
				} else if (gridState.gridFixed) {
					sessionState.incrementGridFixed();
				}

				triggerShake();
				interactionState.setInitialCellStateForTap(null);
			} else {
				interactionState.setInitialCellStateForTap({ ...cell });
				gridState.handleCellTap(rowIndex, columnIndex);
			}
		}
	};

	/**
	 * Records the start of a touch interaction.
	 *
	 * @remarks
	 * Tracks initial coordinates and checks for multi-finger gestures to prevent
	 * unintended taps during zooming or scrolling.
	 *
	 * @param {React.TouchEvent} event - The React touch start event.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Component registration
	 * ```tsx
	 * <div onTouchStart={handleTouchStart} />
	 * ```
	 */
	const handleTouchStart = (event: React.TouchEvent) => {
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
	};

	/**
	 * Tracks movement to distinguish between a tap and a scroll gesture.
	 *
	 * @remarks
	 * Compares current touch coordinates to `gestureStartRef`. If movement
	 * exceeds 10px, the interaction is marked as a gesture (`isGestureRef`).
	 *
	 * @param {React.TouchEvent} event - The React touch move event.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Component registration
	 * ```tsx
	 * <div onTouchMove={handleTouchMove} />
	 * ```
	 */
	const handleTouchMove = (event: React.TouchEvent) => {
		if (isGestureRef.current || !gestureStartRef.current) return;

		const x = event.touches[0].clientX;
		const y = event.touches[0].clientY;
		const dx = Math.abs(x - gestureStartRef.current.x);
		const dy = Math.abs(y - gestureStartRef.current.y);

		// If moved more than 10px, treat as scroll/gesture
		if (dx > 10 || dy > 10) {
			isGestureRef.current = true;
		}
	};

	/**
	 * Finalizes a touch interaction and triggers tap logic if no movement was detected.
	 *
	 * @remarks
	 * Prevents default behavior (e.g., ghost clicks) and validates if the cell
	 * is part of a static module before processing the tap.
	 *
	 * @param {React.TouchEvent | React.MouseEvent} event - The React event finalizing interaction.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Component registration
	 * ```tsx
	 * <div onTouchEnd={handleTouchEnd} />
	 * ```
	 */
	const handleTouchEnd = (event: React.MouseEvent | React.TouchEvent) => {
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
	};

	/**
	 * Resets the touch state when an interaction is canceled by the system.
	 */
	const handleTouchCancel = () => {
		setIsTouching(false);
	};

	/**
	 * Handles primary and modified mouse clicks.
	 */
	const handleClick = (event: React.MouseEvent) => {
		const gridState = useGridStore.getState();
		const sessionState = useSessionStore.getState();

		const { gridFixed, superchargedFixed } = gridState;

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
					active: !cell.active,
					columnIndex,
					rowIndex,
				});
				gridState.toggleCellActive(rowIndex, columnIndex);
			}
		} else {
			// Normal Click: Toggle Supercharged
			const totalSupercharged = gridState.totalSuperchargedCells;
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
					columnIndex,
					rowIndex,
					supercharged: !cell.supercharged,
				});
				gridState.toggleCellSupercharged(rowIndex, columnIndex);
			}
		}
	};

	/**
	 * Prevents the context menu from appearing during interactions.
	 */
	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
	};

	/**
	 * Manages keyboard-driven interactions for accessibility.
	 */
	const handleKeyDown = (event: React.KeyboardEvent) => {
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
				gridState.toggleCellActive(rowIndex, columnIndex);
			}
		}
	};

	return {
		handleClick,
		handleContextMenu,
		handleKeyDown,
		handleTouchCancel,
		handleTouchEnd,
		handleTouchMove,
		handleTouchStart,
		isTouching,
	};
};
