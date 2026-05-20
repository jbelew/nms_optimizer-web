import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";
import { Logger } from "@/utils/system/monitoring";

type SetItemFunction = (
	name: string,
	value: StorageValue<Partial<TechBonusStore>>
) => Promise<void>;

/**
 * Creates a debounced version of a `setItem` function for `TechBonusStore`.
 *
 * @param {SetItemFunction} setItemFn - The storage setter function.
 * @param {number} msToWait - Delay in milliseconds.
 *
 * @returns {function(string, StorageValue<Partial<TechBonusStore>>): Promise<void>} The debounced setter function.
 *
 * @example
 * ```typescript
 * const debouncedSet = debounceSetItem(mySetFn, 500);
 * await debouncedSet("techBonusState", { state: { ... }, version: 1 });
 * ```
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<TechBonusStore>>) => Promise<void> {
	let timeoutId: null | number = null;

	return (name: string, value: StorageValue<Partial<TechBonusStore>>): Promise<void> => {
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
					Logger.error("Failed to save TechBonusStore to localStorage", e);
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
	setItem: debounceSetItem(async (name: string, value: StorageValue<Partial<TechBonusStore>>) => {
		safeSetItem(name, JSON.stringify(value));
	}, 500),
};

/**
 * Metadata representing the calculated bonus status for a specific technology.
 */
export type BonusStatusData = {
	/** Identifier for the icon to display in the UI. */
	icon: "check" | "lightning" | "warning" | null;
	/** The calculated efficiency percentage. */
	percent: number;
};

/**
 * State and actions for managing calculated efficiency statuses.
 *
 * @see {@link BonusStatusData}
 *
 * @category State
 */
export type TechBonusStore = {
	/** Mapping of technology keys to their calculated status data. */
	bonusStatus: Record<string, BonusStatusData>;
	/**
	 * Resets all technology status mappings.
	 */
	clearAllBonusStatus: () => void;
	/**
	 * Clears the status for a specific technology.
	 *
	 * @param {string} tech - The technology identifier.
	 */
	clearBonusStatus: (tech: string) => void;
	/**
	 * Retrieves the current status data for a technology.
	 *
	 * @param {string} tech - The technology identifier.
	 *
	 * @returns {BonusStatusData | null} The status data, or `null` if not yet calculated.
	 */
	getBonusStatus: (tech: string) => BonusStatusData | null;
	/**
	 * Sets the bonus status for a technology.
	 *
	 * @param {string} tech - The technology identifier.
	 * @param {BonusStatusData} data - The calculated status metadata.
	 */
	setBonusStatus: (tech: string, data: BonusStatusData) => void;
};

/**
 * Zustand store for managing persistent efficiency ratings and statuses for optimized technologies.
 *
 * @remarks
 * This store allows the UI to maintain "Optimization Checkmark" or "Warning" icons
 * for each technology across re-renders and sessions.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<TechBonusStore>>} The tech bonus store hook.
 *
 * @see {@link TechBonusStore}
 * @see {@link BonusStatusData}
 * @see {@link safeGetItem}
 * @see {@link safeSetItem}
 *
 * @hook
 *
 * @category State
 *
 * @example
 * ```tsx
 * const status = useTechBonusStore((s) => s.getBonusStatus("shield"));
 * ```
 */
export const useTechBonusStore = create<TechBonusStore>()(
	persist(
		immer((set, get) => ({
			bonusStatus: {},

			clearAllBonusStatus: () => {
				set((state) => {
					state.bonusStatus = {};
				});
			},

			clearBonusStatus: (tech: string) => {
				set((state) => {
					delete state.bonusStatus[tech];
				});
			},

			getBonusStatus: (tech: string): BonusStatusData | null => {
				return get().bonusStatus[tech] ?? null;
			},

			setBonusStatus: (tech: string, data: BonusStatusData) => {
				set((state) => {
					state.bonusStatus[tech] = data;
				});
			},
		})),
		{
			name: "techBonusState",
			partialize: (state) => ({
				bonusStatus: state.bonusStatus,
			}),
			storage: debouncedStorage,
		}
	)
);

if (typeof window !== "undefined" && import.meta.env.VITE_E2E_TESTING) {
	const w = window as typeof window & {
		useTechBonusStore?: typeof useTechBonusStore;
	};

	w["useTechBonusStore"] = useTechBonusStore;
}
