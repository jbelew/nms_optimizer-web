// src/store/app/shakeStore.ts
import { create } from "zustand";

/** Duration of the shake CSS animation in milliseconds. */
const SHAKE_ANIMATION_DURATION = 500;
let lastShakeTime = 0;

/**
 * State and actions for triggering UI shake animations.
 */
export interface ShakeState {
	/** Incremental counter used to trigger re-renders in components observing the shake. */
	shakeCount: number;
	/**
	 * Throttled function to initiate a shake animation.
	 *
	 * Animation is throttled to `SHAKE_ANIMATION_DURATION` to prevent multiple
	 * overlapping triggers.
	 */
	triggerShake: () => void;
}

/**
 * Zustand store for orchestrating a global "shake" effect.
 *
 * This is used to provide visual feedback when a user attempts an invalid
 * action (e.g., clicking a locked cell).
 *
 * @returns {ShakeState} The shake store state and actions.
 *
 * @example
 * const { triggerShake } = useShakeStore();
 * triggerShake();
 */
export const useShakeStore = create<ShakeState>((set) => ({
	shakeCount: 0,
	triggerShake: () => {
		const now = Date.now();

		if (now - lastShakeTime >= SHAKE_ANIMATION_DURATION) {
			lastShakeTime = now;
			set((state) => ({ shakeCount: state.shakeCount + 1 }));
		}
	},
}));

if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		useShakeStore?: typeof useShakeStore;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useShakeStore"] = useShakeStore;
	}
}
