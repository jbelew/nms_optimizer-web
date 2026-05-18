import type { TechColor } from "@/types/tech";
import { create } from "zustand";

/**
 * State shape for the module selection dialog store.
 *
 * @remarks
 * Controls which technology's module selection dialog is currently visible.
 * Only one dialog can be open at a time. The store is intentionally flat
 * (no immer needed) to minimize overhead during TechTree scrolling.
 *
 * @see {@link import('@/components/ModuleSelectionDialog/SharedModuleSelectionDialog').SharedModuleSelectionDialog} for the consuming component.
 */
interface ModuleSelectionDialogState {
	/** Close the dialog and clear the active tech data. */
	closeDialog: () => void;
	/** Whether the dialog is currently visible. */
	isOpen: boolean;
	/** Open the dialog for a specific technology. */
	openDialog: (data: SelectedTechData) => void;
	/** The tech data for the currently-open dialog, or `null` if closed. */
	selectedTechData: null | SelectedTechData;
}

/**
 * Data payload describing the technology whose dialog is currently open.
 */
interface SelectedTechData {
	/** The unique technology key (e.g., 'pulse'). */
	tech: string;
	/** Theme color for the technology icon/avatar. */
	techColor: TechColor;
	/** Icon filename for the main technology. */
	techImage: null | string;
}

/**
 * Zustand store managing the single, shared module selection dialog.
 *
 * @remarks
 * Instead of each `TechTreeRow` mounting its own `ModuleSelectionDialog`,
 * rows call `openDialog()` with their tech data, and a single
 * `SharedModuleSelectionDialog` subscribes to this store.
 *
 * @example
 * ```ts
 * const { openDialog } = useModuleSelectionDialogStore();
 * openDialog({ tech: "pulse", techColor: "blue", techImage: "pulse.webp" });
 * ```
 */
export const useModuleSelectionDialogStore = create<ModuleSelectionDialogState>((set) => ({
	closeDialog: () => set({ isOpen: false, selectedTechData: null }),
	isOpen: false,
	openDialog: (data) => set({ isOpen: true, selectedTechData: data }),
	selectedTechData: null,
}));
