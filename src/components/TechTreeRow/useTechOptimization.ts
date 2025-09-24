import { useCallback } from "react";

import { useGridStore } from "@/store/GridStore";
import { useShakeStore } from "@/store/ShakeStore";
import { useTechStore } from "@/store/TechStore";

/**
 * Custom hook for managing the optimization logic for a technology.
 *
 * @param tech - The technology identifier.
 * @param handleOptimize - The async function to call when optimizing.
 * @param isGridFull - Boolean indicating if the grid is full.
 * @param hasTechInGrid - Boolean indicating if the tech is already in the grid.
 * @returns An object containing the `handleOptimizeClick` and `handleReset` functions.
 */
export const useTechOptimization = (
	tech: string,
	handleOptimize: (tech: string) => Promise<void>,
	isGridFull: boolean,
	hasTechInGrid: boolean
) => {
	const handleResetGridTech = useGridStore((state) => state.resetGridTech);
	const { clearTechMaxBonus, clearTechSolvedBonus } = useTechStore();
	const { setShaking } = useShakeStore();

	const handleReset = useCallback(() => {
		handleResetGridTech(tech);
		clearTechMaxBonus(tech);
		clearTechSolvedBonus(tech);
	}, [tech, handleResetGridTech, clearTechMaxBonus, clearTechSolvedBonus]);

	const handleOptimizeClick = useCallback(async () => {
		if (isGridFull && !hasTechInGrid) {
			setShaking(true);
			setTimeout(() => {
				setShaking(false);
			}, 500);
		} else {
			// We need to reset everything before optimizing
			handleReset();
			await handleOptimize(tech);
		}
	}, [
		isGridFull,
		hasTechInGrid,
		setShaking,
		handleReset,
		handleOptimize,
		tech,
	]);

	return { handleOptimizeClick, handleReset };
};
