import { create } from "zustand";

/**
 * @interface TechTreeLoadingState
 * @property {boolean} isLoading - Whether the tech tree is currently loading.
 * @property {(isLoading: boolean) => void} setLoading - Function to set the loading state.
 */
interface TechTreeLoadingState {
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
}

/**
 * Zustand store for managing the loading state of the tech tree.
 */
export const useTechTreeLoadingStore = create<TechTreeLoadingState>((set) => ({
	isLoading: true,
	setLoading: (isLoading) => set({ isLoading }),
}));
