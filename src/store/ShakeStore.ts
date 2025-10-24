// src/store/ShakeStore.ts
import { create } from "zustand";

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
 */
export const useShakeStore = create<ShakeState>((set) => ({
	shakeCount: 0,
	triggerShake: () => set((state) => ({ shakeCount: state.shakeCount + 1 })),
}));

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.useShakeStore = useShakeStore;
}
