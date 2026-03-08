import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";

type SetItemFunction = (
	name: string,
	value: StorageValue<Partial<TechBonusStore>>
) => Promise<void>;

/**
 * Creates a debounced version of a `setItem` function for `TechBonusStore`.
 *
 * @param {SetItemFunction} setItemFn - The storage setter function.
 * @param {number} msToWait - Delay in milliseconds.
 * @returns {function(string, StorageValue<Partial<TechBonusStore>>): Promise<void>}
 */
function debounceSetItem(
	setItemFn: SetItemFunction,
	msToWait: number
): (name: string, value: StorageValue<Partial<TechBonusStore>>) => Promise<void> {
	let timeoutId: number | null = null;

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
					console.error("Failed to save TechBonusStore to localStorage", e);
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
	setItem: debounceSetItem(async (name: string, value: StorageValue<Partial<TechBonusStore>>) => {
		safeSetItem(name, JSON.stringify(value));
	}, 500),
	removeItem: (name: string) => {
		safeRemoveItem(name);
	},
};

/**
 * Metadata representing the calculated bonus status for a specific technology.
 */
export type BonusStatusData = {
	/** Identifier for the icon to display in the UI. */
	icon: "warning" | "check" | "lightning" | null;
	/** The calculated efficiency percentage. */
	percent: number;
	/** Localized string for the status tooltip. */
	tooltipContent: string;
	/** CSS class name for icon styling. */
	iconClassName: string;
	/** Inline CSS styles for the icon. */
	iconStyle: { color: string };
};

/**
 * State and actions for managing calculated efficiency statuses.
 */
export type TechBonusStore = {
	/** Mapping of technology keys to their calculated status data. */
	bonusStatus: Record<string, BonusStatusData>;
	/**
	 * Sets the bonus status for a technology.
	 *
	 * @param {string} tech - The technology identifier.
	 * @param {BonusStatusData} data - The calculated status metadata.
	 */
	setBonusStatus: (tech: string, data: BonusStatusData) => void;
	/**
	 * Retrieves the current status data for a technology.
	 *
	 * @param {string} tech - The technology identifier.
	 * @returns {BonusStatusData | null} The status data, or `null` if not yet calculated.
	 */
	getBonusStatus: (tech: string) => BonusStatusData | null;
	/**
	 * Clears the status for a specific technology.
	 *
	 * @param {string} tech - The technology identifier.
	 */
	clearBonusStatus: (tech: string) => void;
	/**
	 * Resets all technology status mappings.
	 */
	clearAllBonusStatus: () => void;
};

/**
 * Zustand store for managing persistent efficiency ratings and statuses for optimized technologies.
 *
 * This store allows the UI to maintain "Optimization Checkmark" or "Warning" icons
 * for each technology across re-renders and sessions.
 *
 * @returns {TechBonusStore} The tech bonus store state and actions.
 *
 * @example
 * const status = useTechBonusStore((s) => s.getBonusStatus("shield"));
 */
export const useTechBonusStore = create<TechBonusStore>()(
	persist(
		immer((set, get) => ({
			bonusStatus: {},

			setBonusStatus: (tech: string, data: BonusStatusData) => {
				set((state) => {
					state.bonusStatus[tech] = data;
				});
			},

			getBonusStatus: (tech: string): BonusStatusData | null => {
				return get().bonusStatus[tech] ?? null;
			},

			clearBonusStatus: (tech: string) => {
				set((state) => {
					delete state.bonusStatus[tech];
				});
			},

			clearAllBonusStatus: () => {
				set((state) => {
					state.bonusStatus = {};
				});
			},
		})),
		{
			name: "techBonusState",
			storage: debouncedStorage,
			partialize: (state) => ({
				bonusStatus: state.bonusStatus,
			}),
		}
	)
);

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore - for e2e testing
	window.useTechBonusStore = useTechBonusStore;
}
