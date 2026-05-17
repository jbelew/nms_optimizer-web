import { use } from "react";

import { GridContext } from "./createGridContext";

/**
 * Hook to consume the Grid context.
 *
 * @returns {import('./createGridContext').GridContextValue} The grid context value.
 *
 * @throws {Error} If used outside of a GridProvider.
 *
 */
export const useGridContext = () => {
	const context = use(GridContext);

	if (!context) {
		throw new Error("useGridContext must be used within a GridProvider");
	}

	return context;
};
