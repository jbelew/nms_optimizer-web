// src/store/OptimizeStore.ts
import { create } from "zustand";

export type ErrorType = "fatal" | "recoverable";

/**
 * @interface OptimizeState
 * @property {boolean} showError - Whether to show an error message.
 * @property {ErrorType|null} errorType - The type of error (fatal or recoverable).
 * @property {(show: boolean, type?: ErrorType) => void} setShowError - Function to set the showError state.
 * @property {string|null} patternNoFitTech - The technology for which a "Pattern No Fit" occurred.
 * @property {(tech: string|null) => void} setPatternNoFitTech - Function to set the patternNoFitTech state.
 */
interface OptimizeState {
	showError: boolean;
	errorType: ErrorType | null;
	error: Error | null;
	setShowError: (show: boolean, type?: ErrorType, error?: Error | null) => void;
	patternNoFitTech: string | null; // Tech for which "Pattern No Fit" occurred
	setPatternNoFitTech: (tech: string | null) => void;
}

/**
 * Zustand store for managing the state of the optimization process.
 */
export const useOptimizeStore = create<OptimizeState>((set) => ({
	showError: false,
	errorType: null,
	error: null,
	setShowError: (show, type = "recoverable", error = null) =>
		set({ showError: show, errorType: show ? type : null, error: show ? error : null }),
	patternNoFitTech: null,
	setPatternNoFitTech: (tech) => set({ patternNoFitTech: tech }),
}));
