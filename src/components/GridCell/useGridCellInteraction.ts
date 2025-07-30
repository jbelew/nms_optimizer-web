import type { Cell } from "../../store/GridStore";
import { useCallback, useRef, useState } from "react";

import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";

export const useGridCellInteraction = (
	cell: Cell,
	rowIndex: number,
	columnIndex: number,
	isSharedGrid: boolean
) => {
	const handleCellTap = useGridStore((state) => state.handleCellTap);
	const handleCellDoubleTap = useGridStore((state) => state.handleCellDoubleTap);
	const revertCellTap = useGridStore((state) => state.revertCellTap);
	const totalSupercharged = useGridStore((state) => state.selectTotalSuperchargedCells());
	const superchargedFixed = useGridStore((state) => state.superchargedFixed);
	const gridFixed = useGridStore((state) => state.gridFixed);
	const [isTouching, setIsTouching] = useState(false);

	const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { setShaking } = useShakeStore();

	const lastTapTime = useRef(0);

	const handleTouchStart = useCallback(() => {
		setIsTouching(true);
	}, []);

	const handleTouchEnd = useCallback(() => {
		setIsTouching(false);
	}, []);

	const triggerShake = useCallback(() => {
		setShaking(true);
		console.log("Shaking triggered.");
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
				console.log("handleClick: isSharedGrid is true, returning.");
				return;
			}

			const handleTap = () => {
				const currentTime = new Date().getTime();
				const timeSinceLastTap = currentTime - lastTapTime.current;

				if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
					// Double tap
					if (superchargedFixed) {
						console.log("Double tap: superchargedFixed is true. Triggering shake and reverting.");
						triggerShake();
						revertCellTap(rowIndex, columnIndex);
					} else if (gridFixed || (totalSupercharged >= 4 && !cell.supercharged)) {
						console.log(
							"Double tap: gridFixed or 4 supercharged limit reached. Triggering shake and reverting."
						);
						triggerShake();
						revertCellTap(rowIndex, columnIndex);
					} else {
						console.log("Double tap: valid, calling handleCellDoubleTap.");
						handleCellDoubleTap(rowIndex, columnIndex);
					}
					lastTapTime.current = 0; // Reset after double tap
				} else {
					// Single tap
					if (gridFixed || (superchargedFixed && cell.supercharged)) {
						console.log(
							"Single tap: gridFixed or superchargedFixed on supercharged cell. Triggering shake."
						);
						triggerShake();
					} else {
						console.log("Single tap: Valid. Calling handleCellTap.");
						handleCellTap(rowIndex, columnIndex);
					}
					lastTapTime.current = currentTime;
				}
			};

			handleTap();
		},
		[
			isSharedGrid,
			rowIndex,
			columnIndex,
			handleCellTap,
			handleCellDoubleTap,
			revertCellTap,
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
				handleClick(event as unknown as React.MouseEvent);
			}
		},
		[handleClick]
	);

	return {
		isTouching,
		handleClick,
		handleContextMenu,
		handleKeyDown,
		handleTouchStart,
		handleTouchEnd,
	};
};
