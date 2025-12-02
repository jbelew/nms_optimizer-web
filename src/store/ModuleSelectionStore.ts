import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type SetItemFunction = (
	name: string,
	value: StorageValue<Partial<ModuleSelectionStore>>
) => Promise<void>;

/**
 * Creates a debounced version of a setItem function.
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<ModuleSelectionStore>>) => Promise<void> {
	let timeoutId: number | null = null;

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
					console.error("Failed to save ModuleSelectionStore to localStorage", e);
				}
			})();
		}, msToWait);

		return Promise.resolve();
	};
}

const debouncedStorage = {
	getItem: (name: string) => {
		if (typeof window === "undefined" || !window.localStorage) {
			return null;
		}

		const item = localStorage.getItem(name);

		return item ? JSON.parse(item) : null;
	},
	setItem: debounceSetItem(
		async (name: string, value: StorageValue<Partial<ModuleSelectionStore>>) => {
			if (typeof window !== "undefined" && window.localStorage) {
				localStorage.setItem(name, JSON.stringify(value));
			}
		},
		500
	),
	removeItem: (name: string) => {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.removeItem(name);
		}
	},
};

/**
 * @typedef {object} ModuleSelectionStore
 * @property {Record<string, string[]>} moduleSelections - Map of technology to array of selected module IDs.
 * @property {(tech: string, moduleIds: string[]) => void} setModuleSelection - Sets the selected modules for a technology.
 * @property {(tech: string) => string[]|null} getModuleSelection - Gets the selected modules for a technology.
 * @property {(tech: string) => void} clearModuleSelection - Clears the selection for a technology.
 * @property {() => void} clearAllModuleSelections - Clears all module selections.
 */
export type ModuleSelectionStore = {
	moduleSelections: Record<string, string[]>;
	setModuleSelection: (tech: string, moduleIds: string[]) => void;
	getModuleSelection: (tech: string) => string[] | null;
	clearModuleSelection: (tech: string) => void;
	clearAllModuleSelections: () => void;
};

export const useModuleSelectionStore = create<ModuleSelectionStore>()(
	persist(
		immer((set, get) => ({
			moduleSelections: {},

			setModuleSelection: (tech: string, moduleIds: string[]) => {
				set((state) => {
					state.moduleSelections[tech] = moduleIds;
				});
			},

			getModuleSelection: (tech: string): string[] | null => {
				return get().moduleSelections[tech] ?? null;
			},

			clearModuleSelection: (tech: string) => {
				set((state) => {
					delete state.moduleSelections[tech];
				});
			},

			clearAllModuleSelections: () => {
				set((state) => {
					state.moduleSelections = {};
				});
			},
		})),
		{
			name: "moduleSelectionState",
			storage: debouncedStorage,
			partialize: (state) => ({
				moduleSelections: state.moduleSelections,
			}),
		}
	)
);

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - for e2e testing
	window.useModuleSelectionStore = useModuleSelectionStore;
}
