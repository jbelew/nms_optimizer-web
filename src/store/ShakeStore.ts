// src/store/ShakeStore.ts
import { create } from "zustand";

/**
 * @interface ShakeState
 * @property {boolean} shaking - Whether the component should be shaking.
 * @property {(shaking: boolean) => void} setShaking - Function to set the shaking state.
 */
interface ShakeState {
	shaking: boolean;
	setShaking: (shaking: boolean) => void;
}

/**
 * Zustand store for managing the state of the shake animation.
 */
export const useShakeStore = create<ShakeState>((set) => ({
	shaking: false,
	setShaking: (shaking) => set({ shaking }),
}));
