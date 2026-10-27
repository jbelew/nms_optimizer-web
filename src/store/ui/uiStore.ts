import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

import type { TechColor } from "@/types/tech";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/utils/browser/environment";

/** Duration of the shake CSS animation in milliseconds. */
const SHAKE_ANIMATION_DURATION = 500;
/** Default serialized payload for the persisted UI slice (`a11yMode` and `appearance`). */
const DEFAULT_PERSISTED_UI_STATE = JSON.stringify({
	state: { a11yMode: false, appearance: "dark" },
	version: 0,
});
/** Timestamp of the most recent shake animation trigger. */
let lastShakeTime = 0;
/** Last serialized `nms-optimizer-ui-state` string written to or read from `localStorage`. */
let lastPersistedUiState: string = DEFAULT_PERSISTED_UI_STATE;

/**
 * Canonical warning reasons emitted when an unforced optimization solve cannot place a Solver Window.
 *
 * @remarks
 * - `pattern_no_fit`: **Pattern No Fit** — no contiguous region of available active slots matches the required Solver Window dimensions.
 * - `supercharged_no_fit`: **Supercharged No Fit** — unoccupied active supercharged slots exist and the technology includes supercharge-eligible modules, but no Solver Window fits around any open supercharged slot.
 *
 * @category State
 */
export type OptimizeWarningReason = "pattern_no_fit" | "supercharged_no_fit";

/**
 * Actions shape for the UI store.
 *
 * @category Actions
 */
export interface UiActions {
	/** Close the module selection dialog and clear its state. */
	closeModuleSelectionDialog: () => void;
	/** Increments the `gridFixedCount` counter. */
	incrementGridFixedCount: () => void;
	/** Increments the `moduleLockedCount` counter. */
	incrementModuleLockedCount: () => void;
	/** Increments the `rowLimitCount` counter. */
	incrementRowLimitCount: () => void;
	/** Increments the `superchargedFixedCount` counter. */
	incrementSuperchargedFixedCount: () => void;
	/** Increments the `superchargedLimitCount` counter. */
	incrementSuperchargedLimitCount: () => void;
	/** Open the module selection dialog with specific tech data. */
	openModuleSelectionDialog: (data: SelectedTechData) => void;
	/** Resets all session violation counters to zero. */
	resetSession: () => void;
	/** Sets the accessibility mode to a specific state. */
	setA11yMode: (a11yMode: boolean) => void;
	/** Sets the theme appearance. */
	setAppearance: (appearance: ThemeAppearance) => void;
	/** Sets the grid section height. */
	setGridSectionHeight: (height: null | number) => void;
	/** Sets the grid table total width. */
	setGridTableWidth: (width: number | undefined) => void;
	/** Sets or clears the active Pattern No Fit or Supercharged No Fit technology warning and reason. */
	setPatternNoFitTech: (tech: null | string, reason?: OptimizeWarningReason) => void;
	/** Updates the optimization progress percentage. */
	setProgressPercent: (percent: number) => void;
	/** Updates the error visibility and metadata. */
	setShowError: (show: boolean, severity?: OptimizeErrorType, details?: Error | null) => void;
	/** Updates the "solving" status. */
	setSolving: (solving: boolean) => void;
	/** Sets the tech tree loading state. */
	setTechTreeLoading: (isLoading: boolean) => void;
	/** Toggles the accessibility mode between `true` and `false`. */
	toggleA11yMode: () => void;
	/** Toggles the theme appearance between light and dark. */
	toggleAppearance: () => void;
	/** Throttled function to trigger a UI shake. */
	triggerShake: () => void;
}

/**
 * Combined type representing both the state and actions of the global UI store.
 *
 * @remarks
 * This store is the central source of truth for all non-domain UI state, including:
 * - Theme and appearance
 * - Modal/Dialog visibility
 * - Accessibility modes
 * - Slot Restriction counters and shake state
 *
 * @see {@link useUiStore}
 * @see {@link UiState}
 * @see {@link UiActions}
 *
 * @category State
 */
export type UiStore = UiActions & UiState;

