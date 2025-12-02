import type { StorageValue } from "zustand/middleware";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
		if (typeof window === "undefined" || !window.localStorage) {
			return null;
		}

		const item = localStorage.getItem(name);

		return item ? JSON.parse(item) : null;
	},
	setItem: debounceSetItem(async (name: string, value: StorageValue<Partial<TechBonusStore>>) => {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(name, JSON.stringify(value));
		}
	}, 500),
	removeItem: (name: string) => {
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.removeItem(name);
		}
	},
};

/**
 * Represents the computed bonus status for a technology.
 * @typedef {object} BonusStatusData
 * @property {string|null} icon - The icon type: 'warning' (insufficient), 'check' (valid), 'lightning' (boosted), or null.
 * @property {number} percent - The percentage difference from max bonus.
 * @property {string} tooltipContent - The human-readable tooltip text.
 * @property {string} iconClassName - The CSS classes for the icon element.
 * @property {{color: string}} iconStyle - The inline style for the icon.
 */
export type BonusStatusData = {
	icon: "warning" | "check" | "lightning" | null;
	percent: number;
	tooltipContent: string;
	iconClassName: string;
	iconStyle: { color: string };
};

/**
 * @typedef {object} TechBonusStore
 * @property {Record<string, BonusStatusData>} bonusStatus - Map of technology to its computed bonus status.
 * @property {(tech: string, data: BonusStatusData) => void} setBonusStatus - Sets the bonus status for a technology.
 * @property {(tech: string) => BonusStatusData|null} getBonusStatus - Gets the bonus status for a technology.
 * @property {(tech: string) => void} clearBonusStatus - Clears the bonus status for a technology.
 * @property {() => void} clearAllBonusStatus - Clears all bonus status data.
 */
export type TechBonusStore = {
	bonusStatus: Record<string, BonusStatusData>;
	setBonusStatus: (tech: string, data: BonusStatusData) => void;
	getBonusStatus: (tech: string) => BonusStatusData | null;
	clearBonusStatus: (tech: string) => void;
	clearAllBonusStatus: () => void;
};

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
