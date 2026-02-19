import { create } from "zustand";
import { persist } from "zustand/middleware";

import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";

/**
 * Represents the state and actions for accessibility mode.
 */
interface A11yState {
	/** Whether accessibility mode is currently enabled. */
	a11yMode: boolean;
	/** Set accessibility mode to a specific state. */
	setA11yMode: (a11yMode: boolean) => void;
	/** Toggle accessibility mode on/off. */
	toggleA11yMode: () => void;
}

/**
 * Zustand store hook for managing accessibility mode state.
 * Persists state to localStorage under the key 'nms-optimizer-a11y-mode'.
 *
 * @returns {A11yState} The accessibility state and action methods.
 *
 * @example
 * const { a11yMode, toggleA11yMode } = useA11yStore();
 */
export const useA11yStore = create<A11yState>()(
	persist(
		(set) => ({
			a11yMode: false,
			setA11yMode: (a11yMode) => set({ a11yMode }),
			toggleA11yMode: () => set((state) => ({ a11yMode: !state.a11yMode })),
		}),
		{
			name: "nms-optimizer-a11y-mode", // name of the item in the storage (must be unique)
			storage: {
				getItem: (name) => {
					const item = safeGetItem(name);

					return item ? JSON.parse(item) : null;
				},
				setItem: (name, value) => {
					safeSetItem(name, JSON.stringify(value));
				},
				removeItem: (name) => {
					safeRemoveItem(name);
				},
			},
		}
	)
);
