// src/store/app/sessionStore.ts
import { create } from "zustand";

/**
 * State and actions for tracking user interactions and constraint violations during a single session.
 */
export interface SessionState {
	/** Count of attempts to modify any cell while the entire grid layout is locked. */
	grid_fixed: number;
	/** Increments the `grid_fixed` counter. */
	incrementGridFixed: () => void;
	/** Increments the `module_locked` counter. */
	incrementModuleLocked: () => void;
	/** Increments the `row_limit` counter. */
	incrementRowLimit: () => void;
	/** Increments the `supercharged_fixed` counter. */
	incrementSuperchargedFixed: () => void;
	/** Increments the `supercharged_limit` counter. */
	incrementSuperchargedLimit: () => void;
	/** Count of attempts to modify a cell that already contains a technology module. */
	module_locked: number;
	/** Resets all session violation counters to zero. */
	resetSession: () => void;
	/** Count of attempts to place a supercharged cell beyond the supported row limit (row > 3). */
	row_limit: number;
	/** Count of attempts to modify supercharged cells while the supercharged layout is locked. */
	supercharged_fixed: number;
	/** Count of attempts to exceed the supercharged cell limit. */
	supercharged_limit: number;
}

/**
 * Zustand store for tracking transient session-level interaction metrics.
 *
 * This store is primarily used by the `useErrorDispatcher` hook to determine when
 * a user has repeatedly attempted an invalid action and should be shown a helpful
 * error or warning message.
 *
 * @returns {SessionState} The session store state and actions.
 *
 * @example
 * const { incrementGridFixed } = useSessionStore();
 * incrementGridFixed();
 */
export const useSessionStore = create<SessionState>((set) => ({
	grid_fixed: 0,
	incrementGridFixed: () => {
		set((state) => ({ grid_fixed: state.grid_fixed + 1 }));
	},
	incrementModuleLocked: () => {
		set((state) => ({ module_locked: state.module_locked + 1 }));
	},
	incrementRowLimit: () => {
		set((state) => ({ row_limit: state.row_limit + 1 }));
	},
	incrementSuperchargedFixed: () => {
		set((state) => ({ supercharged_fixed: state.supercharged_fixed + 1 }));
	},
	incrementSuperchargedLimit: () => {
		set((state) => ({ supercharged_limit: state.supercharged_limit + 1 }));
	},
	module_locked: 0,
	resetSession: () => {
		set({
			grid_fixed: 0,
			module_locked: 0,
			row_limit: 0,
			supercharged_fixed: 0,
			supercharged_limit: 0,
		});
	},
	row_limit: 0,
	supercharged_fixed: 0,
	supercharged_limit: 0,
}));

if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		useSessionStore?: typeof useSessionStore;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useSessionStore"] = useSessionStore;
	}
}
