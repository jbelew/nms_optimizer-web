// src/store/OptimizeStore.ts
import { create } from "zustand";

/**
 * @interface OptimizeState
 * @property {boolean} showError - Whether to show an error message.
 * @property {(show: boolean) => void} setShowError - Function to set the showError state.
 * @property {string|null} patternNoFitTech - The technology for which a "Pattern No Fit" occurred.
 * @property {(tech: string|null) => void} setPatternNoFitTech - Function to set the patternNoFitTech state.
 */
interface OptimizeState {
	showError: boolean;
	setShowError: (show: boolean) => void;
	patternNoFitTech: string | null; // Tech for which "Pattern No Fit" occurred
	setPatternNoFitTech: (tech: string | null) => void;
}

/**
 * Zustand store for managing the state of the optimization process.
 */
export const useOptimizeStore = create<OptimizeState>((set) => ({
	showError: false,
	setShowError: (show) => set({ showError: show }),
	patternNoFitTech: null,
	setPatternNoFitTech: (tech) => set({ patternNoFitTech: tech }),
}));