/**
 * Types of errors that can occur during the optimization solve process.
 *
 * @remarks
 * - `fatal`: The solve cannot continue and the user must be notified immediately.
 * - `recoverable`: A transport or minor logic error that might be resolved by retry.
 *
 * @category State
 */
type OptimizeErrorType = "fatal" | "recoverable";

/**
 * Discriminated union representing the various states of the optimization engine.
 *
 * @remarks
 * Tracks the lifecycle of a WebSocket-based optimization request:
 * - `idle`: No active solve.
 * - `solving`: Active connection with real-time progress updates.
 * - `warning`: Handled edge cases like **Pattern No Fit** or **Supercharged No Fit**.
 * - `error`: Fatal or recoverable failures reported by the backend.
 *
 * @category State
 */
type OptimizeStatus =
	| { details: Error | null; severity: OptimizeErrorType; type: "error" }
	| { progress: number; type: "solving" }
	| { reason: OptimizeWarningReason; tech: string; type: "warning" }
	| { type: "idle" };

/**
 * Data payload describing the technology whose dialog is currently open.
 *
 * @remarks
 * Used by the `ModuleSelectionDialog` to determine which technology's
 * modules to display and how to style the header (via `techColor`).
 *
 * @category State
 */
interface SelectedTechData {
	/** The unique technology key (e.g., `'pulse'`). */
	tech: string;
	/**
	 * Theme color for the technology icon/avatar.
	 * @see {@link TechColor}
	 */
	techColor: TechColor;
	/** Icon filename for the main technology. */
	techImage: null | string;
}

/**
 * Valid theme appearance types.
 *
 * @category State
 */
type ThemeAppearance = "dark" | "light";

/**
 * State shape for the UI store.
 *
 * @category State
 */
interface UiState {
	/** Whether accessibility mode is currently enabled. */
	a11yMode: boolean;
	/** Current theme appearance. */
	appearance: ThemeAppearance;
	/** Count of attempts to modify any cell while the entire grid layout is locked. */
	gridFixedCount: number;
	/** Current height of the grid section. */
	gridSectionHeight: null | number;
	/** Current width of the grid table. */
	gridTableWidth: number | undefined;
	/** Whether the module selection dialog is visible. */
	isModuleSelectionDialogOpen: boolean;
	/** Whether the technology tree data is currently loading. */
	isTechTreeLoading: boolean;
	/** Count of attempts to modify a cell that already contains a technology module. */
	moduleLockedCount: number;
	/** The current status of the optimization engine. */
	optimizeStatus: OptimizeStatus;
	/** Count of attempts to place a supercharged cell beyond the supported row limit. */
	rowLimitCount: number;
	/** Tech data for the currently-open module selection dialog. */
	selectedTechData: null | SelectedTechData;
	/** Incremental counter used to trigger re-renders in components observing shake. */
	shakeCount: number;
	/** Count of attempts to modify supercharged cells while the supercharged layout is locked. */
	superchargedFixedCount: number;
	/** Count of attempts to exceed the supercharged cell limit. */
	superchargedLimitCount: number;
}

/**
 * Consolidated Zustand store managing global UI states.
 *
 * @remarks
 * This store manages:
 * 1. Theme management (persisted)
 * 2. Form/validation error shake feedback
 * 3. Tech tree loading state
 * 4. Shared module selection dialog state
 * 5. Layout dimensions (height/width)
 * 6. Slot Restriction counters (grid fixed, module locked, etc.)
 * 7. Optimization solve status
 *
 * @returns Bound Zustand store hook for global UI state and actions.
 *
 * @see {@link UiStore}
 * @see {@link ./uiStore.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { appearance, toggleAppearance } = useUiStore();
 * // returns current appearance and toggle action
 * ```
 */
