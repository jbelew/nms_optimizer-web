import { create } from "zustand";

/**
 * State and actions for tracking technology tree fetch status.
 */
interface TechTreeLoadingState {
	/** Whether the technology tree data is currently being fetched from the API. */
	isLoading: boolean;
	/** Sets the current loading state. */
	setLoading: (isLoading: boolean) => void;
}

/**
 * Zustand store for managing the global loading indicator for tech tree data.
 *
 * This store is used by the `useFetchTechTreeSuspense` hook and the `TechTree`
 * components to manage skeleton states and transitions.
 *
 * @returns {TechTreeLoadingState} The loading store state and actions.
 *
 * @example
 * const isLoading = useTechTreeLoadingStore((s) => s.isLoading);
 */
export const useTechTreeLoadingStore = create<TechTreeLoadingState>((set) => ({
	isLoading: true,
	setLoading: (isLoading) => set({ isLoading }),
}));
