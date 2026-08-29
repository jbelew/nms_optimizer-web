import type { ApiResponse, Grid } from "./grid/gridStore";
import type { BonusStatusData } from "./tech/techStore";
import type { TechTreeItem } from "@/types/tech";

import { Logger } from "@/utils/system/monitoring";

import { usePlatformStore } from "./app/platformStore";
import { createGrid, useGridStore } from "./grid/gridStore";
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
	const techStore = useTechStore.getState();

	return Object.keys(techGroups).reduce(
		(acc, tech) => {
			const group = techGroups[tech]?.[0];

			if (group) {
				const persistedSelection = techStore.getModuleSelection(tech);

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

		// 1. Update Grid Store with the result blob
		gridStore.setResult(data);

		// 2. Synchronize tech-specific stats in Tech Store
		if (data) {
			techStore.setTechMaxBonus(tech, data.maxBonus);
			techStore.setTechSolvedBonus(tech, data.solvedBonus);
			techStore.setTechSolveMethod(tech, data.solveMethod);

			// 3. Update Bonus Status Store
			const status = computeBonusStatus(data.maxBonus);
			techStore.setBonusStatus(tech, status);
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

		// 1. Reset Grid and its Interaction State
		gridStore.resetGrid();
		gridStore.clearInteractionState();

		// 2. Reset Tech, Selections, and computed statuses
		techStore.clearResult();
		techStore.clearAllCheckedModules();
		techStore.clearAllBonusStatus();
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

		// 1. Update Grid and clear its Interaction State
		gridStore.setGrid(newGrid);
		gridStore.setResult(null);
		gridStore.setIsSharedGrid(false);
		gridStore.setBuildName(null);
		gridStore.clearInteractionState();

		// 2. Clear results and groups
		techStore.clearResult();
		techStore.clearTechGroups();
		techStore.clearAllBonusStatus();
		techStore.clearAllModuleSelections();
	},

	/**
	 * Synchronizes application state with values retrieved from the browser URL.
	 *
	 * Handles conditional ship platform switches and grid layout deserialization.
	 *
	 * @param {object} params - The search parameter values and deserializer.
	 * @param {string | null} params.platformFromUrl - The platform query parameter.
	 * @param {string | null} params.gridFromUrl - The grid layout query parameter.
	 * @param {string[]} params.validShipTypes - Array of supported ship type identifiers.
	 * @param {boolean} params.isKnownRoute - True if route is standard/known.
	 * @param {(serialized: string) => void} params.deserializeGrid - Callback to deserialize grid string.
	 */
	syncStateFromUrl(params: {
		deserializeGrid: (serialized: string) => void;
		gridFromUrl: null | string;
		isKnownRoute: boolean;
		platformFromUrl: null | string;
		validShipTypes: string[];
	}) {
		const { deserializeGrid, gridFromUrl, isKnownRoute, platformFromUrl, validShipTypes } =
			params;
		const platformStore = usePlatformStore.getState();
		const currentPlatform = platformStore.selectedPlatform;

		// Sync platform first to avoid grid deserialization conflicts
		if (platformFromUrl && platformFromUrl !== currentPlatform) {
			if (validShipTypes.includes(platformFromUrl)) {
				platformStore.setSelectedPlatform(
					platformFromUrl,
					validShipTypes,
					false, // updateUrl = false (we are ALREADY responding to a URL change)
					isKnownRoute
				);

				if (!gridFromUrl) {
					sessionCoordinator.switchPlatform(createGrid(10, 6));
				}
			} else {
				Logger.warn(
					`sessionCoordinator: Invalid platform from URL: ${platformFromUrl}. Expected one of: ${validShipTypes.join(", ")}`
				);
			}
		}

		if (gridFromUrl) {
			deserializeGrid(gridFromUrl);
		} else {
			const { isSharedGrid: currentIsSharedGrid, setIsSharedGrid: storeSetIsSharedGrid } =
				useGridStore.getState();

			if (currentIsSharedGrid) {
				storeSetIsSharedGrid(false);
			}
		}
	},
};
