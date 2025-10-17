import { create } from "zustand";
import { persist } from "zustand/middleware";

interface A11yState {
	a11yMode: boolean;
	setA11yMode: (a11yMode: boolean) => void;
	toggleA11yMode: () => void;
}

export const useA11yStore = create<A11yState>()(
	persist(
		(set) => ({
			a11yMode: false,
			setA11yMode: (a11yMode) => set({ a11yMode }),
			toggleA11yMode: () => set((state) => ({ a11yMode: !state.a11yMode })),
		}),
		{
			name: "nms-optimizer-a11y-mode", // name of the item in the storage (must be unique)
		}
	)
);
