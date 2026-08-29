// src/store/tech/techStore.ts
import type { TechTreeItem } from "@/types/tech";
import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

import { validateModuleSelections } from "./techRules";

/**
 * Metadata representing the calculated bonus status for a specific technology.
 */
export type BonusStatusData = {
	/** Identifier for the icon to display in the UI. */
	icon: "check" | "lightning" | "warning" | null;
	/** The calculated efficiency percentage. */
	percent: number;
};

type SetItemFunction = (name: string, value: StorageValue<Partial<TechStore>>) => Promise<void>;

function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<TechStore>>) => Promise<void> {
	let timeoutId: null | number = null;

	return (name: string, value: StorageValue<Partial<TechStore>>): Promise<void> => {
		if (typeof window === "undefined") {
			return Promise.resolve();
		}

		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(() => {
			void (async () => {
				try {
					await setItemFn(name, value);
				} catch (e) {
					Logger.error("Failed to save TechStore to localStorage", e);
				}
			})();
		}, msToWait);

		return Promise.resolve();
	};
}

const debouncedStorage = {
	getItem: (name: string) => {
		const item = safeGetItem(name);

		return item ? JSON.parse(item) : null;
	},
	removeItem: (name: string) => {
		safeRemoveItem(name);
	},
	setItem: debounceSetItem(async (name: string, value: StorageValue<Partial<TechStore>>) => {
		safeSetItem(name, JSON.stringify(value));
	}, 500),
};

/**
 * Combined type representing both the state and actions of the global technology store.
 *
 * @remarks
 * This store maintains the "inventory" of technology groups and the user's
 * current module selections. It also caches the last successful solve results
 * for each tech category.
 *
 * @see {@link useTechStore}
 * @see {@link TechTreeItem}
 *
 * @category State
 */
export interface TechStore {
	/** The currently active group identifier for each technology. */
	activeGroups: { [key: string]: string };
	/** Mapping of technology keys to their calculated status data. */
	bonusStatus: Record<string, BonusStatusData>;
	/** User-selected module IDs for each technology, used as input for the solver. */
	checkedModules: { [key: string]: string[] };
	/** Resets all technology status mappings. */
	clearAllBonusStatus: () => void;
	/** Resets all technologies to their default module selections as defined in the tech tree. */
	clearAllCheckedModules: () => void;
	/** Resets the entire module selection registry. */
	clearAllModuleSelections: () => void;
	/** Clears the status for a specific technology. */
	clearBonusStatus: (tech: string) => void;

	/**
	 * Deselects all modules for a specific technology.
	 *
	 * @param {string} tech - The technology key.
	 */
	clearCheckedModules: (tech: string) => void;
	/** Removes all module selections for a specific technology. */
	clearModuleSelection: (tech: string) => void;
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
	/** Retrieves the current status data for a technology. */
	getBonusStatus: (tech: string) => BonusStatusData | null;
	/** Retrieves the currently selected module IDs for a given technology. */
	getModuleSelection: (tech: string) => null | string[];
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
	 * @param {Record<string, string[]>} initialCheckedModules - Initial module selections.
	 *
	 * @see {@link import('@/store/tech/moduleSelectionStore').useModuleSelectionStore}
	 */
	initializeTechTree: (
		colors: { [key: string]: string },
		techGroups: { [key: string]: TechTreeItem[] },
		activeGroups: { [key: string]: string },
		initialCheckedModules: { [key: string]: string[] }
	) => void;
	/**
	 * @deprecated Use maxBonus.
	 *
	 * @type {Record<string, number>}
	 */
	max_bonus: { [key: string]: number };
	/**
	 * Mapping of technology keys to their theoretical maximum bonus.
	 * @type {Record<string, number>}
	 */
	maxBonus: { [key: string]: number };
	/** A mapping where keys are technology identifiers and values are arrays of selected module IDs. */
	moduleSelections: Record<string, string[]>;
	/**
	 * Restores the technology state from saved build parameters.
	 *
	 * @remarks
	 * This action merges the saved `techState`, `bonusState`, and `moduleState` into the
	 * store. It resolves legacy mappings (such as `moduleSelections` or `checkedModules`)
	 * and synchronizes internal state aliases.
	 *
	 * @param {object} params - The state components to restore.
	 * @param {Record<string, unknown>} params.techState - The serialized main tech state (checkedModules, maxBonus, solvedBonus, solveMethod).
	 * @param {Record<string, unknown>} [params.bonusState] - The serialized bonus status map.
	 * @param {Record<string, unknown>} [params.moduleState] - The serialized legacy module selection fallback state.
	 *
	 * @returns {void} Updates the store state in place.
	 *
	 * @see {@link ./techStore.test.ts Unit Tests}
	 */
	restoreTechState: (params: {
		bonusState?: Record<string, unknown>;
		moduleState?: Record<string, unknown>;
		techState: Record<string, unknown>;
	}) => void;
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
	/** Sets the bonus status for a technology. */
	setBonusStatus: (tech: string, data: BonusStatusData) => void;
	/**
	 * Functional update for a technology's checked modules.
	 *
	 * @param {string} tech - The technology key.
	 * @param {function(string[]): string[]} updater - Function that receives current modules and returns updated ones.
	 */
	setCheckedModules: (tech: string, updater: (prev?: string[]) => string[]) => void;
	/** Updates the selected modules for a specific technology. */
	setModuleSelection: (tech: string, moduleIds: string[]) => void;
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
	 * @param {Record<string, string[]>} initialCheckedModules - Initial module selections.
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

