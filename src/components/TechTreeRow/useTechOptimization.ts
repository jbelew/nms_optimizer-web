import { useCallback, useTransition } from "react";

import { useGridStore } from "@/store/GridStore";
import { useShakeStore } from "@/store/ShakeStore";
import { useTechStore } from "@/store/TechStore";

/**
 * Manages the optimization and reset logic for a technology.
 * It handles interactions with the grid, tech, and shake stores, and provides
 * callbacks for optimizing or resetting a technology's state.
 *
 * @param tech - The unique identifier for the technology.
 * @param handleOptimize - The async function passed from the parent to run the optimization.
 * @param isGridFull - Boolean indicating if the grid is currently full.
 * @param hasTechInGrid - Boolean indicating if the technology is already placed in the grid.
 * @returns An object containing the handlers for optimization and reset actions.
 * @property {() => Promise<void>} handleOptimizeClick - The callback to trigger an optimization.
 * @property {() => void} handleReset - The callback to reset the technology's state in the grid.
 */
export const useTechOptimization = (
	tech: string,
	handleOptimize: (tech: string) => Promise<void>,
	isGridFull: boolean,
	hasTechInGrid: boolean
) => {
	const handleResetGridTech = useGridStore((state) => state.resetGridTech);
	const clearTechMaxBonus = useTechStore((state) => state.clearTechMaxBonus);
	const clearTechSolvedBonus = useTechStore((state) => state.clearTechSolvedBonus);
	const { triggerShake } = useShakeStore();
	const [isResetting, startResetTransition] = useTransition();

	const handleReset = useCallback(() => {
		startResetTransition(() => {
			handleResetGridTech(tech);
			clearTechMaxBonus(tech);
			clearTechSolvedBonus(tech);
		});
	}, [tech, handleResetGridTech, clearTechMaxBonus, clearTechSolvedBonus, startResetTransition]);

	const handleOptimizeClick = useCallback(() => {
		if (isGridFull && !hasTechInGrid) {
			triggerShake();
		} else {
			// We need to reset everything before optimizing
			handleReset();
			handleOptimize(tech);
		}
	}, [isGridFull, hasTechInGrid, triggerShake, handleReset, handleOptimize, tech]);

	return { handleOptimizeClick, handleReset, isResetting };
};
