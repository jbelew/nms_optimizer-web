import { create } from "zustand";
import { persist } from "zustand/middleware";

import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";

/**
 * State and actions for the application's accessibility features.
 */
interface A11yState {
	/** Whether accessibility mode is currently enabled. If `true`, enhances UI for screen readers and keyboard users. */
	a11yMode: boolean;
	/** Sets the accessibility mode to a specific state. */
	setA11yMode: (a11yMode: boolean) => void;
	/** Toggles the accessibility mode between `true` and `false`. */
	toggleA11yMode: () => void;
}

/**
 * Zustand store for managing and persisting accessibility settings.
 *
 * This store maintains user preferences for accessibility mode, persisting the
 * state to `localStorage` to ensure consistency across sessions.
 *
 * @returns {A11yState} The accessibility store state and actions.
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
			name: "nms-optimizer-a11y-mode",
			storage: {
				getItem: (name) => {
					const item = safeGetItem(name);

					return item ? JSON.parse(item) : null;
				},
				removeItem: (name) => {
					safeRemoveItem(name);
				},
				setItem: (name, value) => {
					safeSetItem(name, JSON.stringify(value));
				},
			},
		}
	)
);
