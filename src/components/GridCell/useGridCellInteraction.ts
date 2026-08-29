import type { Cell } from "@/store/grid/gridStore";
import { useRef, useState } from "react";

import { useGridStore } from "@/store/grid/gridStore";

/**
 * Custom hook for managing browser/DOM interactions with an individual grid cell.
 *
 * @remarks
 * Acts as a thin DOM adapter that routes raw mouse, touch, and keyboard events
 * directly to the store actions.
 *
 * @param {Cell} cell - The current data model for the cell.
 * @param {number} rowIndex - The 0-based row index of the cell.
 * @param {number} columnIndex - The 0-based column index of the cell.
 * @param {boolean} isSharedGrid - Whether the grid is in read-only/shared mode.
 *
 * @returns {object} Interaction flags and event handlers.
 * @returns {boolean} returns.isTouching - Active touch state for visual feedback.
 * @returns {function} returns.handleClick - Desktop mouse click handler.
 * @returns {function} returns.handleContextMenu - Prevents default context menu.
 * @returns {function} returns.handleKeyDown - Keyboard accessibility handler.
 * @returns {function} returns.handleTouchCancel - Touch cancellation handler.
 * @returns {function} returns.handleTouchEnd - Touch end gesture translator.
 * @returns {function} returns.handleTouchMove - Touch movement tracker.
 * @returns {function} returns.handleTouchStart - Touch start detector.
 *
 * @see {@link useGridStore} for store-level validations and transactions.
 * @see {@link ./useGridCellInteraction.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
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
	 * Records the start of a touch interaction.
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
	 * Finalizes a touch interaction and dispatches the event to the store.
	 */
	const handleTouchEnd = (event: React.MouseEvent | React.TouchEvent) => {
		setIsTouching(false);

		// If it was a gesture (scroll/zoom), ignore the tap
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
		useGridStore.getState().registerCellTap(rowIndex, columnIndex, currentTime);
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
		if (isSharedGrid) {
			return;
		}

		const gridState = useGridStore.getState();

		// Mouse-specific logic (Ctrl/Cmd + Click)
		if (event.ctrlKey || event.metaKey) {
			// Ctrl/Cmd + Click: Toggle Active
			gridState.toggleCellActive(rowIndex, columnIndex);
		} else {
			// Normal Click: Toggle Supercharged
			gridState.toggleCellSupercharged(rowIndex, columnIndex);
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

			useGridStore.getState().toggleCellActive(rowIndex, columnIndex);
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