	/**
	 * @deprecated Use solveMethod.
	 *
	 * @type {Record<string, string>}
	 */
	solve_method: { [key: string]: string };
	/**
	 * @deprecated Use solvedBonus.
	 *
	 * @type {Record<string, number>}
	 */
	solved_bonus: { [key: string]: number };
	/**
	 * Mapping of technology keys to the actual bonus achieved by the solver.
	 * @type {Record<string, number>}
	 */
	solvedBonus: { [key: string]: number };
	/**
	 * Mapping of technology keys to the solver method string used
	 * @type {Record<string, string>}
	 */
	solveMethod: { [key: string]: string };
	/** Global registry of colors assigned to each technology category. */
	techColors: { [key: string]: string };
	/** List of available technology variants/groups (e.g., `'Standard'` vs `'Photonix'` for Pulse). */
	techGroups: { [key: string]: TechTreeItem[] };
}

/**
 * Helper to synchronize snake_case aliases with camelCase fields.
 *
 * @param {TechStore} state - The mutable state draft.
 */
const syncAliases = (state: TechStore) => {
	if (!state) return;
	if (state.maxBonus !== undefined) state.max_bonus = state.maxBonus;
	if (state.solveMethod !== undefined) state.solve_method = state.solveMethod;
	if (state.solvedBonus !== undefined) state.solved_bonus = state.solvedBonus;
	if (state.checkedModules !== undefined) state.moduleSelections = state.checkedModules;
};

/**
 * Global technology store managing metadata and results.
 */
