// src/store/ShakeStore.ts
import { create } from "zustand";

interface ShakeState {
	shaking: boolean;
	setShaking: (shaking: boolean) => void;
}

export const useShakeStore = create<ShakeState>((set) => ({
	shaking: false,
	setShaking: (shaking) => set({ shaking }),
}));
