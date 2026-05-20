import type { ApiResponse, Grid } from "./grid/gridStore";
import type { BonusStatusData } from "./tech/techBonusStore";
import type { TechTreeItem } from "@/types/tech";

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
 * Helper to compute initial checked modules based on persistent selection and defaults.
 *
 * @param {Record<string, TechTreeItem[]>} techGroups - The technology groups mapping.
 *
 * @returns {Record<string, string[]>} The resolved checked modules.
 */
function computeInitialCheckedModules(techGroups: { [key: string]: TechTreeItem[] }) {
	const moduleSelectionStore = useModuleSelectionStore.getState();

	return Object.keys(techGroups).reduce(
		(acc, tech) => {
			const group = techGroups[tech]?.[0];

			if (group) {
				const persistedSelection = moduleSelectionStore.getModuleSelection(tech);

				if (persistedSelection && persistedSelection.length > 0) {
					acc[tech] = persistedSelection;
				} else {
					acc[tech] = group.modules.filter((m) => m.checked).map((m) => m.id);
				}
			}

			return acc;
		},
		{} as { [key: string]: string[] }
	);
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
			techStore.setTechMaxBonus(tech, data.maxBonus);
			techStore.setTechSolvedBonus(tech, data.solvedBonus);
			techStore.setTechSolveMethod(tech, data.solveMethod);

			// 3. Update Bonus Status Store
			const status = computeBonusStatus(data.maxBonus);
			techBonusStore.setBonusStatus(tech, status);
		}
	},

	/**
	 * Initializes the technology tree metadata across relevant stores.
	 *
	 * Synchronizes initial module selections with persistent user preferences.
	 *
	 * @param {Record<string, string>} colors - Tech-to-color mapping.
	 * @param {Record<string, TechTreeItem[]>} techGroups - Tech-to-groups mapping.
	 * @param {Record<string, string>} activeGroups - Tech-to-active-group-ID mapping.
	 */
	initializeTechTree(
		colors: { [key: string]: string },
		techGroups: { [key: string]: TechTreeItem[] },
		activeGroups: { [key: string]: string }
	) {
		const techStore = useTechStore.getState();
		const initialCheckedModules = computeInitialCheckedModules(techGroups);

		techStore.initializeTechTree(colors, techGroups, activeGroups, initialCheckedModules);
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
	 * Updates the available technology groups.
	 *
	 * Re-initializes checked modules based on the new groups and existing module selections.
	 *
	 * @param {Record<string, TechTreeItem[]>} techGroups - The new technology groups mapping.
	 */
	setTechGroups(techGroups: { [key: string]: TechTreeItem[] }) {
		const techStore = useTechStore.getState();
		const initialCheckedModules = computeInitialCheckedModules(techGroups);

		techStore.setTechGroups(techGroups, initialCheckedModules);
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
