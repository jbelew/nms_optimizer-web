import { useTransition } from "react";

import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useShakeStore } from "@/store/ui/uiStore";

/**
 * Manages the optimization and reset lifecycle of a technology.
 *
 * @remarks
 * This hook provides high-level event handlers that orchestrate interactions
 * between multiple stores:
 * 1. Resetting a technology's presence in the grid via {@link useGridStore}.
 * 2. Clearing solved efficiency bonuses in {@link useTechStore}.
 * 3. Triggering the solver while ensuring the grid isn't full.
 * 4. Providing visual feedback (shake) via {@link useShakeStore} if optimization is blocked.
 *
 * @param {string} tech - The unique technology identifier (e.g., 'shield').
 * @param {function(string): Promise<void>} handleOptimize - The core async function to run the solve.
 * @param {boolean} isGridFull - Flag indicating if the grid has no more available slots.
 * @param {boolean} hasTechInGrid - Flag indicating if the tech is currently placed.
 *
 * @returns {object} Handlers for optimization and reset UI actions.
 * @returns {Function} returns.handleOptimizeClick - Initiates the optimization process.
 * @returns {Function} returns.handleReset - Clears the technology from the grid and resets bonuses.
 * @returns {boolean} returns.isResetting - Whether a reset transition is currently pending.
 *
 * @see {@link useGridStore} for grid layout state.
 * @see {@link useShakeStore} for error feedback.
 * @see {@link useTechStore} for technology bonus data.
 * @see {@link ./useTechOptimization.test.ts Unit Tests}
 *
 * @hook
 *
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
	 * @remarks
	 * Uses `useTransition` to ensure the reset operation doesn't block the UI thread.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```tsx
	 * handleReset();
	 * ```
	 */
	const handleReset = () => {
		performance.mark("reset-start");
		startResetTransition(() => {
			handleResetGridTech(tech);
			clearTechMaxBonus(tech);
			clearTechSolvedBonus(tech);
		});
		performance.mark("reset-end");
		performance.measure("reset-duration", "reset-start", "reset-end");
	};

	/**
	 * Prepares the grid state and initiates the solver run.
	 *
	 * @remarks
	 * If the grid is full and the technology isn't already placed, it triggers
	 * a shake animation instead of starting the solver.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```tsx
	 * handleOptimizeClick();
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
