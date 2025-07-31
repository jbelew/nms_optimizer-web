import type { Cell, GridStore } from "../../store/GridStore";
import { useCallback, useRef, useState } from "react";

import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";

// DEV FLAG: Set to true to make mouse clicks behave like touch taps for testing.
const MOUSE_AS_TAP_ENABLED = false;

export const useGridCellInteraction = (
	cell: Cell,
	rowIndex: number,
	columnIndex: number,
	isSharedGrid: boolean
) => {
	const handleCellTap = useGridStore((state: GridStore) => state.handleCellTap);
	const handleCellDoubleTap = useGridStore((state: GridStore) => state.handleCellDoubleTap);
	const revertCellTap = useGridStore((state: GridStore) => state.revertCellTap);
	const clearInitialCellStateForTap = useGridStore(
		(state: GridStore) => state.clearInitialCellStateForTap
	);
	const toggleCellActive = useGridStore((state: GridStore) => state.toggleCellActive);
	const toggleCellSupercharged = useGridStore((state: GridStore) => state.toggleCellSupercharged);
	const totalSupercharged = useGridStore((state: GridStore) =>
		state.selectTotalSuperchargedCells()
	);
	const superchargedFixed = useGridStore((state: GridStore) => state.superchargedFixed);
	const gridFixed = useGridStore((state: GridStore) => state.gridFixed);
	const [isTouching, setIsTouching] = useState(false);

	const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { setShaking } = useShakeStore();

	const lastTapTime = useRef(0);
	const isTouchInteraction = useRef(false);

	const handleTouchStart = useCallback(() => {
		isTouchInteraction.current = true;
		setIsTouching(true);
	}, []);

	const handleTouchEnd = useCallback(() => {
		setIsTouching(false);
		// Reset after a short delay. onClick fires after onTouchEnd.
		setTimeout(() => {
			isTouchInteraction.current = false;
		}, 200);
	}, []);

	const triggerShake = useCallback(() => {
		setShaking(true);
		if (shakeTimeoutRef.current) {
			clearTimeout(shakeTimeoutRef.current);
		}
		shakeTimeoutRef.current = setTimeout(() => {
			setShaking(false);
			shakeTimeoutRef.current = null;
		}, 500);
	}, [setShaking]);

	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			if (isSharedGrid) {
				return;
			}

			// Mouse-specific logic
			if (!isTouchInteraction.current && !MOUSE_AS_TAP_ENABLED) {
				if (event.ctrlKey || event.metaKey) {
					// Ctrl/Cmd + Click: Toggle Active
					if (gridFixed) {
						triggerShake();
					} else {
						toggleCellActive(rowIndex, columnIndex);
					}
				} else {
					// Normal Click: Toggle Supercharged
					const isInvalidSuperchargeToggle =
						superchargedFixed || gridFixed || (totalSupercharged >= 4 && !cell.supercharged);
					if (isInvalidSuperchargeToggle) {
						triggerShake();
					} else {
						toggleCellSupercharged(rowIndex, columnIndex);
					}
				}
				return;
			}

			// Touch-specific logic (single/double tap)
			const currentTime = new Date().getTime();
			const timeSinceLastTap = currentTime - lastTapTime.current;

			if (timeSinceLastTap < 500 && timeSinceLastTap > 0) {
				// Double tap
				lastTapTime.current = 0; // Reset after double tap
				const isInvalidDoubleTap =
					superchargedFixed || gridFixed || (totalSupercharged >= 4 && !cell.supercharged);

				if (isInvalidDoubleTap) {
					triggerShake();
					revertCellTap(rowIndex, columnIndex);
				} else {
					handleCellDoubleTap(rowIndex, columnIndex);
				}
			} else {
				// Single tap
				lastTapTime.current = currentTime;
				const isInvalidSingleTap = gridFixed || (superchargedFixed && cell.supercharged);
				if (isInvalidSingleTap) {
					triggerShake();
					clearInitialCellStateForTap();
				} else {
					handleCellTap(rowIndex, columnIndex);
				}
			}
		},
		[
			isSharedGrid,
			rowIndex,
			columnIndex,
			handleCellTap,
			handleCellDoubleTap,
			revertCellTap,
			clearInitialCellStateForTap,
			toggleCellActive,
			toggleCellSupercharged,
			totalSupercharged,
			cell.supercharged,
			triggerShake,
			gridFixed,
			superchargedFixed,
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

				if (gridFixed) {
					triggerShake();
				} else {
					toggleCellActive(rowIndex, columnIndex);
				}
			}
		},
		[isSharedGrid, gridFixed, triggerShake, toggleCellActive, rowIndex, columnIndex]
	);

	return {
		isTouching,
		handleClick,
		handleContextMenu,
		handleTouchStart,
		handleTouchEnd,
		handleKeyDown,
	};
};
