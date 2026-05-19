// src/store/app/optimizeStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * State and actions for tracking the status and errors of optimization solves.
 *
 * @see {@link useOptimizeStore}
 *
 * @category State
 */
export interface OptimizeState {
	/**
	 * Sets or clears the current "Pattern No Fit" technology warning.
	 *
	 * @param {string | null} tech - The technology key to set, or `null` to clear.
	 */
	setPatternNoFitTech: (tech: null | string) => void;

	/**
	 * Updates the optimization progress percentage.
	 *
	 * @param {number} percent - The current progress percentage.
	 */
	setProgressPercent: (percent: number) => void;

	/**
	 * Updates the error visibility and metadata.
	 *
	 * @param {boolean} show - Whether to show the error overlay.
	 * @param {ErrorType} [severity="recoverable"] - The severity of the error.
	 * @param {Error | null} [details=null] - The exception or error details.
	 */
	setShowError: (show: boolean, severity?: ErrorType, details?: Error | null) => void;

	/**
	 * Updates the "solving" status.
	 *
	 * @param {boolean} solving - Whether an optimization is in progress.
	 */
	setSolving: (solving: boolean) => void;

	/** The current status of the optimization engine. */
	status: OptimizeStatus;
}

/**
 * Types of errors that can occur during the optimization solve process.
 *
 * @category State
 */
type ErrorType = "fatal" | "recoverable";

/**
 * Discriminated union representing the various states of the optimization engine.
 *
 * @category State
 */
type OptimizeStatus =
	| { details: Error | null; severity: ErrorType; type: "error" }
	| { progress: number; type: "solving" }
	| { tech: string; type: "warning" }
	| { type: "idle" };

/**
 * Zustand store for managing UI-blocking errors and specific solver warnings.
 *
 * This store is used by the `useOptimize` hook to communicate solve failures
 * and warnings (like the "Pattern No Fit" alert) to the global UI layout.
 *
 * @returns {import("zustand").UseBoundStore<import("zustand").StoreApi<OptimizeState>>} The Zustand hook for optimization state.
 *
 * @category State
 */
export const useOptimizeStore = create<OptimizeState>()(
	immer((set) => ({
		setPatternNoFitTech: (tech) =>
			set((state) => {
				state.status = tech
					? { tech, type: "warning" }
					: state.status.type === "warning"
						? { type: "idle" }
						: state.status;
			}),

		setProgressPercent: (percent) =>
			set((state) => {
				if (state.status.type === "solving") {
					state.status.progress = percent;
				}
			}),

		setShowError: (show, severity = "recoverable", details = null) =>
			set((state) => {
				state.status = show
					? { details, severity, type: "error" }
					: state.status.type === "error"
						? { type: "idle" }
						: state.status;
			}),

		setSolving: (solving) =>
			set((state) => {
				state.status = solving
					? { progress: 0, type: "solving" }
					: state.status.type === "solving"
						? { type: "idle" }
						: state.status;
			}),

		status: { type: "idle" },
	}))
);
