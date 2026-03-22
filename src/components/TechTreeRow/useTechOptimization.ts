import { useTransition } from "react";

import { useGridStore } from "@/store/GridStore";
import { useShakeStore } from "@/store/ShakeStore";
import { useTechStore } from "@/store/TechStore";

/**
 * Custom hook for managing the optimization and reset lifecycle of a single technology.
 *
 * @remarks
 * It provides high-level event handlers that interact with multiple stores.
 * Specifically, it handles the logic for:
 * 1. Resetting a technology's presence in the grid and its solved status.
 * 2. Triggering the solver while ensuring the grid is in a valid state (e.g., not full).
 * 3. Providing visual feedback (shake) if an optimization is attempted on a full grid.
 *
 * @param {string} tech - The unique technology identifier. **Must be valid.**
 * @param {function(string): Promise<void>} handleOptimize - The core async function to run the solve.
 * @param {boolean} isGridFull - Flag indicating if the grid has no more available slots.
 * @param {boolean} hasTechInGrid - Flag indicating if the tech is currently placed.
 * @returns {object} Handlers for optimization and reset UI actions.
 *
 * @see {@link ../../../store/GridStore.ts useGridStore}
 * @see {@link ../../../store/ShakeStore.ts useShakeStore}
 * @see {@link ../../../store/TechStore.ts useTechStore}
 * @see {@link ./useTechOptimization.test.ts Unit Tests}
 * @hook
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { handleOptimizeClick } = useTechOptimization("shield", solveFn, false, true);
 * ```
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

	/**
	 * Clears the technology from the grid and resets its efficiency scores.
	 *
	 * @example
	 * ```tsx
	 * handleReset();
	 * // returns void, side-effect: clears tech from grid and resets bonuses
	 * ```
	 */
	const handleReset = () => {
		startResetTransition(() => {
			handleResetGridTech(tech);
			clearTechMaxBonus(tech);
			clearTechSolvedBonus(tech);
		});
	};

	/**
	 * Prepares the grid state and initiates the solver run.
	 *
	 * @example
	 * ```tsx
	 * handleOptimizeClick();
	 * // returns void, side-effect: resets state and calls handleOptimize
	 * ```
	 */
	const handleOptimizeClick = () => {
		if (isGridFull && !hasTechInGrid) {
			triggerShake();
		} else {
			// We need to reset everything before optimizing
			handleReset();
			handleOptimize(tech);
		}
	};

	return { handleOptimizeClick, handleReset, isResetting };
};