export const useUiStore = create<UiStore>()(
	immer(
		persist(
			(set) => ({
				a11yMode: false,
				appearance: "dark",
				closeModuleSelectionDialog: () =>
					set({ isModuleSelectionDialogOpen: false, selectedTechData: null }),
				gridFixedCount: 0,
				gridSectionHeight: null,
				gridTableWidth: undefined,
				incrementGridFixedCount: () =>
					set((state) => ({ gridFixedCount: state.gridFixedCount + 1 })),
				incrementModuleLockedCount: () =>
					set((state) => ({ moduleLockedCount: state.moduleLockedCount + 1 })),
				incrementRowLimitCount: () =>
					set((state) => ({ rowLimitCount: state.rowLimitCount + 1 })),
				incrementSuperchargedFixedCount: () =>
					set((state) => ({ superchargedFixedCount: state.superchargedFixedCount + 1 })),
				incrementSuperchargedLimitCount: () =>
					set((state) => ({ superchargedLimitCount: state.superchargedLimitCount + 1 })),
				isModuleSelectionDialogOpen: false,
				isTechTreeLoading: true,
				moduleLockedCount: 0,
				openModuleSelectionDialog: (data) =>
					set({ isModuleSelectionDialogOpen: true, selectedTechData: data }),
				optimizeStatus: { type: "idle" },
				resetSession: () => {
					lastShakeTime = 0;
					set({
						gridFixedCount: 0,
						moduleLockedCount: 0,
						rowLimitCount: 0,
						superchargedFixedCount: 0,
						superchargedLimitCount: 0,
					});
				},
				rowLimitCount: 0,
				selectedTechData: null,
				setA11yMode: (a11yMode) => set({ a11yMode }),
				setAppearance: (appearance) => set({ appearance }),
				setGridSectionHeight: (gridSectionHeight) => set({ gridSectionHeight }),
				setGridTableWidth: (gridTableWidth) => set({ gridTableWidth }),
				setPatternNoFitTech: (tech, reason = "pattern_no_fit") =>
					set((state) => ({
						optimizeStatus:
							tech ? { reason, tech, type: "warning" }
							: state.optimizeStatus.type === "warning" ? { type: "idle" }
							: state.optimizeStatus,
					})),
				setProgressPercent: (percent) =>
					set((state) => {
						if (state.optimizeStatus.type === "solving") {
							state.optimizeStatus.progress = percent;
						}
					}),
				setShowError: (show, severity = "recoverable", details = null) =>
					set((state) => ({
						optimizeStatus:
							show ? { details, severity, type: "error" }
							: state.optimizeStatus.type === "error" ? { type: "idle" }
							: state.optimizeStatus,
					})),
				setSolving: (solving) =>
					set((state) => ({
						optimizeStatus:
							solving ? { progress: 0, type: "solving" }
							: state.optimizeStatus.type === "solving" ? { type: "idle" }
							: state.optimizeStatus,
					})),
				setTechTreeLoading: (isTechTreeLoading) => set({ isTechTreeLoading }),
				shakeCount: 0,
				superchargedFixedCount: 0,
				superchargedLimitCount: 0,
				toggleA11yMode: () => set((state) => ({ a11yMode: !state.a11yMode })),
				toggleAppearance: () =>
					set((state) => ({
						appearance: state.appearance === "light" ? "dark" : "light",
					})),
				triggerShake: () => {
					const now = Date.now();

					if (now - lastShakeTime >= SHAKE_ANIMATION_DURATION) {
						lastShakeTime = now;
						set((state) => ({ shakeCount: state.shakeCount + 1 }));
					}
				},
			}),
			{
				name: "nms-optimizer-ui-state", // Renamed to reflect consolidated state
				partialize: (state) => ({
					a11yMode: state.a11yMode,
					appearance: state.appearance,
				}),
				storage: {
					getItem: (name) => {
						const item = safeGetItem(name);
						lastPersistedUiState = item ?? DEFAULT_PERSISTED_UI_STATE;

						return item ? JSON.parse(item) : null;
					},
					removeItem: (name) => {
						lastPersistedUiState = DEFAULT_PERSISTED_UI_STATE;
						safeRemoveItem(name);
					},
					setItem: (name, value) => {
						const serialized = JSON.stringify(value);

						if (serialized === lastPersistedUiState) {
							return;
						}

						lastPersistedUiState = serialized;
						safeSetItem(name, serialized);
					},
				},
			},
		),
	),
);

/**
 * Shape of the backward-compatible ModuleSelectionDialogState interface.
 *
 * @category State
 */
export interface ModuleSelectionDialogState {
	closeDialog: () => void;
	isOpen: boolean;
	openDialog: (data: SelectedTechData) => void;
	selectedTechData: null | SelectedTechData;
}

