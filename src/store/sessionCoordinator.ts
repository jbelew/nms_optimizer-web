import type { ApiResponse, Grid } from "./grid/gridStore";
import type { BonusStatusData } from "./tech/techBonusStore";

import { useGridStore } from "./grid/gridStore";
import { useInteractionStore } from "./grid/interactionStore";
import { useModuleSelectionStore } from "./tech/moduleSelectionStore";
import { useTechBonusStore } from "./tech/techBonusStore";
import { useTechStore } from "./tech/techStore";

/**
 * Orchestrates the calculation of bonus status data based on max bonus.
 *
 * @param {number} maxBonus - The maximum bonus value to evaluate.
 *
 * @returns {BonusStatusData} The calculated icon and percentage.
 *
 * @internal
 */
export function computeBonusStatus(maxBonus: number): BonusStatusData {
	const roundedMaxBonus = Math.round(maxBonus * 100) / 100;

	if (roundedMaxBonus < 100) {
		const percent = Math.round((100 - roundedMaxBonus) * 100) / 100;

		return { icon: "warning", percent };
	}

	if (roundedMaxBonus === 100) {
		return { icon: "check", percent: 0 };
	}

	const percent = Math.round((roundedMaxBonus - 100) * 100) / 100;

	return { icon: "lightning", percent };
}

/**
 * Orchestrator for multi-store state transactions.
 *
 * @remarks
 * This module centralizes actions that affect multiple stores simultaneously,
 * such as resetting a session or switching platforms. This prevents stores
 * from having "shotgun coupling" where they need to know about each other's
 * internals.
 *
 * @category State
 */
export const sessionCoordinator = {
	/**
	 * Commits the results of an optimization solve to the relevant stores.
	 *
	 * Updates both the grid layout and the tech-specific bonus/method metadata.
	 *
	 * @param {ApiResponse} data - The optimization result from the engine.
	 * @param {string} tech - The unique technology identifier (e.g., 'pulse').
	 */
	commitOptimizationResult(data: ApiResponse, tech: string) {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();
		const techBonusStore = useTechBonusStore.getState();

		// 1. Update Grid Store with the result blob
		gridStore.setResult(data);

		// 2. Synchronize tech-specific stats in Tech Store
		if (data) {
			techStore.setTechMaxBonus(tech, data.max_bonus);
			techStore.setTechSolvedBonus(tech, data.solved_bonus);
			techStore.setTechSolveMethod(tech, data.solve_method);

			// 3. Update Bonus Status Store
			const status = computeBonusStatus(data.max_bonus);
			techBonusStore.setBonusStatus(tech, status);
		}
	},

	/**
	 * Resets the entire application state to its default values.
	 *
	 * Orchestrates the reset of grid, tech, modules, and interaction stores,
	 * ensuring all persisted state is also cleared.
	 */
	resetSession() {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();
		const techBonusStore = useTechBonusStore.getState();
		const moduleSelectionStore = useModuleSelectionStore.getState();
		const interactionStore = useInteractionStore.getState();

		// 1. Reset Grid
		gridStore.resetGrid();

		// 2. Reset Tech and Selections
		techStore.clearResult();
		techStore.clearAllCheckedModules();
		techBonusStore.clearAllBonusStatus();
		moduleSelectionStore.clearAllModuleSelections();

		// 3. Reset Interaction State
		interactionStore.clearInteractionState();
	},

	/**
	 * Switches the active ship platform and resets dependent state.
	 *
	 * @param {Grid} newGrid - The new grid layout for the platform.
	 */
	switchPlatform(newGrid: Grid) {
		const gridStore = useGridStore.getState();
		const techStore = useTechStore.getState();
		const techBonusStore = useTechBonusStore.getState();
		const moduleSelectionStore = useModuleSelectionStore.getState();
		const interactionStore = useInteractionStore.getState();

		// 1. Update Grid
		gridStore.setGrid(newGrid);
		gridStore.setResult(null);
		gridStore.setIsSharedGrid(false);
		gridStore.setBuildName(null);

		// 2. Clear results and groups
		techStore.clearResult();
		techStore.clearTechGroups();
		techBonusStore.clearAllBonusStatus();
		moduleSelectionStore.clearAllModuleSelections();

		// 3. Clear interaction state
		interactionStore.clearInteractionState();
	},
};
