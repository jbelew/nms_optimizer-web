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
	const toggleCellActive = useGridStore((state) => state.toggleCellActive);
	const toggleCellSupercharged = useGridStore((state) => state.toggleCellSupercharged);
	const totalSupercharged = useGridStore((state) => state.selectTotalSuperchargedCells());
	const superchargedFixed = useGridStore((state) => state.superchargedFixed);
	const gridFixed = useGridStore((state) => state.gridFixed);
	const [isTouching, setIsTouching] = useState(false);

	const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const { setShaking } = useShakeStore();

	const lastTapTime = useRef(0);
	const isTouchDevice = useRef(
		typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
	);

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
		(event: React.MouseEvent) => {
			if (isSharedGrid) {
				return;
			}

			const handleSuperchargeToggle = () => {
				if (superchargedFixed) {
					triggerShake();
					return;
				}
				if (totalSupercharged >= 4 && !cell.supercharged) {
					triggerShake();
					return;
				}
				toggleCellSupercharged(rowIndex, columnIndex);
			};

			const handleActiveToggle = () => {
				if (gridFixed) {
					triggerShake();
					return;
				}
				toggleCellActive(rowIndex, columnIndex);
			};

			const handleTap = () => {
				const currentTime = new Date().getTime();
				const timeSinceLastTap = currentTime - lastTapTime.current;

				if (timeSinceLastTap < 500 && timeSinceLastTap > 0) {
					handleActiveToggle();
					handleSuperchargeToggle();
					lastTapTime.current = 0;
				} else {
					handleActiveToggle();
					lastTapTime.current = currentTime;
				}
			};

			const handleMouseClick = () => {
				if (event.ctrlKey || event.metaKey) {
					handleActiveToggle();
				} else {
					handleSuperchargeToggle();
				}
			};

			if (isTouchDevice.current) {
				handleTap();
			} else {
				handleMouseClick();
			}
		},
		[
			isSharedGrid,
			toggleCellActive,
			rowIndex,
			columnIndex,
			totalSupercharged,
			cell.supercharged,
			toggleCellSupercharged,
			superchargedFixed,
			gridFixed,
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
