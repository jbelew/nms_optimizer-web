// src/store/ShakeStore.ts
import { create } from "zustand";

const SHAKE_ANIMATION_DURATION = 500; // ms - Duration of the shake animation
let lastShakeTime = 0;

/**
 * @interface ShakeState
 * @property {boolean} shaking - Whether the component should be shaking.
 * @property {(shaking: boolean) => void} setShaking - Function to set the shaking state.
 */
export interface ShakeState {
	shakeCount: number;
	triggerShake: () => void;
}

/**
 * Zustand store for managing the state of the shake animation.
 * Throttles shake events to prevent overlapping animations.
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

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.useShakeStore = useShakeStore;
}
