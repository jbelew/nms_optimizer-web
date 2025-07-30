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
		if (shakeTimeoutRef.current) {
			clearTimeout(shakeTimeoutRef.current);
		}
		shakeTimeoutRef.current = setTimeout(() => {
			setShaking(false);
			shakeTimeoutRef.current = null;
		}, 500);
	}, [setShaking]);

	const handleClick = useCallback(
		() => {
			if (isSharedGrid) {
				return;
			}

			const handleTap = () => {
				const currentTime = new Date().getTime();
				const timeSinceLastTap = currentTime - lastTapTime.current;

				if (timeSinceLastTap < 500 && timeSinceLastTap > 0) {
					// Double tap
					if (superchargedFixed) {
						triggerShake();
						revertCellTap(rowIndex, columnIndex);
					} else if (gridFixed || (totalSupercharged >= 4 && !cell.supercharged)) {
						triggerShake();
						revertCellTap(rowIndex, columnIndex);
					} else {
						handleCellDoubleTap(rowIndex, columnIndex);
					}
					lastTapTime.current = 0; // Reset after double tap
				} else {
					// Single tap
					if (gridFixed || (superchargedFixed && cell.supercharged)) {
						triggerShake();
					} else {
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
				handleClick();
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
