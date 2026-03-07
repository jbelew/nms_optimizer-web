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
 * Creates a debounced version of a setItem function.
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
 * Represents the computed bonus status for a technology.
 * @typedef {object} BonusStatusData
 * @property {"warning" | "check" | "lightning" | null} icon - The icon type representing the status.
 * @property {number} percent - The percentage difference from the maximum possible bonus.
 * @property {string} tooltipContent - Human-readable tooltip text explaining the status.
 * @property {string} iconClassName - CSS classes for styling the icon.
 * @property {{ color: string }} iconStyle - Inline styles for the icon.
 */
export type BonusStatusData = {
	icon: "warning" | "check" | "lightning" | null;
	percent: number;
	tooltipContent: string;
	iconClassName: string;
	iconStyle: { color: string };
};

/**
 * State and actions for the tech bonus store.
 * @typedef {object} TechBonusStore
 * @property {Record<string, BonusStatusData>} bonusStatus - Map of technology keys to their computed bonus status data.
 * @property {(tech: string, data: BonusStatusData) => void} setBonusStatus - Sets the bonus status for a specific technology.
 * @property {(tech: string) => BonusStatusData | null} getBonusStatus - Retrieves the currently stored bonus status for a technology.
 * @property {(tech: string) => void} clearBonusStatus - Clears the bonus status for a specific technology.
 * @property {() => void} clearAllBonusStatus - Clears all bonus status data.
 */
export type TechBonusStore = {
	bonusStatus: Record<string, BonusStatusData>;
	setBonusStatus: (tech: string, data: BonusStatusData) => void;
	getBonusStatus: (tech: string) => BonusStatusData | null;
	clearBonusStatus: (tech: string) => void;
	clearAllBonusStatus: () => void;
};

/**
 * Zustand store for managing tech bonus status.
 * Persists to localStorage with debouncing.
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
