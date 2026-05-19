import type { TechColor } from "@/types/tech";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";

/** Duration of the shake CSS animation in milliseconds. */
const SHAKE_ANIMATION_DURATION = 500;
let lastShakeTime = 0;

/**
 * Combined type representing both the state and actions of the global UI store.
 */
export type UiStore = UiActions & UiState;

/** Data payload describing the technology whose dialog is currently open. */
interface SelectedTechData {
	/** The unique technology key (e.g., 'pulse'). */
	tech: string;
	/** Theme color for the technology icon/avatar. */
	techColor: TechColor;
	/** Icon filename for the main technology. */
	techImage: null | string;
}

/** Valid theme appearance types. */
type ThemeAppearance = "dark" | "light";

/** Actions shape for the UI store. */
interface UiActions {
	/** Close the module selection dialog and clear its state. */
	closeModuleSelectionDialog: () => void;
	/** Open the module selection dialog with specific tech data. */
	openModuleSelectionDialog: (data: SelectedTechData) => void;
	/** Sets the theme appearance. */
	setAppearance: (appearance: ThemeAppearance) => void;
	/** Sets the grid section height. */
	setGridSectionHeight: (height: null | number) => void;
	/** Sets the grid table total width. */
	setGridTableWidth: (width: number | undefined) => void;
	/** Sets the tech tree loading state. */
	setTechTreeLoading: (isLoading: boolean) => void;
	/** Toggles the theme appearance between light and dark. */
	toggleAppearance: () => void;
	/** Throttled function to trigger a UI shake. */
	triggerShake: () => void;
}

/** State shape for the UI store. */
interface UiState {
	/** Current theme appearance. */
	appearance: ThemeAppearance;
	/** Current height of the grid section. */
	gridSectionHeight: null | number;
	/** Current width of the grid table. */
	gridTableWidth: number | undefined;
	/** Whether the module selection dialog is visible. */
	isModuleSelectionDialogOpen: boolean;
	/** Whether the technology tree data is currently loading. */
	isTechTreeLoading: boolean;
	/** Tech data for the currently-open module selection dialog. */
	selectedTechData: null | SelectedTechData;
	/** Incremental counter used to trigger re-renders in components observing shake. */
	shakeCount: number;
}

/**
 * Consolidated Zustand store managing global UI states:
 * 1. Theme management (persisted)
 * 2. Form/validation error shake feedback
 * 3. Tech tree loading state
 * 4. Shared module selection dialog state
 * 5. Layout dimensions (height/width)
 */
export const useUiStore = create<UiStore>()(
	persist(
		(set) => ({
			appearance: "dark",
			closeModuleSelectionDialog: () =>
				set({ isModuleSelectionDialogOpen: false, selectedTechData: null }),
			gridSectionHeight: null,
			gridTableWidth: undefined,
			isModuleSelectionDialogOpen: false,
			isTechTreeLoading: true,
			openModuleSelectionDialog: (data) =>
				set({ isModuleSelectionDialogOpen: true, selectedTechData: data }),
			selectedTechData: null,
			setAppearance: (appearance) => set({ appearance }),
			setGridSectionHeight: (gridSectionHeight) => set({ gridSectionHeight }),
			setGridTableWidth: (gridTableWidth) => set({ gridTableWidth }),
			setTechTreeLoading: (isTechTreeLoading) => set({ isTechTreeLoading }),
			shakeCount: 0,
			toggleAppearance: () =>
				set((state) => ({ appearance: state.appearance === "light" ? "dark" : "light" })),
			triggerShake: () => {
				const now = Date.now();

				if (now - lastShakeTime >= SHAKE_ANIMATION_DURATION) {
					lastShakeTime = now;
					set((state) => ({ shakeCount: state.shakeCount + 1 }));
				}
			},
		}),
		{
			name: "nms-optimizer-theme",
			partialize: (state) => ({
				appearance: state.appearance,
			}),
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

/**
 * Shape of the backward-compatible ModuleSelectionDialogState interface.
 */
export interface ModuleSelectionDialogState {
	closeDialog: () => void;
	isOpen: boolean;
	openDialog: (data: SelectedTechData) => void;
	selectedTechData: null | SelectedTechData;
}

/**
 * Shape of the backward-compatible ShakeState interface.
 */
export interface ShakeState {
	shakeCount: number;
	triggerShake: () => void;
}

/**
 * Shape of the backward-compatible TechTreeLoadingState interface.
 */
interface TechTreeLoadingState {
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
}

/**
 * Shape of the backward-compatible ThemeState interface.
 */
interface ThemeState {
	appearance: ThemeAppearance;
	setAppearance: (appearance: ThemeAppearance) => void;
	toggleAppearance: () => void;
}

// --- Backward-Compatible Custom Hook Facades ---

/**
 * Backward-compatible custom hook for triggering UI shake.
 */
export const useShakeStore = Object.assign(
	<T = ShakeState>(selector?: (state: ShakeState) => T): T => {
		return useUiStore(
			useShallow((s) => {
				const subState: ShakeState = {
					shakeCount: s.shakeCount,
					triggerShake: s.triggerShake,
				};

				return selector ? selector(subState) : (subState as unknown as T);
			})
		);
	},
	{
		getState: (): ShakeState => {
			const s = useUiStore.getState();

			return {
				shakeCount: s.shakeCount,
				triggerShake: s.triggerShake,
			};
		},
		subscribe: (listener: (state: ShakeState) => void) => {
			return useUiStore.subscribe((s) => {
				listener({
					shakeCount: s.shakeCount,
					triggerShake: s.triggerShake,
				});
			});
		},
	}
);

/**
 * Backward-compatible custom hook for the application's theme management.
 */
export const useThemeStore = <T = ThemeState>(selector?: (state: ThemeState) => T): T => {
	return useUiStore(
		useShallow((s) => {
			const subState: ThemeState = {
				appearance: s.appearance,
				setAppearance: s.setAppearance,
				toggleAppearance: s.toggleAppearance,
			};

			return selector ? selector(subState) : (subState as unknown as T);
		})
	);
};

/**
 * Backward-compatible custom hook for tracking technology tree fetch loading status.
 */
export const useTechTreeLoadingStore = <T = TechTreeLoadingState>(
	selector?: (state: TechTreeLoadingState) => T
): T => {
	return useUiStore(
		useShallow((s) => {
			const subState: TechTreeLoadingState = {
				isLoading: s.isTechTreeLoading,
				setLoading: s.setTechTreeLoading,
			};

			return selector ? selector(subState) : (subState as unknown as T);
		})
	);
};

/**
 * Backward-compatible custom hook managing the single, shared module selection dialog.
 */
export const useModuleSelectionDialogStore = <T = ModuleSelectionDialogState>(
	selector?: (state: ModuleSelectionDialogState) => T
): T => {
	return useUiStore(
		useShallow((s) => {
			const subState: ModuleSelectionDialogState = {
				closeDialog: s.closeModuleSelectionDialog,
				isOpen: s.isModuleSelectionDialogOpen,
				openDialog: s.openModuleSelectionDialog,
				selectedTechData: s.selectedTechData,
			};

			return selector ? selector(subState) : (subState as unknown as T);
		})
	);
};

// Always expose for E2E if the flag is set
if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		useShakeStore?: typeof useShakeStore;
		useUiStore?: typeof useUiStore;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useUiStore"] = useUiStore;
		w["useShakeStore"] = useShakeStore;
	}
}
