import { create } from "zustand";
import { persist } from "zustand/middleware";

import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";

/**
 * Valid theme appearance types.
 */
type ThemeAppearance = "dark" | "light";

/**
 * State and actions for the application's theme management.
 */
interface ThemeState {
	/** The current theme appearance. */
	appearance: ThemeAppearance;
	/** Sets the theme appearance. */
	setAppearance: (appearance: ThemeAppearance) => void;
	/** Toggles the theme appearance between "light" and "dark". */
	toggleAppearance: () => void;
}

/**
 * Zustand store for managing and persisting theme settings.
 *
 * This store maintains user preferences for the application theme,
 * persisting the state to `localStorage`.
 *
 * @returns {ThemeState} The theme store state and actions.
 *
 * @example
 * const { appearance, toggleAppearance } = useThemeStore();
 */
export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			appearance: "dark",
			setAppearance: (appearance) => set({ appearance }),
			toggleAppearance: () =>
				set((state) => ({ appearance: state.appearance === "light" ? "dark" : "light" })),
		}),
		{
			name: "nms-optimizer-theme",
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
