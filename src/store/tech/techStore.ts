// src/store/tech/techStore.ts
import type { TechTreeItem } from "@/types/tech";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * State and actions for managing technology definitions, metadata, and solve results.
 *
 * @see {@link TechTreeItem}
 * @see {@link import('@/store/tech/moduleSelectionStore').useModuleSelectionStore}
 *
 * @category State
 */
export interface TechState {
	/** The currently active group identifier for each technology. */
	activeGroups: { [key: string]: string };
	/** User-selected module IDs for each technology, used as input for the solver. */
	checkedModules: { [key: string]: string[] };
	/** Resets all technologies to their default module selections as defined in the tech tree. */
	clearAllCheckedModules: () => void;
	/**
	 * Deselects all modules for a specific technology.
	 *
	 * @param {string} tech - The technology key.
	 */
	clearCheckedModules: (tech: string) => void;
	/** Purges all previous optimization results (max bonus and solved bonus). */
	clearResult: () => void;
	/** Purges all technology metadata, active groups, and module selections. */
	clearTechGroups: () => void;
	/**
	 * Resets the maximum bonus value for a technology to zero.
	 *
	 * @param {string} tech - The technology key to clear.
	 */
	clearTechMaxBonus: (tech: string) => void;

	/**
	 * Resets the solved bonus value for a technology to zero.
	 *
	 * @param {string} tech - The technology key to clear.
	 */
	clearTechSolvedBonus: (tech: string) => void;
	/**
	 * Returns the color assigned to a specific technology.
	 *
	 * @param {string} tech - The technology key.
	 *
	 * @returns {string|undefined} The assigned color, or `undefined` if not found.
	 */
	getTechColor: (tech: string) => string | undefined;
	/**
	 * Initializes the entire technology store from API metadata.
	 *
	 * This method synchronizes initial module selections with the `ModuleSelectionStore`
	 * to ensure persistent user preferences are respected.
	 *
	 * @param {Record<string, string>} colors - Tech-to-color mapping.
	 * @param {Record<string, TechTreeItem[]>} techGroups - Tech-to-groups mapping.
	 * @param {Record<string, string>} activeGroups - Tech-to-active-group-ID mapping.
	 *
	 * @see {@link import('@/store/tech/moduleSelectionStore').useModuleSelectionStore}
	 */
	initializeTechTree: (
		colors: { [key: string]: string },
		techGroups: { [key: string]: TechTreeItem[] },
		activeGroups: { [key: string]: string },
		initialCheckedModules: { [key: string]: string[] }
	) => void;
	/** Mapping of technology keys to their theoretical maximum bonus. */
	max_bonus: { [key: string]: number };
	/**
	 * Sets the active group variant for a technology.
	 *
	 * @param {string} tech - The technology key.
	 * @param {string} groupType - The identifier for the new active group (e.g., `'normal'`, `'proc'`).
	 */
	setActiveGroup: (tech: string, groupType: string) => void;
	/**
	 * Batch updates the active group variants for multiple technologies.
	 *
	 * @param {Record<string, string>} groups - Mapping of tech keys to their new active group identifiers.
	 */
	setActiveGroups: (groups: { [key: string]: string }) => void;
	/**
	 * Functional update for a technology's checked modules.
	 *
	 * @param {string} tech - The technology key.
	 * @param {function(string[]): string[]} updater - Function that receives current modules and returns updated ones.
	 */
	setCheckedModules: (tech: string, updater: (prev?: string[]) => string[]) => void;
	/**
	 * Updates the global technology color registry.
	 *
	 * @param {Record<string, string>} colors - Mapping of tech keys to hex or CSS color names.
	 */
	setTechColors: (colors: { [key: string]: string }) => void;
	/**
	 * Updates the available technology groups.
	 *
	 * Re-initializes checked modules based on the new groups and existing module selections.
	 *
	 * @param {Record<string, TechTreeItem[]>} techGroups - The new technology groups mapping.
	 */
	setTechGroups: (
		techGroups: { [key: string]: TechTreeItem[] },
		initialCheckedModules: { [key: string]: string[] }
	) => void;
	/**
	 * Sets the maximum bonus value for a technology.
	 *
	 * @param {string} tech - The technology key.
	 * @param {number} bonus - The new maximum bonus value.
	 */
	setTechMaxBonus: (tech: string, bonus: number) => void;
	/**
	 * Sets the solved bonus value for a technology.
	 *
	 * @param {string} tech - The technology key.
	 * @param {number} bonus - The new solved bonus value.
	 */
	setTechSolvedBonus: (tech: string, bonus: number) => void;
	/**
	 * Sets the identifier for the solver method used for a technology.
	 *
	 * @param {string} tech - The technology key.
	 * @param {string} method - The name of the solver method.
	 */
	setTechSolveMethod: (tech: string, method: string) => void;
	/** Mapping of technology keys to the solver method string used (e.g., `'SA'`). */
	solve_method: { [key: string]: string };
	/** Mapping of technology keys to the actual bonus achieved in the last solve. */
	solved_bonus: { [key: string]: number };
	/** Global registry of colors assigned to each technology category. */
	techColors: { [key: string]: string };
	/** List of available technology variants/groups (e.g., `'Standard'` vs `'Photonix'` for Pulse). */
	techGroups: { [key: string]: TechTreeItem[] };
}

