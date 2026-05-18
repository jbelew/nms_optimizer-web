import type { Cell } from "@/store/grid/gridStore";
import { useRef, useState, useTransition } from "react";

import { useLatest } from "@/hooks/useLatest/useLatest";
import { useSessionStore } from "@/store/app/sessionStore";
import { useShakeStore } from "@/store/app/shakeStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useInteractionStore } from "@/store/grid/interactionStore";
import { Logger } from "@/utils/system/monitoring";

const DOUBLE_TAP_THRESHOLD = 400; // ms

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
	const [_isPending, startTransition] = useTransition();

	// Use refs for values that change but shouldn't trigger callback recreations
	const cellRef = useLatest(cell);
	const isSharedGridRef = useLatest(isSharedGrid);

	// Refs to track gestures (scroll, zoom) vs taps
	const gestureStartRef = useRef<null | { x: number; y: number }>(null);
	const isGestureRef = useRef(false);

	/**
	 * Triggers a visual shake animation on the grid for feedback.
	 *
	 * @remarks
	 * Proxies to `ShakeStore` to trigger global UI feedback on invalid interactions.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @see {@link useShakeStore}
	 *
	 * @example Logic trigger
	 * ```ts
	 * triggerShake();
	 * ```
	 */
	const triggerShake = () => {
		useShakeStore.getState().triggerShake();
	};

	/**
	 * Internal logic for handling timed taps (single vs double).
	 *
	 * @remarks
	 * Implements a custom tap resolution engine to distinguish between:
	 * 1. **Single Tap**: Normal click behavior.
	 * 2. **Double Tap**: Supercharge toggle (useful for mobile).
	 * Includes validation against `gridFixed` and `superchargedFixed` states.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @category Logic
	 *
	 * @example Manual trigger
	 * ```ts
	 * handleTouchLogic();
	 * ```
	 */
	const handleTouchLogic = () => {
		const gridState = useGridStore.getState();
		const sessionState = useSessionStore.getState();
		const interactionState = useInteractionStore.getState();
		const latestCell = cellRef.current;

		const currentTime = Date.now();
		const timeSinceLastTap = currentTime - interactionState._lastTapTime;
		const isSameCell =
			interactionState._lastTapCell[0] === rowIndex &&
			interactionState._lastTapCell[1] === columnIndex;

		if (isSameCell && timeSinceLastTap < DOUBLE_TAP_THRESHOLD && timeSinceLastTap > 0) {
			// Double tap on the same cell - handled by handleCellDoubleTap which also resets lastTap
			const totalSupercharged = gridState.selectTotalSuperchargedCells();
			const isInvalidDoubleTap =
				gridState.superchargedFixed ||
				gridState.gridFixed ||
				rowIndex >= 4 ||
				(totalSupercharged >= 4 && !latestCell.supercharged);

			if (isInvalidDoubleTap) {
				if (totalSupercharged >= 4 && !latestCell.supercharged) {
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
					if (interactionState._initialCellStateForTap) {
						gridState.revertCellTap(
							rowIndex,
							columnIndex,
							interactionState._initialCellStateForTap
						);
					}

					interactionState.clearInteractionState();
				});
			} else {
				startTransition(() => {
					gridState.handleCellDoubleTap(rowIndex, columnIndex);
					interactionState.clearInteractionState();
				});
			}
		} else {
			// Single tap or tap on a different cell
			interactionState.setLastTap([rowIndex, columnIndex], currentTime);
			const isInvalidSingleTap =
				gridState.gridFixed || (gridState.superchargedFixed && latestCell.supercharged);

			if (isInvalidSingleTap) {
				if (gridState.superchargedFixed && latestCell.supercharged) {
					sessionState.incrementSuperchargedFixed();
				} else if (gridState.gridFixed) {
					sessionState.incrementGridFixed();
				}

				triggerShake();
				startTransition(() => {
					interactionState.setInitialCellStateForTap(null);
				});
			} else {
				startTransition(() => {
					interactionState.setInitialCellStateForTap({ ...latestCell });
					gridState.handleCellTap(rowIndex, columnIndex);
				});
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

		if (isSharedGridRef.current) return;

		if (cellRef.current.module) {
			useSessionStore.getState().incrementModuleLocked();
			triggerShake();

			return;
		}

		handleTouchLogic();
	};

	/**
	 * Resets the touch state when an interaction is canceled by the system.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example System cancellation
	 * ```tsx
	 * <div onTouchCancel={handleTouchCancel} />
	 * ```
	 */
	const handleTouchCancel = () => {
		setIsTouching(false);
	};

	/**
	 * Handles primary and modified mouse clicks.
	 *
	 * @remarks
	 * Distinguishes between:
	 * 1. **Ctrl/Cmd + Click**: Toggles active state.
	 * 2. **Normal Click**: Toggles supercharged state.
	 * Includes logging via `Logger` for state changes.
	 *
	 * @param {React.MouseEvent} event - The React click event.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Component registration
	 * ```tsx
	 * <div onClick={handleClick} />
	 * ```
	 */
	const handleClick = (event: React.MouseEvent) => {
		const gridState = useGridStore.getState();
		const sessionState = useSessionStore.getState();
		const latestCell = cellRef.current;

		const { gridFixed, superchargedFixed } = gridState;

		if (isSharedGridRef.current) {
			return;
		}

		// If the cell has a module, no interactions should change its state.
		if (latestCell.module) {
			sessionState.incrementModuleLocked();
			triggerShake();

			return;
		}

		// Mouse-specific logic (Ctrl/Cmd + Click)
		if (event.ctrlKey || event.metaKey) {
			// Ctrl/Cmd + Click: Toggle Active
			if (gridFixed || (superchargedFixed && latestCell.supercharged)) {
				if (superchargedFixed && latestCell.supercharged) {
					sessionState.incrementSuperchargedFixed();
				} else if (gridFixed) {
					sessionState.incrementGridFixed();
				}

				triggerShake();
			} else {
				Logger.info(`Cell active toggled: [${rowIndex}, ${columnIndex}]`, {
					active: !latestCell.active,
					columnIndex,
					rowIndex,
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
				(totalSupercharged >= 4 && !latestCell.supercharged);

			if (isInvalidSuperchargeToggle) {
				if (totalSupercharged >= 4 && !latestCell.supercharged) {
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
					supercharged: !latestCell.supercharged,
				});
				startTransition(() => {
					gridState.toggleCellSupercharged(rowIndex, columnIndex);
				});
			}
		}
	};

	/**
	 * Prevents the context menu from appearing during interactions.
	 *
	 * @remarks
	 * Standard behavior for the grid to prevent browser defaults from interfering
	 * with custom touch/long-press logic.
	 *
	 * @param {React.MouseEvent} event - The React context menu event.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Component registration
	 * ```tsx
	 * <div onContextMenu={handleContextMenu} />
	 * ```
	 */
	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
	};

	/**
	 * Manages keyboard-driven interactions for accessibility.
	 *
	 * @remarks
	 * Maps Space and Enter keys to the `toggleCellActive` action, ensuring
	 * full grid interactability for screen readers and keyboard-only users.
	 *
	 * @param {React.KeyboardEvent} event - The React keyboard event.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example Component registration
	 * ```tsx
	 * <div onKeyDown={handleKeyDown} />
	 * ```
	 */
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			if (isSharedGridRef.current) return;

			if (cellRef.current.module) {
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
				startTransition(() => {
					gridState.toggleCellActive(rowIndex, columnIndex);
				});
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