export const useTechStore = create<TechStore>()(
	persist(
		immer((set, get) => ({
			activeGroups: {},
			bonusStatus: {},
			checkedModules: {},
			clearAllBonusStatus: () => {
				set((state) => {
					state.bonusStatus = {};
					syncAliases(state);
				});
			},

			clearAllCheckedModules: () => {
				set((state: TechStore) => {
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
					syncAliases(state);
				});
			},
			clearAllModuleSelections: () => {
				set((state) => {
					state.checkedModules = {};
					syncAliases(state);
				});
			},
			clearBonusStatus: (tech) => {
				set((state) => {
					delete state.bonusStatus[tech];
					syncAliases(state);
				});
			},
			clearCheckedModules: (tech) =>
				set((state: TechStore) => {
					state.checkedModules[tech] = [];
					syncAliases(state);
				}),
			clearModuleSelection: (tech) => {
				set((state) => {
					delete state.checkedModules[tech];
					syncAliases(state);
				});
			},
			clearResult: () =>
				set((state: TechStore) => {
					state.maxBonus = {};
					state.solvedBonus = {};
					state.solveMethod = {};
					syncAliases(state);
				}),
			clearTechGroups: () =>
				set((state: TechStore) => {
					state.activeGroups = {};
					state.checkedModules = {};
					state.techGroups = {};
					syncAliases(state);
				}),
			clearTechMaxBonus: (tech) =>
				set((state: TechStore) => {
					state.maxBonus[tech] = 0;
					syncAliases(state);
				}),

			clearTechSolvedBonus: (tech) =>
				set((state: TechStore) => {
					state.solvedBonus[tech] = 0;
					syncAliases(state);
				}),
			getBonusStatus: (tech) => get().bonusStatus[tech] ?? null,
			getModuleSelection: (tech) => get().checkedModules[tech] ?? null,
			getTechColor: (tech) => get().techColors[tech],
			initializeTechTree: (
				colors: { [key: string]: string },
				techGroups: { [key: string]: TechTreeItem[] },
				activeGroups: { [key: string]: string },
				initialCheckedModules: { [key: string]: string[] }
			) => {
				set((state: TechStore) => {
					state.activeGroups = activeGroups;
					state.checkedModules = initialCheckedModules;
					state.techColors = colors;
					state.techGroups = techGroups;
					syncAliases(state);
				});
			},
			max_bonus: {},
			maxBonus: {},
			moduleSelections: {},
			restoreTechState: (params) =>
				set((state: TechStore) => {
					const techState = params.techState || {};
					const bonusState = params.bonusState || {};
					const moduleState = params.moduleState || {};

					state.maxBonus = (techState.maxBonus ?? {}) as Record<string, number>;
					state.solvedBonus = (techState.solvedBonus ?? {}) as Record<string, number>;
					state.solveMethod = (techState.solveMethod ?? {}) as Record<string, string>;
					state.bonusStatus = (bonusState.bonusStatus ?? {}) as Record<
						string,
						BonusStatusData
					>;
					state.checkedModules = (techState.checkedModules ??
						moduleState.moduleSelections ??
						{}) as Record<string, string[]>;

					syncAliases(state);
				}),
			setActiveGroup: (tech, groupType) =>
				set((state: TechStore) => {
					state.activeGroups[tech] = groupType;
					syncAliases(state);
				}),
			setActiveGroups: (groups) =>
				set((state: TechStore) => {
					Object.assign(state.activeGroups, groups);
					syncAliases(state);
				}),
			setBonusStatus: (tech, data) => {
				set((state) => {
					state.bonusStatus[tech] = data;
					syncAliases(state);
				});
			},
			setCheckedModules: (tech, updater) =>
				set((state: TechStore) => {
					const prev = state.checkedModules[tech] || [];
					const updated = updater(prev);

					const activeGroupType = state.activeGroups[tech] || "normal";
					const groups = state.techGroups[tech] || [];
					const activeGroup =
						groups.length > 1
							? groups.find((g) => g.type === activeGroupType) || groups[0]
							: groups[0];
					const modules = activeGroup ? activeGroup.modules : [];

					state.checkedModules[tech] = validateModuleSelections(prev, updated, modules);
					syncAliases(state);
				}),
			setModuleSelection: (tech, moduleIds) => {
				set((state) => {
					state.checkedModules[tech] = moduleIds;
					syncAliases(state);
				});
			},
			setTechColors: (colors) =>
				set((state: TechStore) => {
					state.techColors = colors;
					syncAliases(state);
				}),
			setTechGroups: (
				techGroups: { [key: string]: TechTreeItem[] },
				initialCheckedModules: { [key: string]: string[] }
			) => {
				set((state: TechStore) => {
					state.checkedModules = initialCheckedModules;
					state.techGroups = techGroups;
					syncAliases(state);
				});
			},

			setTechMaxBonus: (tech, bonus) =>
				set((state: TechStore) => {
					state.maxBonus[tech] = bonus;
					syncAliases(state);
				}),
			setTechSolvedBonus: (tech, bonus) =>
				set((state: TechStore) => {
					state.solvedBonus[tech] = bonus;
					syncAliases(state);
				}),
			setTechSolveMethod: (tech, method) =>
				set((state: TechStore) => {
					state.solveMethod[tech] = method;
					syncAliases(state);
				}),
			solve_method: {},
			solved_bonus: {},

			solvedBonus: {},
			solveMethod: {},
			techColors: {},
			techGroups: {},
		})),
		{
			name: "nms-optimizer-tech-state",
			partialize: (state) => ({
				bonusStatus: state.bonusStatus,
				checkedModules: state.checkedModules,
			}),
			storage: debouncedStorage,
		}
	)
);

if (typeof window !== "undefined") {
	const w = window as typeof window & {
		useModuleSelectionStore?: {
			getState: () => {
				clearAllModuleSelections: () => void;
				moduleSelections: Record<string, string[]>;
				setModuleSelection: (tech: string, modules: string[]) => void;
			};
			setState: (updates: { moduleSelections?: Record<string, string[]> }) => void;
		};
		useTechBonusStore?: {
			getState: () => {
				bonusStatus: Record<string, BonusStatusData>;
				clearAllBonusStatus: () => void;
				setBonusStatus: (tech: string, bonus: BonusStatusData) => void;
			};
			setState: (updates: { bonusStatus?: Record<string, BonusStatusData> }) => void;
		};
		useTechStore?: typeof useTechStore;
	};

	w["useTechStore"] = useTechStore;

	if (import.meta.env.VITE_E2E_TESTING) {
		w["useModuleSelectionStore"] = {
			getState: () => ({
				clearAllModuleSelections: useTechStore.getState().clearAllModuleSelections,
				moduleSelections: useTechStore.getState().checkedModules,
				setModuleSelection: useTechStore.getState().setModuleSelection,
			}),
			setState: (updates: { moduleSelections?: Record<string, string[]> }) => {
				if (updates.moduleSelections) {
					useTechStore.setState({ checkedModules: updates.moduleSelections });
				}
			},
		};
		w["useTechBonusStore"] = {
			getState: () => ({
				bonusStatus: useTechStore.getState().bonusStatus,
				clearAllBonusStatus: useTechStore.getState().clearAllBonusStatus,
				setBonusStatus: useTechStore.getState().setBonusStatus,
			}),
			setState: (updates: { bonusStatus?: Record<string, BonusStatusData> }) => {
				if (updates.bonusStatus) {
					useTechStore.setState({ bonusStatus: updates.bonusStatus });
				}
			},
		};
	}
}
