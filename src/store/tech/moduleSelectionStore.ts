import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

type SetItemFunction = (
	name: string,
	value: StorageValue<Partial<ModuleSelectionStore>>
) => Promise<void>;

/**
 * Creates a debounced version of a `setItem` function for `ModuleSelectionStore`.
 *
 * @param {SetItemFunction} setItemFn - The storage setter function.
 * @param {number} msToWait - Delay in milliseconds.
 *
 * @returns {(name: string, value: StorageValue<Partial<ModuleSelectionStore>>) => Promise<void>} The debounced setter function.
 *
 * @example
 * ```typescript
 * const debouncedSet = debounceSetItem(mySetFn, 500);
 * await debouncedSet("moduleSelectionState", { state: { ... }, version: 1 });
 * ```
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<ModuleSelectionStore>>) => Promise<void> {
	let timeoutId: null | number = null;

	return (name: string, value: StorageValue<Partial<ModuleSelectionStore>>): Promise<void> => {
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
					Logger.error("Failed to save ModuleSelectionStore to localStorage", e);
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
	setItem: debounceSetItem(
		async (name: string, value: StorageValue<Partial<ModuleSelectionStore>>) => {
			safeSetItem(name, JSON.stringify(value));
		},
		500
	),
};

/**
 * State and actions for tracking user-selected technology modules.
 *
 * @category State
 */
export type ModuleSelectionStore = {
	/**
	 * Resets the entire module selection registry.
	 *
	 * @returns {void} Side-effects only.
	 */
	clearAllModuleSelections: () => void;
	/**
	 * Removes all module selections for a specific technology.
	 *
	 * @param {string} tech - The unique technology identifier to clear.
	 *
	 * @returns {void} Side-effects only.
	 */
	clearModuleSelection: (tech: string) => void;
	/**
	 * Retrieves the currently selected module IDs for a given technology.
	 *
	 * @param {string} tech - The unique technology identifier.
	 *
	 * @returns {string[] | null} The list of selected IDs, or `null` if none are found.
	 */
	getModuleSelection: (tech: string) => null | string[];
	/** A mapping where keys are technology identifiers and values are arrays of selected module IDs. */
	moduleSelections: Record<string, string[]>;
	/**
	 * Updates the selected modules for a specific technology.
	 *
	 * @param {string} tech - The unique technology identifier (e.g., `'pulse'`).
	 * @param {string[]} moduleIds - The list of module IDs to associate with this technology.
	 *
	 * @returns {void} Side-effects only.
	 */
	setModuleSelection: (tech: string, moduleIds: string[]) => void;
};

/**
 * Zustand store for managing persistent module selections across technology categories.
 *
 * @remarks
 * This store ensures that when a user selects specific modules for an optimization
 * solve, those choices are remembered and persisted to `localStorage`. It uses a
 * debounced storage middleware to minimize disk writes during rapid selections.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<ModuleSelectionStore>>} The module selection store hook.
 *
 * @see {@link ModuleSelectionStore}
 * @see {@link import('./techStore').useTechStore}
 * @see {@link ./moduleSelectionStore.test.ts Unit Tests}
 *
 * @hook
 *
 * @category State
 *
 * @example
 * ```tsx
 * const { setModuleSelection } = useModuleSelectionStore();
 *
 * setModuleSelection("pulse", ["S1", "S2", "S3"]);
 * ```
 */
export const useModuleSelectionStore = create<ModuleSelectionStore>()(
	persist(
		immer((set, get) => ({
			clearAllModuleSelections: () => {
				set((state) => {
					state.moduleSelections = {};
				});
			},

			clearModuleSelection: (tech: string) => {
				set((state) => {
					delete state.moduleSelections[tech];
				});
			},

			getModuleSelection: (tech: string): null | string[] => {
				return get().moduleSelections[tech] ?? null;
			},

			moduleSelections: {},

			setModuleSelection: (tech: string, moduleIds: string[]) => {
				set((state) => {
					state.moduleSelections[tech] = moduleIds;
				});
			},
		})),
		{
			name: "moduleSelectionState",
			partialize: (state) => ({
				moduleSelections: state.moduleSelections,
			}),
			storage: debouncedStorage,
		}
	)
);

if (typeof window !== "undefined" && import.meta.env.VITE_E2E_TESTING) {
	const w = window as typeof window & {
		useModuleSelectionStore?: typeof useModuleSelectionStore;
	};

	w["useModuleSelectionStore"] = useModuleSelectionStore;
}
