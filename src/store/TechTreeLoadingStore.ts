import { create } from "zustand";

interface TechTreeLoadingState {
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
}

export const useTechTreeLoadingStore = create<TechTreeLoadingState>((set) => ({
	isLoading: true,
	setLoading: (isLoading) => set({ isLoading }),
}));