/**
 * Zustand store for managing technology metadata and optimization results.
 *
 * This store acts as the central registry for what technologies are available,
 * how they are colored in the UI, which modules the user has selected, and
 * the results of the latest optimization runs.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<TechState>>} The tech store hook.
 *
 * @see {@link TechState}
 *
 * @category State
 *
 * @example
 * const { max_bonus, setTechMaxBonus } = useTechStore();
 *
 * // returns { max_bonus: { pulse: 124.5 }, ... }
 */
export const useTechStore = create<TechState>()(
	immer((set, get) => ({
		activeGroups: {},
		checkedModules: {},
		clearAllCheckedModules: () => {
			set((state) => {
				// Reset all checked modules to their API defaults (modules marked as checked in techGroups)
				const resetCheckedModules = Object.keys(state.techGroups).reduce(
					(acc, tech) => {
						const group = state.techGroups[tech]?.[0];

						if (group) {
							acc[tech] = group.modules.filter((m) => m.checked).map((m) => m.id);
						}

						return acc;
					},
					{} as { [key: string]: string[] }
				);

				state.checkedModules = resetCheckedModules;
			});
		},
		clearCheckedModules: (tech) =>
			set((state) => {
				state.checkedModules[tech] = [];
			}),
		clearResult: () =>
			set((state) => {
				state.max_bonus = {};
				state.solved_bonus = {};
			}),
		clearTechGroups: () =>
			set((state) => {
				state.activeGroups = {};
				state.checkedModules = {};
				state.techGroups = {};
			}),
		clearTechMaxBonus: (tech) =>
			set((state) => {
				state.max_bonus[tech] = 0;
			}),
		clearTechSolvedBonus: (tech) =>
			set((state) => {
				state.solved_bonus[tech] = 0;
			}),
		getTechColor: (tech) => get().techColors[tech], // Access state using 'get'
		initializeTechTree: (
			colors: { [key: string]: string },
			techGroups: { [key: string]: TechTreeItem[] },
			activeGroups: { [key: string]: string },
			initialCheckedModules: { [key: string]: string[] }
		) => {
			set((state) => {
				state.activeGroups = activeGroups;
				state.checkedModules = initialCheckedModules;
				state.techColors = colors;
				state.techGroups = techGroups;
			});
		},
		max_bonus: {},
		setActiveGroup: (tech, groupType) =>
			set((state) => {
				state.activeGroups[tech] = groupType;
			}),
		setActiveGroups: (groups) =>
			set((state) => {
				Object.assign(state.activeGroups, groups);
			}),
		setCheckedModules: (tech, updater) =>
			set((state) => {
				state.checkedModules[tech] = updater(state.checkedModules[tech]);
			}),
		setTechColors: (colors) =>
			set((state) => {
				state.techColors = colors;
			}),
		setTechGroups: (
			techGroups: { [key: string]: TechTreeItem[] },
			initialCheckedModules: { [key: string]: string[] }
		) => {
			set((state) => {
				state.checkedModules = initialCheckedModules;
				state.techGroups = techGroups;
			});
		},
		setTechMaxBonus: (tech, max_bonus) =>
			set((state) => {
				state.max_bonus[tech] = max_bonus;
			}),
		setTechSolvedBonus: (tech, bonus) =>
			set((state) => {
				state.solved_bonus[tech] = bonus;
			}),
		setTechSolveMethod: (tech, solve_method) =>
			set((state) => {
				state.solve_method[tech] = solve_method;
			}),
		solve_method: {},
		solved_bonus: {},
		techColors: {},
		techGroups: {},
	}))
);
