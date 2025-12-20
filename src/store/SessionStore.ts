// src/store/SessionStore.ts
import { create } from "zustand";

/**
 * @interface SessionState
 * @property {number} supercharged_limit - Count of times user attempted to exceed supercharged cell limit
 * @property {number} supercharged_fixed - Count of times user attempted to modify supercharged cells while locked
 * @property {number} grid_fixed - Count of times user attempted to modify cells while entire grid is locked
 * @property {number} module_locked - Count of times user attempted to modify cells with an active module
 * @property {number} row_limit - Count of times user attempted to set supercharged cell in row > 3
 * @property {() => void} incrementSuperchargedLimit - Increment the supercharged limit counter
 * @property {() => void} incrementSuperchargedFixed - Increment the supercharged fixed counter
 * @property {() => void} incrementGridFixed - Increment the grid fixed counter
 * @property {() => void} incrementModuleLocked - Increment the module locked counter
 * @property {() => void} incrementRowLimit - Increment the row limit counter
 * @property {() => void} resetSession - Reset all session counters
 */
export interface SessionState {
	supercharged_limit: number;
	supercharged_fixed: number;
	grid_fixed: number;
	module_locked: number;
	row_limit: number;
	incrementSuperchargedLimit: () => void;
	incrementSuperchargedFixed: () => void;
	incrementGridFixed: () => void;
	incrementModuleLocked: () => void;
	incrementRowLimit: () => void;
	resetSession: () => void;
}

/**
 * Zustand store for managing session-level error/restriction tracking.
 * Tracks user interaction attempts that violate constraints during the current session.
 */
export const useSessionStore = create<SessionState>((set) => ({
	supercharged_limit: 0,
	supercharged_fixed: 0,
	grid_fixed: 0,
	module_locked: 0,
	row_limit: 0,
	incrementSuperchargedLimit: () => {
		set((state) => ({ supercharged_limit: state.supercharged_limit + 1 }));
	},
	incrementSuperchargedFixed: () => {
		set((state) => ({ supercharged_fixed: state.supercharged_fixed + 1 }));
	},
	incrementGridFixed: () => {
		set((state) => ({ grid_fixed: state.grid_fixed + 1 }));
	},
	incrementModuleLocked: () => {
		set((state) => ({ module_locked: state.module_locked + 1 }));
	},
	incrementRowLimit: () => {
		set((state) => ({ row_limit: state.row_limit + 1 }));
	},
	resetSession: () => {
		set({
			supercharged_limit: 0,
			supercharged_fixed: 0,
			grid_fixed: 0,
			module_locked: 0,
			row_limit: 0,
		});
	},
}));

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.useSessionStore = useSessionStore;
}
