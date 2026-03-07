// src/store/OptimizeStore.ts
import { create } from "zustand";

/**
 * Types of errors that can occur during optimization.
 * 'fatal' errors typically require a reload, while 'recoverable' errors can be dismissed.
 */
export type ErrorType = "fatal" | "recoverable";

/**
 * State and actions for the optimization store.
 * @typedef {object} OptimizeState
 * @property {boolean} showError - Whether an error should be displayed to the user.
 * @property {ErrorType | null} errorType - The severity/type of the current error.
 * @property {Error | null} error - The actual error object, if any.
 * @property {(show: boolean, type?: ErrorType, error?: Error | null) => void} setShowError - Function to update error display state.
 * @property {string | null} patternNoFitTech - The technology that failed a pattern-based fit.
 * @property {(tech: string | null) => void} setPatternNoFitTech - Function to set the technology that failed a pattern-based fit.
 */
interface OptimizeState {
	showError: boolean;
	errorType: ErrorType | null;
	error: Error | null;
	setShowError: (show: boolean, type?: ErrorType, error?: Error | null) => void;
	patternNoFitTech: string | null;
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
