// src/store/OptimizeStore.ts
import { create } from "zustand";

/**
 * Types of errors that can occur during the optimization solve process.
 *
 * @see {@link useOptimizeStore}
 *
 * @category Optimization
 */
export type ErrorType = "fatal" | "recoverable";

/**
 * State and actions for tracking the status and errors of optimization solves.
 *
 * @see {@link useOptimizeStore}
 *
 * @category Optimization
 */
export interface OptimizeState {
	/** Whether the global error overlay is visible. */
	showError: boolean;
	/** The severity level of the active error. */
	errorType: ErrorType | null;
	/** The actual error object containing details of the failure. */
	error: Error | null;
	/**
	 * Updates the error visibility and metadata.
	 *
	 * @param {boolean} show - Whether to show the error overlay.
	 * @param {ErrorType} [type="recoverable"] - The severity of the error.
	 * @param {Error | null} [error=null] - The exception or error details.
	 */
	setShowError: (show: boolean, type?: ErrorType, error?: Error | null) => void;
	/** The technology identifier that failed to fit using pattern solving. */
	patternNoFitTech: string | null;
	/**
	 * Sets or clears the current "Pattern No Fit" technology warning.
	 *
	 * @param {string | null} tech - The technology key to set, or `null` to clear.
	 */
	setPatternNoFitTech: (tech: string | null) => void;
}

/**
 * Zustand store for managing UI-blocking errors and specific solver warnings.
 *
 * This store is used by the `useOptimize` hook to communicate solve failures
 * and warnings (like the "Pattern No Fit" alert) to the global UI layout.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<OptimizeState>>} The Zustand hook for optimization state.
 *
 * @see {@link OptimizeState}
 * @see {@link ErrorType}
 *
 * @category Optimization
 *
 * @example
 * const { showError, error } = useOptimizeStore();
 * // returns { showError: false, error: null }
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
