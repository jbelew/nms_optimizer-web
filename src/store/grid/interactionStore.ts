import type { Cell } from "./gridStore";
import { create } from "zustand";

/**
 * State and actions for tracking user interactions with the grid.
 *
 * @category State
 */
export interface InteractionState {
	/** Internal state tracking for tap/double-tap logic. */
	_initialCellStateForTap: Cell | null;
	/** Row and column index of the last tapped cell. */
	_lastTapCell: [number, number];
	/** Timestamp of the last tap for double-tap detection. */
	_lastTapTime: number;
	/** Clears the temporary interaction state. */
	clearInteractionState: () => void;
	/** Sets the initial cell state for a potential double-tap revert/transition. */
	setInitialCellStateForTap: (cell: Cell | null) => void;
	/** Sets the last tap coordinates and timestamp. */
	setLastTap: (cell: [number, number], time: number) => void;
}

/**
 * Zustand store for managing grid-specific interaction state.
 *
 * Separates UI gesture tracking from the core grid data to improve
 * modularity and reduce the "god object" surface of the main grid store.
 */
export const useInteractionStore = create<InteractionState>((set) => ({
	_initialCellStateForTap: null,
	_lastTapCell: [-1, -1],
	_lastTapTime: 0,
	clearInteractionState: () =>
		set({
			_initialCellStateForTap: null,
			_lastTapCell: [-1, -1],
			_lastTapTime: 0,
		}),
	setInitialCellStateForTap: (cell) => set({ _initialCellStateForTap: cell }),
	setLastTap: (cell, time) =>
		set({
			_lastTapCell: cell,
			_lastTapTime: time,
		}),
}));

if (typeof window !== "undefined") {
	const w = window as typeof window & {
		__E2E_EXPOSE__?: boolean;
		useInteractionStore?: typeof useInteractionStore;
	};

	if (import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__) {
		w["useInteractionStore"] = useInteractionStore;
	}
}
