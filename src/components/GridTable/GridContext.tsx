import React, { use, useMemo } from "react";

import { GridContext } from "./createGridContext";

/**
 * Hook to consume the Grid context.
 *
 * @throws {Error} If used outside of a GridProvider.
 */
export const useGridContext = () => {
	const context = use(GridContext);

	if (!context) {
		throw new Error("useGridContext must be used within a GridProvider");
	}

	return context;
};

/**
 * Provider for the Grid context.
 */
export const GridProvider: React.FC<{
	children: React.ReactNode;
	gridRef: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => {
	const contextValue = useMemo(() => ({ gridRef }), [gridRef]);

	return <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>;
};