/**
 * Shape of the backward-compatible OptimizeState interface.
 */
export interface OptimizeState {
	/** Sets or clears the active Pattern No Fit or Supercharged No Fit technology warning and reason. */
	setPatternNoFitTech: (tech: null | string, reason?: OptimizeWarningReason) => void;
	/** Updates the optimization progress percentage. */
	setProgressPercent: (percent: number) => void;
	/** Updates the error visibility and metadata. */
	setShowError: (show: boolean, severity?: OptimizeErrorType, details?: Error | null) => void;
	/** Updates the "solving" status. */
	setSolving: (solving: boolean) => void;
	/** Current optimization engine status. */
	status: OptimizeStatus;
}

/**
 * Shape of the backward-compatible ShakeState interface.
 *
 * @category State
 */
export interface ShakeState {
	shakeCount: number;
	triggerShake: () => void;
}

/**
 * Shape of the backward-compatible A11yState interface.
 *
 * @category State
 */
interface A11yState {
	a11yMode: boolean;
	setA11yMode: (a11yMode: boolean) => void;
	toggleA11yMode: () => void;
}

/**
 * Shape of the backward-compatible TechTreeLoadingState interface.
 *
 * @category State
 */
interface TechTreeLoadingState {
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
}

/**
 * Shape of the backward-compatible ThemeState interface.
 *
 * @category State
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
			}),
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
		setState: (updates: Partial<ShakeState>) => {
			useUiStore.setState(updates);
		},
		subscribe: (listener: (state: ShakeState) => void) => {
			return useUiStore.subscribe((s) => {
				listener({
					shakeCount: s.shakeCount,
					triggerShake: s.triggerShake,
				});
			});
		},
	},
);

/**
 * Backward-compatible custom hook for the application's theme management.
 */
export const useThemeStore = Object.assign(
	<T = ThemeState>(selector?: (state: ThemeState) => T): T => {
		return useUiStore(
			useShallow((s) => {
				const subState: ThemeState = {
					appearance: s.appearance,
					setAppearance: s.setAppearance,
					toggleAppearance: s.toggleAppearance,
				};

				return selector ? selector(subState) : (subState as unknown as T);
			}),
		);
	},
	{
		getState: (): ThemeState => {
			const s = useUiStore.getState();

			return {
				appearance: s.appearance,
				setAppearance: s.setAppearance,
				toggleAppearance: s.toggleAppearance,
			};
		},
		setState: (updates: Partial<ThemeState>) => {
			useUiStore.setState(updates);
		},
	},
);

/**
 * Backward-compatible custom hook for tracking technology tree fetch loading status.
 */
export const useTechTreeLoadingStore = Object.assign(
	<T = TechTreeLoadingState>(selector?: (state: TechTreeLoadingState) => T): T => {
		return useUiStore(
			useShallow((s) => {
				const subState: TechTreeLoadingState = {
					isLoading: s.isTechTreeLoading,
					setLoading: s.setTechTreeLoading,
				};

				return selector ? selector(subState) : (subState as unknown as T);
			}),
		);
	},
	{
		getState: (): TechTreeLoadingState => {
			const s = useUiStore.getState();

			return {
				isLoading: s.isTechTreeLoading,
				setLoading: s.setTechTreeLoading,
			};
		},
		setState: (updates: Partial<TechTreeLoadingState>) => {
			const mappedUpdates: Partial<UiStore> = {};
			if ("isLoading" in updates) mappedUpdates.isTechTreeLoading = updates.isLoading;
			if ("setLoading" in updates) mappedUpdates.setTechTreeLoading = updates.setLoading;
			useUiStore.setState(mappedUpdates);
		},
	},
);

/**
 * Backward-compatible custom hook managing the single, shared module selection dialog.
 */
export const useModuleSelectionDialogStore = Object.assign(
	<T = ModuleSelectionDialogState>(selector?: (state: ModuleSelectionDialogState) => T): T => {
		return useUiStore(
			useShallow((s) => {
				const subState: ModuleSelectionDialogState = {
					closeDialog: s.closeModuleSelectionDialog,
					isOpen: s.isModuleSelectionDialogOpen,
					openDialog: s.openModuleSelectionDialog,
					selectedTechData: s.selectedTechData,
				};

				return selector ? selector(subState) : (subState as unknown as T);
			}),
		);
	},
	{
		getState: (): ModuleSelectionDialogState => {
			const s = useUiStore.getState();

			return {
				closeDialog: s.closeModuleSelectionDialog,
				isOpen: s.isModuleSelectionDialogOpen,
				openDialog: s.openModuleSelectionDialog,
				selectedTechData: s.selectedTechData,
			};
		},
		setState: (updates: Partial<ModuleSelectionDialogState>) => {
			const mappedUpdates: Partial<UiStore> = {};
			if ("isOpen" in updates) mappedUpdates.isModuleSelectionDialogOpen = updates.isOpen;
			if ("openDialog" in updates)
				mappedUpdates.openModuleSelectionDialog = updates.openDialog;
			if ("closeDialog" in updates)
				mappedUpdates.closeModuleSelectionDialog = updates.closeDialog;
			if ("selectedTechData" in updates)
				mappedUpdates.selectedTechData = updates.selectedTechData;
			useUiStore.setState(mappedUpdates);
		},
	},
);

/**
 * Backward-compatible custom hook for managing accessibility settings.
 */
export const useA11yStore = Object.assign(
	<T = A11yState>(selector?: (state: A11yState) => T): T => {
		return useUiStore(
			useShallow((s) => {
				const subState: A11yState = {
					a11yMode: s.a11yMode,
					setA11yMode: s.setA11yMode,
					toggleA11yMode: s.toggleA11yMode,
				};

				return selector ? selector(subState) : (subState as unknown as T);
			}),
		);
	},
	{
		getState: (): A11yState => {
			const s = useUiStore.getState();

			return {
				a11yMode: s.a11yMode,
				setA11yMode: s.setA11yMode,
				toggleA11yMode: s.toggleA11yMode,
			};
		},
		setState: (updates: Partial<A11yState>) => {
			useUiStore.setState(updates);
		},
	},
);

/**
 * Backward-compatible custom hook for tracking the status and errors of optimization solves.
 */
export const useOptimizeStore = Object.assign(
	<T = OptimizeState>(selector?: (state: OptimizeState) => T): T => {
		return useUiStore(
			useShallow((s) => {
				const subState: OptimizeState = {
					setPatternNoFitTech: s.setPatternNoFitTech,
					setProgressPercent: s.setProgressPercent,
					setShowError: s.setShowError,
					setSolving: s.setSolving,
					status: s.optimizeStatus,
				};

				return selector ? selector(subState) : (subState as unknown as T);
			}),
		);
	},
	{
		getState: (): OptimizeState => {
			const s = useUiStore.getState();

			return {
				setPatternNoFitTech: s.setPatternNoFitTech,
				setProgressPercent: s.setProgressPercent,
				setShowError: s.setShowError,
				setSolving: s.setSolving,
				status: s.optimizeStatus,
			};
		},
		setState: (updates: Partial<OptimizeState>) => {
			const mappedUpdates: Partial<UiStore> = {};
			if ("status" in updates) mappedUpdates.optimizeStatus = updates.status;
			if ("setSolving" in updates) mappedUpdates.setSolving = updates.setSolving;
			if ("setProgressPercent" in updates)
				mappedUpdates.setProgressPercent = updates.setProgressPercent;
			if ("setShowError" in updates) mappedUpdates.setShowError = updates.setShowError;
			if ("setPatternNoFitTech" in updates)
				mappedUpdates.setPatternNoFitTech = updates.setPatternNoFitTech;

			useUiStore.setState(mappedUpdates);
		},
	},
);

// Always expose for E2E if the flag is set
if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		useA11yStore?: typeof useA11yStore;
		useModuleSelectionStore?: unknown;
		useOptimizeStore?: typeof useOptimizeStore;
		useShakeStore?: typeof useShakeStore;
		useUiStore?: typeof useUiStore;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useUiStore"] = useUiStore;
		w["useShakeStore"] = useShakeStore;
		w["useA11yStore"] = useA11yStore;
		w["useOptimizeStore"] = useOptimizeStore;
	}
}
